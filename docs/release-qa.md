# M12 release QA

QA target: the local Vite production preview built from commit `8d45210` plus the uncommitted M12 QA and documentation changes. The public deployment and physical devices were not reachable from this environment, so this is not a live release sign-off.

## Passed

- `npm run check` — ESLint and the TypeScript/Vite production build pass.
- `qa:accessibility` — production preview at 390 px: no-JavaScript fallback, reduced motion, keyboard skip link, scene semantics, photo alternatives, 44 px mobile targets, and `/atlas`, `/planner`, `/collections`, `/login`, `/register`, `/contact` route mounts pass.
- `qa:phase10` — production preview: all six brief widths (360, 390, 768, 1024, 1440, 1920 px) pass in Chrome, Edge and WebKit, including text fit, overflow, header position, keyboard skip link, moon credit and reduced motion.
- `qa:layers` — production preview: layer order and scene/text collisions pass at seven viewports (including 1366 × 640) and 25 progress samples per viewport.
- `qa:contrast` — production preview: all six beats pass at 390 px and 1440 px. Local fonts load and no Google Fonts request is made.
- 4× CPU mobile frame sample: p95 16.8 ms (budget ≤24 ms); maximum 49.9 ms, with 5 of 638 frame gaps over 24 ms.

Screenshots from these suites are generated in the ignored `shots/` directory.

## Release blockers and remaining checks

- `qa:perf` Lighthouse mobile: performance 0.81 (required ≥0.90), LCP 4,959 ms (required ≤2,200 ms), CLS 0 (passes ≤0.02), TBT 6 ms (passes ≤150 ms). The LCP element is the ground scene SVG; Lighthouse attributes about 3,734 ms to render delay. The release performance gate fails.
- Live-site checks could not run. Direct HTTP access to `https://aeris-liart.vercel.app/` failed from this environment and the web snapshot service reports the URL inaccessible. The code in this worktree has not been deployed.
- The §11.4 checks on a real mid-range Android phone and a laptop remain to be done.
- The existing §14 image-release requirements remain open: the gallery photos are marked as demo copies in `docs/photo-todo.md` and their individual licenses/credits are not verified.

These open checks mean M12 is locally tested but not a live release sign-off.
