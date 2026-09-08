# Synccos Check Writer

## Overview
Synccos Check Writer is a full-stack web application designed to streamline check writing and payment management. Its core purpose is to provide a comprehensive solution for creating and managing checks, integrating with financial services, and offering flexible payment options. Key capabilities include robust user authentication, efficient check creation, payee management, QuickBooks integration, generation of payment links, subscription management, and advanced administrative controls. The project aims to offer a user-friendly and powerful tool for businesses to handle their payment workflows effectively, reducing manual effort and improving accuracy.

## User Preferences
- Prefers minimal changes to existing backend routes

## System Architecture

### Monorepo Structure
The project uses a monorepo setup with a root `package.json` for unified `build`, `start`, and `dev` scripts, managing both client and API.

### Frontend (client/)
- **Framework**: React 18 with Create React App.
- **Language**: JavaScript/TypeScript.
- **State Management**: Redux Toolkit and React Query (TanStack Query).
- **UI Library**: Material UI (MUI) v5.
- **Routing**: React Router v5.
- **Mobile Integration**: Capacitor for native iOS and Android projects.
- **UI/UX**: Features a professional fintech design system with a navy/slate palette, warm gold accents, and clean white surfaces. Authentication pages are redesigned with a split-panel layout, and responsive design is implemented throughout.

### Backend (api/)
- **Framework**: Express.js.
- **Language**: TypeScript.
- **Database**: PostgreSQL via Drizzle ORM.
- **Deployment**: Uses `tsx` in production to handle ESM module resolution.
- **Startup Resilience**: The app initialization (`setupApp()`) uses retry logic (3 attempts with 5-second delays) and idempotent guards to prevent duplicate middleware/route registration. Health-check endpoints (`/health-check`, `/api/health-check`) report `starting`, `ready`, or `failed` status with 503 codes when not ready. Startup steps are logged with `[startup]` prefix for production debugging.
- **Scheduled Jobs (HTTP-triggered)**: The API runs no in-process timers, intervals, or cron loops. Recurring work is exposed as authenticated HTTP endpoints under `/scheduled-jobs/*` (also reachable at `/api/scheduled-jobs/*` in production) and is invoked by an external scheduler. Each request must include the shared secret in the `x-scheduled-job-token` header (or `Authorization: Bearer <token>`); the secret is read from the `SCHEDULED_JOB_SECRET` environment variable. If the env var is unset, the endpoints return 503 (fail-closed). Endpoints: `POST /scheduled-jobs/admin-processing-delay-alert` (every 2 hours), `POST /scheduled-jobs/admin-pending-checks-email` (daily 16:00 America/New_York), `POST /scheduled-jobs/demo-account-cleanup` (hourly). Idempotency is enforced by the `scheduled_job_runs` table (unique on `job_name` + `run_key`): callers may pass `x-idempotency-key` (or `idempotencyKey` in the JSON body) to dedupe explicitly; otherwise the controller derives a per-job time-window key (daily ET for the pending-checks email, 2h bucket for the delay alert, 1h bucket for demo cleanup). Duplicate invocations short-circuit with HTTP 200 and `status: "duplicate"` without re-running the work. The `node-cron` and `node-schedule` packages have been removed.

  **External scheduler wiring.** Two ready-to-use options are checked into the repo; pick one (not both) and configure it against the deployed API:

  1. **Replit Scheduled Deployment (recommended).** The repo includes `scripts/scheduled-jobs-runner.js`, a self-contained Node 20 script that POSTs to all three endpoints in one run, gated by the current ET hour for the daily job. The API's idempotency ledger collapses duplicates, so the script is safe to invoke every hour.
     - In the Publishing UI, add a second deployment of type **Scheduled** on this Repl.
     - Schedule: **every 1 hour** (cron `0 * * * *`).
     - Run command: `node scripts/scheduled-jobs-runner.js`
     - Build command: leave empty (no build needed; the script uses only Node built-ins).
     - Secrets on the scheduled deployment: `SCHEDULED_JOBS_API_URL` (e.g. `https://<api-host>/api`, must include the `/api` suffix and no trailing slash) and `SCHEDULED_JOB_SECRET` (same value as on the API deployment).
     - Manual one-off trigger of the daily pending-checks email: set `SCHEDULED_JOBS_FORCE_PENDING_CHECKS=1` and run the script once.

  2. **GitHub Actions cron (alternative).** `.github/workflows/scheduled-jobs.yml` defines four cron triggers — `0 */2 * * *` (delay alert), `0 * * * *` (demo cleanup), and both `0 20 * * *` + `0 21 * * *` (pending-checks email at 16:00 ET, covering EDT and EST since GitHub cron is UTC-only and ignores DST; the daily ET idempotency key collapses the two UTC fires into one run per local day). It also exposes `workflow_dispatch` for manual triggers. Required repo secrets: `SCHEDULED_JOBS_API_URL` and `SCHEDULED_JOB_SECRET`.

  Verify the wiring after first deploy by tailing the API deployment logs for `[scheduled-job]` lines, hitting one of the endpoints manually with `curl -X POST -H "x-scheduled-job-token: $SCHEDULED_JOB_SECRET" "$SCHEDULED_JOBS_API_URL/scheduled-jobs/demo-account-cleanup"`, and checking that subsequent runs within the same window return `{"status":"duplicate"}`.
