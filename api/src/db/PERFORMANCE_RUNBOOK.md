# Database Performance Runbook

This document explains the lightweight query instrumentation that runs in the
API and how to respond when its thresholds are exceeded. It complements the
recent N+1 cleanup and connection-pool tuning by giving us ongoing visibility
into query speed, query fan-out, and pool saturation.

## What is instrumented

Implemented in `api/src/db/index.ts` and
`api/src/middlewares/queryMetrics.middleware.ts`:

1. **Per-query timing.** Both `pool.query` and any client checked out via
   `pool.connect()` (the path `drizzle` uses for transactions) are wrapped to
   measure elapsed wall time per query.
2. **Slow-query log.** Any single query above `SLOW_QUERY_MS` is logged at
   `warn` level with the truncated SQL text, e.g.
   `[warn] [db] slow query 812ms: SELECT ... FROM checks WHERE ...`.
3. **Per-request summary.** An `AsyncLocalStorage` context counts the number
   of queries and total db time per HTTP request. When a request crosses
   `REQUEST_QUERY_COUNT_WARN` queries or `REQUEST_QUERY_TIME_WARN_MS` of total
   db time, the middleware emits a `warn` line with route, method, status,
   query count, total db time, total request time, current pool stats, and the
   slow queries captured during that request.
4. **Pool sampling (opt-in).** When `POOL_SAMPLE_INTERVAL_MS > 0` a periodic
   sampler logs `total / idle / waiting / max` pool counts, and always warns
   when `waiting > 0` (saturation).

All instrumentation is in-process and synchronous around the pg driver — no
extra dependencies.

## Tunables

| Env var | Default | Purpose |
| --- | --- | --- |
| `SLOW_QUERY_MS` | `500` | Threshold (ms) above which a single query is logged. |
| `REQUEST_QUERY_COUNT_WARN` | `50` | Per-request query count that triggers a warning. |
| `REQUEST_QUERY_TIME_WARN_MS` | `1000` | Per-request total db time (ms) that triggers a warning. |
| `POOL_SAMPLE_INTERVAL_MS` | `0` (off) | Interval (ms) for periodic pool snapshots. Suggested `30000` on long-running deployments; leave `0` on the request-driven autosleep API. |
| `PG_POOL_MAX` | `10` | Pool ceiling. |
| `PG_STATEMENT_TIMEOUT_MS` | `30000` | Server-side statement timeout. |

`logger.warn` is always emitted in production (the default log level), so
these signals appear in deployment logs without any additional setup.

## How to view the data

* **Production logs** (Replit Deployments → Logs): filter for `[db]` to see
  slow-query lines, per-request summaries, and pool snapshots.
* **Local dev**: same prefix; set `LOG_LEVEL=info` to also see the periodic
  pool snapshots.
* **Database side**: enable `pg_stat_statements` on the Postgres instance for
  aggregated query stats independent of the app. To turn it on:

  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
  -- then query the worst offenders, e.g.
  SELECT query, calls, mean_exec_time, total_exec_time
    FROM pg_stat_statements
    ORDER BY mean_exec_time DESC
    LIMIT 20;
  ```

  This is optional — the in-app instrumentation above is the primary signal.

## Runbook: what to do when a threshold trips

### 1. Slow-query warning (`[db] slow query …`)

* Grab the SQL text from the log line.
* Run `EXPLAIN (ANALYZE, BUFFERS)` against a representative dataset.
* Common fixes: missing index, accidental sequential scan, an `IN (…)` list
  that should be a join, or a left-join fan-out producing duplicate rows.
* If the query is unavoidable (report, export), confirm it is gated behind a
  background job or a non-critical endpoint.

### 2. Per-request warning (`[db] request … queries=NN dbMs=NN`)

* `queries` ≥ `REQUEST_QUERY_COUNT_WARN` is the classic N+1 signature. Look at
  the route — usually a list endpoint that loads relations one-at-a-time.
  Replace with a single join, `IN (…)` batch, or a Drizzle `with: { … }`
  relation include.
* `dbMs` high but `queries` low usually means a single expensive query.
  Follow the slow-query runbook above for the worst entry in the `slow=` list.
* Compare `totalMs` vs `dbMs` to see whether the bottleneck is the database
  or downstream work (third-party API, CPU, etc).

### 3. Pool saturation (`[db] pool saturation: N request(s) waiting …`)

* `waiting > 0` for more than a brief spike means requests are blocked
  waiting for a connection. Check:
  1. Is there a long-running query holding a connection? Cross-reference with
     slow-query logs around the same timestamp.
  2. Is `PG_POOL_MAX` too small for the current workload? Bump it modestly
     (the database has its own connection ceiling — coordinate before raising
     it materially).
  3. Are background jobs / cron consuming connections concurrently with API
     traffic? Stagger them or move to a dedicated worker.
* `total` close to `max` for sustained periods is a leading indicator — act
  before `waiting` starts climbing.

### 4. Connection errors (`Unexpected error on idle PostgreSQL client`)

* Usually a transient network blip; the pool will reconnect automatically.
* If repeated, check Postgres availability and credentials, then restart the
  workflow.

## Tuning thresholds

The defaults are intentionally conservative. If the warn lines are noisy for a
known-slow but acceptable endpoint, raise the env var rather than removing the
instrumentation. If a regression is suspected, lower `SLOW_QUERY_MS` /
`REQUEST_QUERY_COUNT_WARN` temporarily to surface borderline cases.
