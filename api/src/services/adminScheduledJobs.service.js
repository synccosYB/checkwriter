import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { scheduledJobRuns } from '../db/schema.js';

const ALLOWED_STATUSES = ['running', 'succeeded', 'failed'];

function parsePaginationParams(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(
    200,
    Math.max(1, parseInt(query.limit || query.pageSize, 10) || 25)
  );
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

export async function adminListScheduledJobRuns(query = {}) {
  const { page, limit, offset } = parsePaginationParams(query);

  const cleanParam = (value) => {
    if (value === undefined || value === null) return null;
    const str = String(value).trim();
    if (!str || str === 'undefined' || str === 'null' || str === 'All') return null;
    return str;
  };

  const conditions = [];
  const jobNameFilter = cleanParam(query.jobName);
  if (jobNameFilter) {
    conditions.push(eq(scheduledJobRuns.jobName, jobNameFilter));
  }
  const statusFilter = cleanParam(query.status);
  if (statusFilter && ALLOWED_STATUSES.includes(statusFilter)) {
    conditions.push(eq(scheduledJobRuns.status, statusFilter));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const baseQuery = db.select().from(scheduledJobRuns);
  const rowsPromise = (whereClause ? baseQuery.where(whereClause) : baseQuery)
    .orderBy(desc(scheduledJobRuns.startedAt))
    .limit(limit)
    .offset(offset);

  const countQueryBase = db
    .select({ count: sql`count(*)`.mapWith(Number) })
    .from(scheduledJobRuns);
  const countPromise = whereClause
    ? countQueryBase.where(whereClause)
    : countQueryBase;

  const [rows, countRows] = await Promise.all([rowsPromise, countPromise]);
  const total = countRows[0]?.count || 0;

  const data = rows.map((row) => {
    const startedAt = row.startedAt ? new Date(row.startedAt) : null;
    const finishedAt = row.finishedAt ? new Date(row.finishedAt) : null;
    const durationMs =
      startedAt && finishedAt ? finishedAt.getTime() - startedAt.getTime() : null;
    return {
      _id: row._id,
      jobName: row.jobName,
      runKey: row.runKey,
      status: row.status,
      startedAt,
      finishedAt,
      durationMs,
      errorMessage: row.errorMessage || null,
    };
  });

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data,
    pagination: { page, limit, total, totalPages },
  };
}

export async function adminGetScheduledJobJobNames() {
  const rows = await db
    .selectDistinct({ jobName: scheduledJobRuns.jobName })
    .from(scheduledJobRuns)
    .orderBy(scheduledJobRuns.jobName);
  return rows.map((r) => r.jobName);
}

export async function adminGetScheduledJobRunsSummary() {
  // Last successful run per job, plus last run (any status) for context.
  const rows = await db.execute(sql`
    WITH ranked AS (
      SELECT
        job_name,
        status,
        started_at,
        finished_at,
        error_message,
        ROW_NUMBER() OVER (PARTITION BY job_name ORDER BY started_at DESC) AS rn_any,
        ROW_NUMBER() OVER (
          PARTITION BY job_name, (status = 'succeeded')
          ORDER BY started_at DESC
        ) AS rn_per_status
      FROM scheduled_job_runs
    )
    SELECT
      job_name,
      MAX(CASE WHEN rn_any = 1 THEN status END) AS last_status,
      MAX(CASE WHEN rn_any = 1 THEN started_at END) AS last_started_at,
      MAX(CASE WHEN rn_any = 1 THEN finished_at END) AS last_finished_at,
      MAX(CASE WHEN rn_any = 1 THEN error_message END) AS last_error_message,
      MAX(CASE WHEN status = 'succeeded' AND rn_per_status = 1 THEN started_at END) AS last_success_started_at,
      MAX(CASE WHEN status = 'succeeded' AND rn_per_status = 1 THEN finished_at END) AS last_success_finished_at
    FROM ranked
    GROUP BY job_name
    ORDER BY job_name ASC
  `);

  const list = (rows.rows || rows).map((r) => {
    const lastStartedAt = r.last_started_at ? new Date(r.last_started_at) : null;
    const lastFinishedAt = r.last_finished_at ? new Date(r.last_finished_at) : null;
    const lastSuccessStartedAt = r.last_success_started_at
      ? new Date(r.last_success_started_at)
      : null;
    const lastSuccessFinishedAt = r.last_success_finished_at
      ? new Date(r.last_success_finished_at)
      : null;
    return {
      jobName: r.job_name,
      lastStatus: r.last_status,
      lastStartedAt,
      lastFinishedAt,
      lastErrorMessage: r.last_error_message || null,
      lastSuccessStartedAt,
      lastSuccessFinishedAt,
      lastSuccessDurationMs:
        lastSuccessStartedAt && lastSuccessFinishedAt
          ? lastSuccessFinishedAt.getTime() - lastSuccessStartedAt.getTime()
          : null,
    };
  });

  return { data: list };
}
