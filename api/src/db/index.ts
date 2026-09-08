import pg from 'pg';
import type { PoolConfig, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { AsyncLocalStorage } from 'node:async_hooks';
import * as schema from './schema.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

// node-postgres forwards arbitrary connection-time options to libpq, but its
// PoolConfig type only declares the most common ones. statement_timeout is a
// real, supported option — extend the type rather than escaping it with `any`.
type ExtendedPoolConfig = PoolConfig & {
  statement_timeout?: number;
  allowExitOnIdle?: boolean;
};

/**
 * Pool sizing for a request-driven Replit runtime.
 *
 * The API instance can sleep when idle and wake on request, so we explicitly
 * keep the pool small and let connections drain quickly when nothing is
 * happening. This keeps the database from holding open dozens of idle
 * connections that the app no longer needs.
 *
 * Override via env if a deployment really needs a different shape.
 */
const PG_POOL_MAX = parseInt(process.env.PG_POOL_MAX || '10', 10);
const PG_POOL_MIN = parseInt(process.env.PG_POOL_MIN || '0', 10);
const PG_IDLE_TIMEOUT_MS = parseInt(process.env.PG_IDLE_TIMEOUT_MS || '10000', 10);
const PG_CONNECTION_TIMEOUT_MS = parseInt(process.env.PG_CONNECTION_TIMEOUT_MS || '5000', 10);
const PG_STATEMENT_TIMEOUT_MS = parseInt(process.env.PG_STATEMENT_TIMEOUT_MS || '30000', 10);

const poolConfig: ExtendedPoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: PG_POOL_MAX,
  min: PG_POOL_MIN,
  idleTimeoutMillis: PG_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: PG_CONNECTION_TIMEOUT_MS,
  statement_timeout: PG_STATEMENT_TIMEOUT_MS,
};

const pool = new Pool(poolConfig);

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

/* ---------------------------------------------------------------------------
 * Query instrumentation
 *
 * Lightweight visibility into database behaviour so we can spot regressions
 * (e.g. a re-introduced N+1 pattern, runaway slow query, or pool saturation)
 * before they become user-visible:
 *
 *   1. SLOW_QUERY_MS — any single query taking longer than this threshold is
 *      logged at warn level with its (truncated) SQL text.
 *   2. AsyncLocalStorage — per-request counters so the request middleware can
 *      summarise query count / total db time and flag fan-out.
 *   3. Periodic pool sampling — when enabled, log pool size / idle / waiting
 *      counts so saturation shows up in production logs.
 *
 * Tunables (all env-driven, all optional):
 *   SLOW_QUERY_MS              default 500   ms threshold for slow query log
 *   REQUEST_QUERY_COUNT_WARN   default 50    per-request query count warning
 *   REQUEST_QUERY_TIME_WARN_MS default 1000  per-request total db time warn
 *   POOL_SAMPLE_INTERVAL_MS    default 0     0 disables periodic sampling
 * ------------------------------------------------------------------------ */

export const SLOW_QUERY_MS = parseInt(process.env.SLOW_QUERY_MS || '500', 10);
export const REQUEST_QUERY_COUNT_WARN = parseInt(
  process.env.REQUEST_QUERY_COUNT_WARN || '50',
  10,
);
export const REQUEST_QUERY_TIME_WARN_MS = parseInt(
  process.env.REQUEST_QUERY_TIME_WARN_MS || '1000',
  10,
);
const POOL_SAMPLE_INTERVAL_MS = parseInt(
  process.env.POOL_SAMPLE_INTERVAL_MS || '0',
  10,
);

export type RequestQueryStats = {
  count: number;
  totalMs: number;
  slow: { ms: number; text: string }[];
};

export const queryStatsStorage = new AsyncLocalStorage<RequestQueryStats>();

export function createRequestQueryStats(): RequestQueryStats {
  return { count: 0, totalMs: 0, slow: [] };
}

function truncateSql(input: unknown): string {
  const text = typeof input === 'string' ? input : (input as { text?: string })?.text || String(input);
  const collapsed = text.replace(/\s+/g, ' ').trim();
  return collapsed.length > 200 ? `${collapsed.slice(0, 200)}…` : collapsed;
}

function recordQuery(sql: unknown, ms: number): void {
  const store = queryStatsStorage.getStore();
  if (store) {
    store.count += 1;
    store.totalMs += ms;
    if (ms >= SLOW_QUERY_MS) {
      store.slow.push({ ms, text: truncateSql(sql) });
    }
  }
  if (ms >= SLOW_QUERY_MS) {
    logger.warn(`[db] slow query ${ms.toFixed(0)}ms: ${truncateSql(sql)}`);
  }
}

