# Live baseline — 2026-10-05

- Live URL: https://aeris-liart.vercel.app/
- Source commit tested: a791421.
- Lighthouse: 13.5.0; Chrome Headless 153.0.8010.12; mobile preset; captured 2026-10-05 10:33:39 UTC.
- Scroll capture: 390×844 mobile emulation, DPR 1; Chromium Headless 153.0.8010.12; CPU slowed 4×; fresh isolated browser context; captured 2026-10-05 10:31:45 UTC. Reproduction script: scripts/live-baseline.mjs.
- Version stamp: v0.2 · 2026-10-05 was visible in the isolated browser context after the final push.

## Lighthouse mobile scores

| Category | Score |
|---|---:|
| Performance | 74 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 91 |

| Performance metric | Value |
|---|---:|
| First Contentful Paint | 2.7 s |
| Largest Contentful Paint | 4.9 s |
| Speed Index | 5.1 s |
| Total Blocking Time | 55 ms (displayed as 60 ms) |
| Cumulative Layout Shift | 0.030 |

## Ten-second mobile scroll

| Frame-time measure | Value |
|---|---:|
| Samples | 253 |
| p50 | 33.4 ms |
| p95 | 50.1 ms |
| Maximum | 83.3 ms |
| Frames over 24 ms | 237 of 253 |

The scroll run advanced from the top to the bottom of the hero over 10 seconds and sampled requestAnimationFrame intervals. This is one baseline run. An earlier Lighthouse run on the same production build scored 79 for Performance; use repeat runs for comparisons because these scores vary.