- **Proxy Configuration**: In development, CRA proxies API requests to `http://localhost:7777`. In production, the API is deployed standalone (no static file serving) and exposes only `/api/*` plus health-check endpoints. The React client is hosted as a separate Static Deployment (see "Production Deployment Split" below).
- **CORS**: In production CORS only allows the comma-separated origins in `FRONTEND_URL`, any `*.replit.app` / `*.replit.dev` host, and same-origin / non-browser requests (no permissive fallback when `FRONTEND_URL` is unset). In development all origins are allowed.
- **Token Refresh**: Token refresh calls must use a standalone `axios.post()` (not `this.axiosInstance`) to avoid double-prefixing the URL with the instance's `baseURL`. The refresh endpoint is `${REACT_APP_BASE_URL}/auth/refresh-token`.
- **Admin API**: Includes protected `/admin/*` endpoints for full CRUD operations on core entities (checks, banks, payees, organizations), user management (activation, deactivation, subscription overrides), observability (audit logs, integrations, attachments, check imports), and platform settings management.
- **Post-Merge Caution**: Task merges have introduced unclosed route handler blocks in controllers (missing `} catch (err) { next(err); } });`). Always verify brace balance after merges to `admin.controller.js` and other large controller files.
- **Bank Autofill**: Enhanced bank lookup service providing comprehensive bank details (name, routing number, address, phone, logo) and autocomplete search functionality. Integrates with internal bank data and external APIs.

### Testing & Validation
- **API tests**: Run with `npm test` inside `api/` (Node's built-in test runner via `tsx`; the script uses `find` to collect all `src/**/*.test.mjs` files, since Node 20's runner does not expand quoted globs). Regression tests live in `api/src/services/__tests__/` (e.g. `subscription-status.test.mjs`).
- **Automatic validation**: A registered validation step named `api-tests` runs `cd api && npm test` as a CI-style check on every task/merge, failing loudly on regressions.

### Database Layer (Drizzle ORM)
- **Schema**: Defined in `api/src/db/schema.ts` with comprehensive table definitions, types, indexes, and foreign key relationships.
- **Compatibility Layer**: `api/src/db/compat.ts` translates Mongoose-style queries to Drizzle SQL for easier migration and query handling. The `.populate()` method resolves references using `POPULATE_TABLE_MAP` registered in `dbCollections.ts`. Polymorphic fields like `ownerId` (which can reference either `users` or `organizations`) are NOT registered and will silently no-op — always fetch owner data manually with `usersCollection.findById()` or `organizationCollection.findById()`.
- **ID Format**: Uses `varchar(24)` hex strings, consistent with MongoDB ObjectId format.
- **Schema Management**: `drizzle-kit push --force` synchronizes schema changes to the database.
- **Query Instrumentation**: `api/src/db/index.ts` wraps `pool.query` and connections to time every query, log slow queries above `SLOW_QUERY_MS` (default 500ms), and track per-request query count/total db time via `AsyncLocalStorage`. The `queryMetrics` middleware (`api/src/middlewares/queryMetrics.middleware.ts`) emits a warn line when a request exceeds `REQUEST_QUERY_COUNT_WARN` queries or `REQUEST_QUERY_TIME_WARN_MS` total db time. Optional periodic pool sampling via `POOL_SAMPLE_INTERVAL_MS`. Thresholds and runbook documented in `api/src/db/PERFORMANCE_RUNBOOK.md`.

### Design System
- **Theme**: Centralized MUI theme (`client/src/theme/index.ts`) with a consistent brand palette (Navy/slate blue, warm amber, cool gray).
- **Typography**: Uses the Inter font family with a clear weight hierarchy.
- **Component Design**: Features include a split-screen authentication layout, a clean sidebar, a slim dashboard header, and styled DataGrid components.

