# Deployment notes

- Hosting provider: Vercel is suggested by `vercel.json`; dashboard/provider confirmation unavailable.
- Repository default branch: `main` (`origin/HEAD -> origin/main`, local `main` tracks `origin/main` at `f5639f1`). Likely production branch, but the Vercel project setting is not accessible here.
- Current branch: `feature/sky-journey-v2`, one commit ahead of `origin/feature/sky-journey-v2` at `07e6d2e` (`Add scripts for cloud sprite and sun texture generation; implement layer audit tool`). `origin/main` is an ancestor of the current branch. This supports a branch mismatch: the latest changes exist on a feature branch while the repository default remains main.
- Build command: `npm run build` (verified successfully with `npm.cmd run build`).
- Output folder: `dist` (Vite default; no override is configured).
- Local Node version: `v24.21.0`. Configured/deployed Node version unknown.
- Cause of live mismatch: likely production-branch mismatch. The current branch is `feature/sky-journey-v2`, whereas the repository default is `main`; the Vercel production-branch setting and deployment logs are not available to confirm this conclusively.
- Other checks: no `base` override is configured; Vite outputs `dist`. Public 3D assets are tracked and `git check-ignore` returned no ignored assets. No service-worker registration was found. No `.gitattributes` is present. Asset paths already in use are lowercase; M0 introduced no new public asset path.
- Version stamp: footer now says `v0.2 · 2026-10-05`.
- Deployment fix/proof: pending. The live URL and Vercel project settings are not present, and GitHub network access is unavailable in the sandbox. The stamp cannot yet be confirmed in a private window or the commit pushed to the verified production branch.
- Local verification: `npm run build` succeeded. This confirms only that the local source builds.
