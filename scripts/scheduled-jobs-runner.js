#!/usr/bin/env node
/**
 * Hourly scheduled-jobs runner.
 *
 * Designed to be invoked by an external scheduler (Replit Scheduled
 * Deployment, GitHub Actions cron, etc.) once per hour. It calls the
 * three scheduled-job endpoints on the API; the API's idempotency
 * ledger (scheduled_job_runs) collapses duplicate invocations within
 * each job's natural window, so it is safe to call every endpoint on
 * every hourly run:
 *
 *   - POST /api/scheduled-jobs/admin-processing-delay-alert
 *       desired cadence: every 2 hours
 *       server window:   2h bucket  -> at most one run per 2h
 *
 *   - POST /api/scheduled-jobs/admin-pending-checks-email
 *       desired cadence: daily at 16:00 America/New_York
 *       server window:   daily ET key
 *       This runner only fires it during the 16:00 ET hour so the
 *       daily run lands at the intended local time.
 *
 *   - POST /api/scheduled-jobs/demo-account-cleanup
 *       desired cadence: hourly
 *       server window:   1h bucket
 *
 * Required environment variables:
 *   SCHEDULED_JOBS_API_URL  Base URL of the deployed API, including the
 *                           /api prefix. Example:
 *                             https://my-api.replit.app/api
 *   SCHEDULED_JOB_SECRET    Shared secret; must match the value set on
 *                           the API deployment.
 *
 * Optional:
 *   SCHEDULED_JOBS_FORCE_PENDING_CHECKS=1
 *       Force the daily pending-checks email call this run regardless
 *       of the current ET hour. Useful for one-off manual triggers.
 *   SCHEDULED_JOBS_TIMEOUT_MS  Per-request timeout (default 120000).
 *
 * Exit code: 0 if every attempted call returned 2xx, 1 otherwise.
 */

const BASE_URL = (process.env.SCHEDULED_JOBS_API_URL || '').replace(/\/+$/, '');
const SECRET = process.env.SCHEDULED_JOB_SECRET || '';
const TIMEOUT_MS = Number(process.env.SCHEDULED_JOBS_TIMEOUT_MS || 120000);
const FORCE_PENDING_CHECKS =
  process.env.SCHEDULED_JOBS_FORCE_PENDING_CHECKS === '1' ||
  process.env.SCHEDULED_JOBS_FORCE_PENDING_CHECKS === 'true';

if (!BASE_URL) {
  console.error(
    '[scheduled-jobs-runner] SCHEDULED_JOBS_API_URL is not set. ' +
      'Set it to e.g. https://<api-host>/api'
  );
  process.exit(1);
}
if (!SECRET) {
  console.error(
    '[scheduled-jobs-runner] SCHEDULED_JOB_SECRET is not set.'
  );
  process.exit(1);
}

function currentEtHour(now = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    hour12: false,
  });
  return Number(fmt.format(now));
}

async function callEndpoint(path) {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-scheduled-job-token': SECRET,
      },
      body: '{}',
      signal: controller.signal,
    });
    const text = await res.text();
    let body = text;
    try {
      body = JSON.parse(text);
    } catch (_) {
      /* keep as text */
    }
    const elapsed = Date.now() - startedAt;
    const ok = res.status >= 200 && res.status < 300;
    console.log(
      `[scheduled-jobs-runner] ${path} -> HTTP ${res.status} in ${elapsed}ms`,
      typeof body === 'string' ? body.slice(0, 500) : body
    );
    return ok;
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    console.error(
      `[scheduled-jobs-runner] ${path} FAILED after ${elapsed}ms:`,
      err && err.message ? err.message : err
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const now = new Date();
  const etHour = currentEtHour(now);
  console.log(
    `[scheduled-jobs-runner] start ${now.toISOString()} (ET hour=${etHour}) base=${BASE_URL}`
  );

  const tasks = [
    { path: '/scheduled-jobs/admin-processing-delay-alert', run: true },
    { path: '/scheduled-jobs/demo-account-cleanup', run: true },
    {
      path: '/scheduled-jobs/admin-pending-checks-email',
      run: FORCE_PENDING_CHECKS || etHour === 16,
    },
  ];

  let allOk = true;
  for (const t of tasks) {
    if (!t.run) {
      console.log(
        `[scheduled-jobs-runner] skip ${t.path} (not in scheduled window)`
      );
      continue;
    }
    const ok = await callEndpoint(t.path);
    if (!ok) allOk = false;
  }

  console.log(
    `[scheduled-jobs-runner] done ${new Date().toISOString()} ok=${allOk}`
  );
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error('[scheduled-jobs-runner] fatal:', err);
  process.exit(1);
});
