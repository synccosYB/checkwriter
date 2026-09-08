---
name: Deployment build OOM (React client)
description: Why the unified deploy build can die silently at the React optimize step and how to keep it lean.
---

# Deployment build OOM at the React production build

**Symptom:** Replit deploy build (`scripts/build-api.sh`) reaches `Creating an optimized production build...` then the whole build silently **restarts from scratch** (re-runs "Installing packages") with **no** `Failed to compile` / no V8 `heap out of memory` trace. A silent restart with no error = the `react-scripts build` process was **killed by the OS OOM-killer** (or resource exhaustion), not a code error. Confirm code is fine by checking the dev workflow shows `No issues found`.

**Fix (in `scripts/build-api.sh`, around the React build step):** cut the build's peak memory/time instead of just raising the heap.
- `DISABLE_ESLINT_PLUGIN=true` — removes the parallel ESLint pass (biggest extra consumer alongside webpack). This is the definite win.
- `GENERATE_SOURCEMAP=false` — already set; avoids large sourcemap memory.
- `TSC_COMPILE_ON_ERROR=true` / `ESLINT_NO_DEV_ERRORS=true` — let the build emit.
- `NODE_OPTIONS=--max-old-space-size=4096` — headroom so V8 doesn't hit its own ceiling.

**Why 4096 is safe here:** Replit deployment *build* machines have more RAM than the runtime Reserved-VM tier, so giving V8 4GB avoids the V8-ceiling OOM without tripping the OS OOM-killer. If a silent restart persists, the next lever is reducing real work further (CRA's `fork-ts-checker` TypeScript checker is the remaining big consumer, but CRA 5 has no clean env var to disable it without craco/eject — leave it unless forced).

**Don't confuse with:** the `drizzle-kit push` step. It is non-fatal (`|| echo ...`). In a healthy run it logs `[✓] Changes applied`; older runs logged `relation "scheduled_job_runs" already exists` which is also swallowed and never fails the build.
