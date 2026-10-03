# Deployment notes

- Hosting provider: Vercel is suggested by `vercel.json`; the hosting dashboard has not been inspected, so this is unconfirmed.
- Production branch: unknown. The checked-out branch is `feature/sky-journey-v2`, tracking `origin/feature/sky-journey-v2` at the same commit (`d60ab64`). There are no local commits ahead of that remote branch.
- Build command: `npm run build` (verified successfully with `npm.cmd run build`).
- Output folder: `dist` (Vite default; no override is configured).
- Local Node version: `v24.21.0`. The deployed Node version is unknown.
- Cause found: not established. The local feature branch is pushed and its build passes, but the production branch, deployment logs, and live URL were not available to compare. A branch mismatch or a deployment/cache issue remains possible, not confirmed.
- Local change: added the requested `v0.1 · 2026-10-03` footer stamp. The build includes it.
- Deployment fix: pending diagnosis in the hosting dashboard. The stamp cannot be confirmed on the live site in a private window until the production branch is identified and deployed.
