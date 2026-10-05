# Deployment notes

- Hosting provider: Vercel is suggested by `vercel.json`; dashboard/provider confirmation unavailable.
- Production branch: `main` (confirmed in the Vercel deployment details supplied by the user). The deployment was serving `f5639f1` while the newer hero work was on `feature/sky-journey-v2`.
- Build command: `npm run build` (verified successfully with `npm.cmd run build`).
- Output folder: `dist` (Vite default; no override is configured).
- Local Node version: `v24.21.0`. Configured/deployed Node version unknown.
- Cause of live mismatch: production branch mismatch. Vercel's production deployment was built from `main` at `f5639f1`; the latest changes were on `feature/sky-journey-v2`.
- Other checks: no `base` override is configured; Vite outputs `dist`. Public 3D assets are tracked and `git check-ignore` returned no ignored assets. No service-worker registration was found. No `.gitattributes` is present. Asset paths already in use are lowercase; M0 introduced no new public asset path.
- Version stamp: footer now says `v0.2 · 2026-10-05`.
- Fix/proof: pushed the updated feature branch to production branch `main` as commit `4894aa4`. A fresh isolated browser context on `https://aeris-liart.vercel.app/` displayed `v0.2 · 2026-10-05`.
- Verification: local `npm run build` succeeded; live Lighthouse and scroll baseline are in `docs/baseline.md`.
