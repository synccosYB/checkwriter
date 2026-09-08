import type { Request, Response, NextFunction } from 'express';
import {
  createRequestQueryStats,
  queryStatsStorage,
  REQUEST_QUERY_COUNT_WARN,
  REQUEST_QUERY_TIME_WARN_MS,
  getPoolStats,
} from '../db/index.js';
import { logger } from '../utils/logger.js';

/**
 * Tracks the number of database queries and total time spent in the database
 * for each HTTP request. When a request crosses the configured thresholds
 * (REQUEST_QUERY_COUNT_WARN / REQUEST_QUERY_TIME_WARN_MS) we emit a warning
 * with the route, status, query count, total db time, and any slow queries
 * captured during the request. This is the primary signal for catching
 * regressions like a re-introduced N+1 pattern.
 */
export default function queryMetricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const stats = createRequestQueryStats();
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const totalMs = Number(process.hrtime.bigint() - start) / 1e6;
    const route = req.originalUrl || req.url;
    const tooManyQueries = stats.count >= REQUEST_QUERY_COUNT_WARN;
    const tooSlow = stats.totalMs >= REQUEST_QUERY_TIME_WARN_MS;
    if (tooManyQueries || tooSlow) {
      const pool = getPoolStats();
      logger.warn(
        `[db] request ${req.method} ${route} status=${res.statusCode} ` +
          `queries=${stats.count} dbMs=${stats.totalMs.toFixed(0)} ` +
          `totalMs=${totalMs.toFixed(0)} ` +
          `pool[total=${pool.total} idle=${pool.idle} waiting=${pool.waiting}/max=${pool.max}]` +
          (stats.slow.length
            ? ` slow=${JSON.stringify(stats.slow.map((s) => ({ ms: Math.round(s.ms), text: s.text })))}`
            : ''),
      );
    }
  });

  queryStatsStorage.run(stats, () => next());
}
