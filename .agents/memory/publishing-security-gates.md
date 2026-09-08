---
name: Publishing security gates
description: How to validate dependency fixes when Replit blocks a publish for a critical transitive vulnerability.
---

When a publish is blocked by a critical transitive dependency, do not stop after updating only the package named in the publishing log. Refresh the affected lockfile, perform a clean install through Replit's package firewall, and check the resulting dependency tree and critical audit findings.

**Why:** The publishing scan reports the blocker it encountered, while a clean reinstall can resolve newer transitive versions or expose another version that the package firewall now blocks. A targeted override may therefore reveal the next blocker only after the lockfile is refreshed.

**How to apply:** Prefer updating the direct parent first. If the maintained parent already allows a patched transitive release but the lockfile remains vulnerable, use a narrow npm override, regenerate the nested package lock, then verify the resolved versions, zero critical audit findings, and the production build.