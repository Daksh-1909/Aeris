# Live baseline — 2026-10-05

- Live URL: https://aeris-liart.vercel.app/
- Production deployment commit tested: 4894aa4 (the production version stamp was visible in a fresh isolated browser context).
- Lighthouse: 13.5.0; Chrome Headless 153.0.8010.12; mobile preset; captured 2026-10-05 10:19:48 UTC.
- 10-second scroll capture: 390×844 mobile emulation, DPR 1, Chromium Headless 153.0.8010.12, CPU slowed 4×; fresh isolated browser context; captured 2026-10-05 10:22:09 UTC. Script: scripts/live-baseline.mjs.

## Lighthouse mobile scores

| Category | Score |
|---|---:|
| Performance | 79 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 91 |

| Performance metric | Value |
|---|---:|
| First Contentful Paint | 1.8 s |
| Largest Contentful Paint | 5.2 s |
| Speed Index | 2.4 s |
| Total Blocking Time | 102 ms (displayed as 100 ms) |
| Cumulative Layout Shift | 0.030 |

## Ten-second mobile scroll

| Frame-time measure | Value |
|---|---:|
| Samples | 251 |
| p50 | 33.4 ms |
| p95 | 50.1 ms |
| Maximum | 166.6 ms |
| Frames over 24 ms | 229 of 251 |

The production stamp displayed v0.2 · 2026-10-05 while viewed in a fresh isolated browser context. The scroll run advances from the top to the bottom of the hero over 10 seconds and samples requestAnimationFrame intervals. This is one baseline run; repeat it when comparing future performance work.