### Production Deployment (Unified)
The production deployment is a **single Reserved VM** that serves both the React client and the API from the same Express process and the same origin.

- Build: `bash scripts/build-api.sh` — installs deps, runs `drizzle-kit push --force` against the production DB, then builds `client/build` via `react-scripts build` with `REACT_APP_BASE_URL=/api` (relative, so the client always talks to the same host it was served from).
- Run: `bash scripts/start.sh` — runs `node --import tsx/esm src/index.ts` from `api/`.
- Routing in `api/src/index.ts`:
  - `/api/*` → API router
  - `/health-check`, `/api/health-check` → health probes
  - Static assets in `client/build/` are served directly
  - All other GETs fall through to `client/build/index.html` so React Router handles the route
- CORS in production allows: same-origin requests (no Origin header), the comma-separated origins in `FRONTEND_URL`, and any `*.replit.app` / `*.replit.dev` host. Setting `FRONTEND_URL` is optional when everything runs on one origin.
- A standalone Static deployment for the client is **not** required. `scripts/build-client.sh` is kept for reference / fallback only.

In development everything runs via the `Start application` workflow (CRA on `:5000` proxying `/api` to the API on `:7777`); `REACT_APP_BASE_URL` is empty so the proxy handles routing.

**Important when republishing:** if the Publishing UI shows a "Database migrations" approval step proposing `DROP TABLE scheduled_job_runs` or `DROP INDEX ...` statements, **do not approve** — those tables/indexes are defined in `api/src/db/schema.ts` and the build script's `drizzle-kit push --force` already syncs the schema correctly. The destructive diff comes from the platform's dev-vs-prod comparison and reflects drift in the development DB, not the source of truth. Cancel out and republish without applying those migrations.

### Currency Formatting
- **Shared utility**: `formatUSD` and `amountFix` in `client/src/utils/helper.jsx` use `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` for consistent comma-separated USD formatting (e.g. `$11,711.87`). `amountFix` handles negative amounts with a leading minus sign.
- **Server-side**: `api/src/utils/email-templates.util.js` has a local `formatUSD` helper for email template currency formatting.
- **Convention**: All currency display should use `formatUSD` (or `amountFix` for negative-aware formatting). Never use raw `$${amount}` interpolation or `.toFixed(2)` for display.

### Feature Specifications
- **Demo Account**: Provides isolated demo accounts with randomized data for evaluation, cleared automatically after 24 hours. Restricted features are clearly identified and handled.
- **Check Mailing & Shipping**: Integrates with LOB for mail services and Shippo for UPS/FedEx overnight shipping, including rate fetching, label creation, and payment processing. The SendMailModal has a 3-step flow: (0) already-mailed warning, (1) address review/edit where users can modify each check's mailing destination, (2) payment confirmation. Custom addresses are stored in `mailedChecks.customAddress` (jsonb) and used by the LOB finalize endpoint. Country codes are normalized to ISO-3166 (e.g., "United States" → "US") before sending to LOB.
- **Admin Support Email Messaging**: Provides functionality for administrators to send emails to users and view message history, with dedicated backend endpoints, database schema, email templates, and frontend components. Includes a **mass email** feature allowing admins to send a single email to all users or a filtered subset (by role or subscription status) from the User Management page. Mass emails are processed in the background in chunks of 10 with rate-limit delays, logged per-recipient to `admin_messages` with `isMassEmail: true`, and distinguished in the Email History drawer with a purple "Mass Email" badge.
- **Admin Refund Management**: Superadmins can search for users, view their Stripe charges, and issue full or partial refunds from `/dashboard/admin/refunds`. Refund actions are validated (charge ownership, amount bounds), logged to the audit system, and trigger automated refund receipt emails to the user. Backend endpoints: `GET /admin/refunds/charges/:userId` and `POST /admin/refunds/process`. Frontend hook: `useAdminRefunds.js`.

## External Dependencies
- **Payment Processing**: Stripe
- **Email Service**: SendGrid
- **SMS Service**: Twilio
- **Accounting Integration**: QuickBooks
- **Cloud Storage**: AWS S3, Cloudflare R2
- **Browser Automation**: Playwright
- **Mapping Service**: Google Maps
- **Authentication**: Google OAuth
- **Mobile Development**: Capacitor (iOS, Android)
- **Document Generation**: ExcelJS (for parsing/generating spreadsheets)
- **Mail/Shipping APIs**: LOB, Shippo