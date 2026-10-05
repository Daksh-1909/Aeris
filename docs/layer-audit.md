# Hero layer audit — 2026-10-05

This is an observational audit only. No hero positions, copy, or z-index values were changed. The development-only ?debug=layers view outlines stage elements, reports computed z-index and ancestor stacking-context triggers, and provides a progress slider.

## Capture matrix

Each cell links to the screenshot at the requested progress. Counts are geometric bounding-box intersections of rendered text boxes with other text boxes or measured element boxes. Each count is total (text-text / text-layer). The text-layer counts include sprite and scene element boxes: transparent cloud pixels can make a box intersect text without visibly covering glyphs. Per-element rectangles, labels, z-indexes, and intersection pairs are in [data.json](layer-audit/data.json).

| Viewport | p = 0.05 | p = 0.30 | p = 0.55 | p = 0.70 | p = 0.90 |
|---|---:|---:|---:|---:|---:|
| 360 × 740 | [8 (0/8)](layer-audit/screenshots/360x740-p05.png) | [6 (0/6)](layer-audit/screenshots/360x740-p30.png) | [10 (1/9)](layer-audit/screenshots/360x740-p55.png) | [10 (0/10)](layer-audit/screenshots/360x740-p70.png) | [21 (4/17)](layer-audit/screenshots/360x740-p90.png) |
| 390 × 844 | [5 (0/5)](layer-audit/screenshots/390x844-p05.png) | [6 (0/6)](layer-audit/screenshots/390x844-p30.png) | [8 (1/7)](layer-audit/screenshots/390x844-p55.png) | [9 (0/9)](layer-audit/screenshots/390x844-p70.png) | [18 (3/15)](layer-audit/screenshots/390x844-p90.png) |
| 768 × 1024 | [7 (0/7)](layer-audit/screenshots/768x1024-p05.png) | [6 (1/5)](layer-audit/screenshots/768x1024-p30.png) | [14 (2/12)](layer-audit/screenshots/768x1024-p55.png) | [11 (0/11)](layer-audit/screenshots/768x1024-p70.png) | [24 (6/18)](layer-audit/screenshots/768x1024-p90.png) |
| 1024 × 768 | [10 (1/9)](layer-audit/screenshots/1024x768-p05.png) | [12 (1/11)](layer-audit/screenshots/1024x768-p30.png) | [29 (5/24)](layer-audit/screenshots/1024x768-p55.png) | [20 (0/20)](layer-audit/screenshots/1024x768-p70.png) | [37 (6/31)](layer-audit/screenshots/1024x768-p90.png) |
| 1440 × 900 | [11 (1/10)](layer-audit/screenshots/1440x900-p05.png) | [11 (1/10)](layer-audit/screenshots/1440x900-p30.png) | [33 (5/28)](layer-audit/screenshots/1440x900-p55.png) | [23 (1/22)](layer-audit/screenshots/1440x900-p70.png) | [39 (6/33)](layer-audit/screenshots/1440x900-p90.png) |
| 1920 × 1080 | [8 (1/7)](layer-audit/screenshots/1920x1080-p05.png) | [10 (1/9)](layer-audit/screenshots/1920x1080-p30.png) | [22 (1/21)](layer-audit/screenshots/1920x1080-p55.png) | [14 (0/14)](layer-audit/screenshots/1920x1080-p70.png) | [29 (4/25)](layer-audit/screenshots/1920x1080-p90.png) |

## Observed text collisions

- Headlines and their copy or pill use independently positioned zones. At 1024×768, 1440×900, and 1920×1080 at p=0.05, the first headline and copy boxes intersect. At p=0.70, the fourth headline and copy boxes intersect at 1440×900. At p=0.90, fifth/sixth headlines intersect during transition at all six widths, and the sixth headline intersects the late-stage copy or pill in several widths. The complete viewport and text-pair list is in data.json.
- Headline crosses orb: at p=0.30, the second headline intersects the orb at 1024×768, 1440×900, and 1920×1080; at p=0.55, the third headline intersects it at those three widths; at p=0.70, the fourth headline intersects it at 1440×900; at p=0.90, the fifth headline intersects it at all six widths. Captures show letters painted over the orb disc, not only its glow.
- The third headline is duplicated at p=0.55. The original journey scene title and the overlap-front title occupy the same area. The duplicate is masked to the orb and uses z-index 8, above the orb at z-index 6.
- Cloud and foreground box intersections account for many text-layer counts. Near-clouds can cross text in this layout. Cloud sprites contain transparency, so each such box intersection is flagged for visual review rather than assumed to cover visible glyph pixels. Foreground objects also intersect text boxes as listed in data.json.
- Header: no headline or copy box intersection with the header was measured at these 30 checkpoints.

## Orb stacking context and z-index

- .journey__orb computed style is position:absolute; z-index:6. Its progress transform is a matrix and will-change:transform is set. The orb creates its own stacking context.
- Parent .journey__stage has isolation:isolate, so it establishes the containing isolated stacking context. It is sticky and clips overflow. The surrounding .page--ready wrapper is positioned with z-index:1 and creates another ancestor stacking context.
- The orb's effective ordering is z-index 6 inside the isolated stage, itself inside .page--ready z-index 1. The header is separately positioned at z-index 50 within that wrapper and stacks above the stage. The orb is above mid/near clouds (z 4 desktop; near cloud z 4 mobile) and ground scene plane (z 3). Foreground tree z 4 is inside the z-3 ground-scene stacking context, so it cannot outrank the orb across parent contexts. Descendant z values alone do not determine the cross-context order.

## Other stacking-context triggers found

Contexts are created by positioned elements with z-index (cloud layers, ground scene, tree/children, birds, scene titles, overlap title, copy, readout, debug control and orb), transforms (orb, moving clouds, scene/copy transitions, children, picnic and debug control), filters (cloud images and night-sky effects), opacity below 1 (cloud/fade layers, sprites, title/copy transitions and sky effects), will-change (clouds, orb, bench/people and sky effects), and isolation:isolate on the stage. The overlap title also uses a mask. Exact per-node values and the p=0.05 computed inventory are retained in data.json.

## Reproduce

Run the Vite development server and open /?debug=layers, then use its progress slider. To regenerate the screenshots and geometry records, run node scripts/collect-layer-audit.mjs while the server is available at http://127.0.0.1:5173/.

This audit does not satisfy the no-beat/orb-intersection success condition: the current hero has observed collisions, and M1 explicitly forbids fixing them. The plan directs layout changes to Phase M2.
