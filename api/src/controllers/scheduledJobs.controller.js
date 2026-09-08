import express from 'express';
import crypto from 'crypto';
import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { scheduledJobRuns, generateObjectId } from '../db/schema.js';
import { CheckMailingEmailService } from '../services/checkMail.service.js';
import { cleanUpOldDemoAccounts } from '../services/demo.service.js';

const router = express.Router();

function timingSafeEqual(a, b) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function authenticateScheduledJob(req, res, next) {
  const expected = process.env.SCHEDULED_JOB_SECRET;
  if (!expected) {
    return res.status(503).json({
      error:
        'SCHEDULED_JOB_SECRET is not configured on the server. Scheduled job endpoints are disabled.',
    });
  }

  const provided =
    req.headers['x-scheduled-job-token'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
      ? req.headers.authorization.slice('Bearer '.length)
      : null);

  if (!provided || !timingSafeEqual(String(provided), String(expected))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.use(authenticateScheduledJob);

const WINDOW_MS = {
  SendAdminProcessingDelayAlert: 2 * 60 * 60 * 1000, // 2h
  DemoAccountCleanup: 60 * 60 * 1000, // 1h
  ScheduledJobWatchdog: 60 * 60 * 1000, // 1h
};

// Expected cadence of each job (used by the watchdog). The watchdog flags a
// job if its most recent successful run is older than `expectedIntervalMs *
// safetyMultiplier`. Keep this list in sync with the routes below and with
// the external scheduler configuration.
const JOB_SCHEDULE = [
  {
    jobName: 'SendAdminProcessingDelayAlert',
    expectedIntervalMs: 2 * 60 * 60 * 1000, // every 2h
    safetyMultiplier: 2,
  },
  {
    jobName: 'SendAdminPendingChecksEmail',
    expectedIntervalMs: 24 * 60 * 60 * 1000, // daily
    safetyMultiplier: 2,
  },
  {
    jobName: 'DemoAccountCleanup',
    expectedIntervalMs: 60 * 60 * 1000, // hourly
    safetyMultiplier: 2,
  },
  {
    jobName: 'ScheduledJobWatchdog',
    expectedIntervalMs: 60 * 60 * 1000, // hourly (self-monitoring)
    safetyMultiplier: 2,
  },
];

function timeWindowKey(jobName, now = new Date()) {
  if (jobName === 'SendAdminPendingChecksEmail') {
    // Daily window keyed in America/New_York to match original 16:00 ET cadence.
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return `day:${fmt.format(now)}`;
  }
  const ms = WINDOW_MS[jobName];
  if (!ms) {
    // Fallback: 5-minute bucket so retries within a few minutes dedupe.
    const bucket = Math.floor(now.getTime() / (5 * 60 * 1000));
    return `bucket:${bucket}`;
  }
  const bucket = Math.floor(now.getTime() / ms);
  return `win:${bucket}`;
}

async function tryClaimRun(jobName, runKey) {
  const _id = generateObjectId();
  // INSERT ... ON CONFLICT DO NOTHING returning the row only when we actually claimed it.
  const inserted = await db
    .insert(scheduledJobRuns)
    .values({ _id, jobName, runKey, status: 'running' })
    .onConflictDoNothing({
      target: [scheduledJobRuns.jobName, scheduledJobRuns.runKey],
    })
    .returning({ _id: scheduledJobRuns._id });
  return inserted[0]?._id || null;
}

async function markRunResult(rowId, status, errorMessage) {
  await db
    .update(scheduledJobRuns)
    .set({
      status,
      finishedAt: new Date(),
      errorMessage: errorMessage ?? null,
      updatedAt: new Date(),
    })
    .where(sql`${scheduledJobRuns._id} = ${rowId}`);
}

async function runJob(jobName, task, req, res, next) {
  const startedAt = new Date();
  const idempotencyKey =
    req.headers['x-idempotency-key'] || req.body?.idempotencyKey || null;
  const runKey = idempotencyKey
    ? `key:${String(idempotencyKey).slice(0, 100)}`
    : timeWindowKey(jobName, startedAt);

  let rowId;
  try {
    rowId = await tryClaimRun(jobName, runKey);
  } catch (err) {
    console.error(
      `[scheduled-job] "${jobName}" failed to write idempotency ledger:`,
      err
    );
    return next(err);
  }

  if (!rowId) {
    console.info(
      `[scheduled-job] "${jobName}" duplicate invocation for runKey=${runKey} — skipping.`
    );
    return res.status(200).json({
      job: jobName,
      status: 'duplicate',
      runKey,
      message: 'Job already executed (or in progress) for this run key.',
    });
  }

  console.info(
    `[scheduled-job] "${jobName}" started at ${startedAt.toISOString()} (runKey=${runKey})`
  );
  try {
    const result = await task();
    const finishedAt = new Date();
    await markRunResult(rowId, 'succeeded', null);
    console.info(
      `[scheduled-job] "${jobName}" completed at ${finishedAt.toISOString()}`
    );
    res.status(200).json({
      job: jobName,
      status: 'ok',
      runKey,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      result: result ?? null,
    });
  } catch (err) {
    try {
      await markRunResult(
        rowId,
        'failed',
        err instanceof Error ? err.message : String(err)
      );
    } catch (ledgerErr) {
      console.error(
        `[scheduled-job] "${jobName}" failed and ledger update also failed:`,
        ledgerErr
      );
    }
    console.error(`[scheduled-job] "${jobName}" failed:`, err);
    next(err);
  }
}

async function findStaleJobs(now = new Date()) {
  // For each known job, find the timestamp of its most recent successful run
  // and compare against the configured threshold. A job that has *never*
  // recorded a successful run is also considered stale.
  const rows = await db
    .select({
      jobName: scheduledJobRuns.jobName,
      lastSuccessAt: sql`MAX(${scheduledJobRuns.startedAt})`.as('last_success_at'),
    })
    .from(scheduledJobRuns)
    .where(sql`${scheduledJobRuns.status} = 'succeeded'`)
    .groupBy(scheduledJobRuns.jobName);

  const lastByJob = new Map(rows.map((r) => [r.jobName, r.lastSuccessAt]));

  const stale = [];
  for (const def of JOB_SCHEDULE) {
    const thresholdMs = def.expectedIntervalMs * def.safetyMultiplier;
    const last = lastByJob.get(def.jobName);
    const lastDate = last ? new Date(last) : null;
    const ageMs = lastDate ? now.getTime() - lastDate.getTime() : null;
    if (lastDate == null || ageMs > thresholdMs) {
      stale.push({
        jobName: def.jobName,
        lastSuccessAt: lastDate,
        ageMs,
        thresholdMs,
      });
    }
  }
  return stale;
}

async function runWatchdogCheck() {
  const now = new Date();
  const stale = await findStaleJobs(now);
  console.info(
    `[scheduled-job-watchdog] checked ${JOB_SCHEDULE.length} jobs at ${now.toISOString()}; ${stale.length} stale`
  );
  if (stale.length) {
    for (const j of stale) {
      console.warn(
        `[scheduled-job-watchdog] STALE job=${j.jobName} lastSuccess=${
          j.lastSuccessAt ? j.lastSuccessAt.toISOString() : 'never'
        } ageMs=${j.ageMs} thresholdMs=${j.thresholdMs}`
      );
    }
    await CheckMailingEmailService.sendAdminScheduledJobStaleAlert(stale);
  }
  return {
    checkedAt: now.toISOString(),
    monitored: JOB_SCHEDULE.map((d) => d.jobName),
    staleCount: stale.length,
    stale: stale.map((j) => ({
      jobName: j.jobName,
      lastSuccessAt: j.lastSuccessAt ? j.lastSuccessAt.toISOString() : null,
      ageMs: j.ageMs,
      thresholdMs: j.thresholdMs,
    })),
  };
}

router.post('/watchdog', (req, res, next) =>
  runJob('ScheduledJobWatchdog', () => runWatchdogCheck(), req, res, next)
);

router.post('/admin-processing-delay-alert', (req, res, next) =>
  runJob(
    'SendAdminProcessingDelayAlert',
    () => CheckMailingEmailService.sendAdminProcessingDelayAlert(),
    req,
    res,
    next
  )
);

router.post('/admin-pending-checks-email', (req, res, next) =>
  runJob(
    'SendAdminPendingChecksEmail',
    () => CheckMailingEmailService.sendAdminPendingChecksEmail(),
    req,
    res,
    next
  )
);

router.post('/demo-account-cleanup', (req, res, next) =>
  runJob(
    'DemoAccountCleanup',
    () => cleanUpOldDemoAccounts(),
    req,
    res,
    next
  )
);

export default router;