// Wrap pool.query so every direct query (the path drizzle uses outside of
// transactions) is timed. We preserve the original signature by delegating to
// the underlying implementation and timing around it.
const originalPoolQuery = pool.query.bind(pool) as typeof pool.query;
(pool as unknown as { query: unknown }).query = function instrumentedPoolQuery(
  ...args: unknown[]
): unknown {
  const start = process.hrtime.bigint();
  const sql = args[0];
  const finish = () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    recordQuery(sql, ms);
  };
  // Callback form: pg invokes the callback when done.
  const last = args[args.length - 1];
  if (typeof last === 'function') {
    const cb = last as (...cbArgs: unknown[]) => void;
    args[args.length - 1] = (...cbArgs: unknown[]) => {
      finish();
      cb(...cbArgs);
    };
    return (originalPoolQuery as unknown as (...a: unknown[]) => unknown).apply(pool, args);
  }
  // Promise form.
  const result = (originalPoolQuery as unknown as (...a: unknown[]) => unknown).apply(pool, args) as
    | Promise<QueryResult<QueryResultRow>>
    | QueryResult<QueryResultRow>;
  if (result && typeof (result as Promise<unknown>).then === 'function') {
    return (result as Promise<QueryResult<QueryResultRow>>).then(
      (v) => {
        finish();
        return v;
      },
      (err) => {
        finish();
        throw err;
      },
    );
  }
  finish();
  return result;
};

// Wrap pool.connect so checked-out clients (used for transactions) also
// surface their query timings.
const originalPoolConnect = pool.connect.bind(pool) as typeof pool.connect;
const instrumentClient = (client: PoolClient | undefined): PoolClient | undefined => {
  if (!client) return client;
  const clientWithFlag = client as PoolClient & { __queryInstrumented?: boolean };
  if (clientWithFlag.__queryInstrumented) return client;
  clientWithFlag.__queryInstrumented = true;
  const originalClientQuery = client.query.bind(client) as typeof client.query;
  (client as unknown as { query: unknown }).query = function instrumentedClientQuery(
    ...qArgs: unknown[]
  ): unknown {
    const start = process.hrtime.bigint();
    const sql = qArgs[0];
    const finish = () => {
      const ms = Number(process.hrtime.bigint() - start) / 1e6;
      recordQuery(sql, ms);
    };
    const last = qArgs[qArgs.length - 1];
    if (typeof last === 'function') {
      const cb = last as (...cbArgs: unknown[]) => void;
      qArgs[qArgs.length - 1] = (...cbArgs: unknown[]) => {
        finish();
        cb(...cbArgs);
      };
      return (originalClientQuery as unknown as (...a: unknown[]) => unknown).apply(client, qArgs);
    }
    const result = (originalClientQuery as unknown as (...a: unknown[]) => unknown).apply(client, qArgs) as
      | Promise<QueryResult<QueryResultRow>>
      | QueryResult<QueryResultRow>;
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      return (result as Promise<QueryResult<QueryResultRow>>).then(
        (v) => {
          finish();
          return v;
        },
        (err) => {
          finish();
          throw err;
        },
      );
    }
    finish();
    return result;
  };
  return client;
};

(pool as unknown as { connect: unknown }).connect = function instrumentedConnect(
  ...args: unknown[]
): unknown {
  const maybeCallback = args[0];
  if (typeof maybeCallback === 'function') {
    const cb = maybeCallback as (err: Error | undefined, client?: PoolClient, done?: () => void) => void;
    return (originalPoolConnect as unknown as (...a: unknown[]) => unknown).call(
      pool,
      (err: Error | undefined, client?: PoolClient, done?: () => void) => {
        if (!err) instrumentClient(client);
        cb(err, client, done);
      },
    );
  }
  const result = (originalPoolConnect as unknown as (...a: unknown[]) => unknown).apply(pool, args);
  if (result && typeof (result as Promise<unknown>).then === 'function') {
    return (result as Promise<PoolClient | undefined>).then((client) => {
      instrumentClient(client);
      return client as PoolClient;
    });
  }
  instrumentClient(result as PoolClient | undefined);
  return result;
};

export type PoolStatsSnapshot = {
  total: number;
  idle: number;
  waiting: number;
  max: number;
};

export function getPoolStats(): PoolStatsSnapshot {
  const p = pool as unknown as { totalCount: number; idleCount: number; waitingCount: number };
  return {
    total: p.totalCount,
    idle: p.idleCount,
    waiting: p.waitingCount,
    max: PG_POOL_MAX,
  };
}

if (POOL_SAMPLE_INTERVAL_MS > 0) {
  const timer = setInterval(() => {
    const s = getPoolStats();
    // Only log when the pool is doing something interesting so an idle
    // instance does not spam logs with all-zero samples.
    if (s.total > 0 || s.waiting > 0) {
      logger.info(
        `[db] pool total=${s.total} idle=${s.idle} waiting=${s.waiting} max=${s.max}`,
      );
    }
    if (s.waiting > 0) {
      logger.warn(`[db] pool saturation: ${s.waiting} request(s) waiting for a connection (max=${s.max})`);
    }
  }, POOL_SAMPLE_INTERVAL_MS);
  // Don't keep the event loop alive just for sampling — important on
  // request-driven autosleep deployments.
  timer.unref();
}

export const db = drizzle(pool, { schema });
export { pool };
export * from './schema.js';
