# AERIS — Scene Update (children, birds, tree, and removing the outline pattern)

This file adds four changes to the hero scene from `AERIS_ORB_SCROLL_SITE.md`:

1. **Remove** the faint outline pattern (outline clouds, 4-point stars, crescent moon, dots).
2. **Add a big tree** in the foreground on the opposite side of the bench.
3. **Add children playing** on the field at sunset.
4. **Add birds** flying at sunrise.

> Where this file and an earlier file disagree, **this file wins**. The conflicts are listed in §7 and I already patched the earlier file to match.
> Give Codex one phase at a time (§9). Wait for the "Done when" check before the next phase.

---

## 1. What stays and what goes (read this first)

| Item | Decision |
|---|---|
| Faint outline pattern (outline clouds, 4-point sparkles, crescent, small dots on the purple gradient, as in your screenshot) | **Remove completely** |
| The purple/orange sky **gradient** under that pattern | **Stays.** It is the sky |
| The real star field (twinkling canvas), the NASA moon, the photo cloud sprites, nebula, aurora | **Stay unchanged.** They are not the pattern |
| Everything in `AERIS_CLOUD_JOURNEY.md` | Unchanged |

---

## 2. Change 1 — Remove the outline pattern

### 2.1 What it is

The screenshot shows thin outlined shapes tiled over a purple-to-pink gradient: two cloud outlines, two four-point sparkles, a crescent, and tiny circles. Your earlier `ground.svg` upload (the 240×240 icon) contains exactly these shapes, so the pattern is almost certainly that tile repeated as a background. Codex must confirm this by searching, not by guessing.

### 2.2 Tasks (in this order)

1. Search the whole project (including CSS, JS/TS, HTML, and `public/`) for each of these and list every hit: `pattern_sky`, `ground.svg`, `background-image`, `background: url`, `background-repeat`, `<pattern`, `mask-image`, `::before` and `::after` rules with a `url(` inside.
2. In the browser, open DevTools on the page in your screenshot. Select the element that carries the pattern (click up the tree until the pattern disappears when you untick the rule). Write down the file and rule that creates it.
3. Delete that rule. Delete the SVG/PNG file it used **only if nothing else uses it** (search again after deleting the rule).
4. Delete the old uploaded `ground.svg` icon. The new `public/3d/scene/ground.svg` (the grass field) replaces it. Make sure no code still points to the old icon.
5. Delete `pattern_sky.svg` from the project if it exists.
6. Check that sections which used the pattern now show only the plain gradient.

### 2.3 Do not

- Do not replace the pattern with another texture or noise.
- Do not remove the real stars, the moon, the clouds, the nebula, or the aurora.
- Do not hide the pattern with `display: none` or `opacity: 0`. Delete the code.

### 2.4 Done when

- Searching the project for `pattern_sky` and for the old icon file returns nothing.
- A screenshot of the same page shows the gradient only, with no outline shapes (compare with your screenshot).
- The build passes and the browser console has no 404s for deleted files.

**Commit**: `chore: remove outline pattern background`

---

## 3. Change 2 — The big tree (opposite side of the bench)

### 3.1 Files

`public/3d/scene/tree.svg` (viewBox 320 × 480). The base of the trunk is at the bottom center (160, 470). The canopy is a group with the id `canopy`, so it can sway on its own. Inline the file in the page so CSS variables can tint it.

### 3.2 Placement

| Item | Desktop (≥ 768px) | Mobile (< 768px) |
|---|---|---|
| Side | **Left**, the bench is on the right (center x = 64%) | Left |
| Horizontal position | left edge at 4% of stage width | left edge at −6% (the left part of the canopy may run off the screen) |
| Width | `clamp(200px, 20vw, 340px)` (height is 1.5 × width) | `clamp(150px, 42vw, 220px)` |
| Vertical | trunk base sits on the front grass band, 3% above the bottom of the stage | same |
| Resulting top | about 49% from the top of the stage at 1440 × 900 | about 52% |

Rule: **the top of the canopy must stay below 46% from the top of the stage.** This keeps it clear of the headline and the left-edge small copy (see §7).

### 3.3 Tint per stage

Set these variables on the tree wrapper and interpolate them with `p`.

| Stage | `--leaf` | `--leaf-light` | `--leaf-dark` | `--trunk` | `--trunk-dark` |
|---|---|---|---|---|---|
| Sunrise | `#5a8a3a` | `#ffd39a` | `#2f5a2a` | `#6a4a30` | `#3f2a1a` |
| Noon | `#4f9a3c` | `#8fd16a` | `#2f6a2a` | `#6b4528` | `#4a2f1a` |
| Sunset | `#4a6a30` | `#ff9a5a` | `#243f22` | `#4a3020` | `#2a1a10` |
| Midnight | `#16302f` | `#3a5a7a` | `#0c1c20` | `#1d1a24` | `#0c0a10` |

`--leaf-light` is the glow on the side facing the sun (peach at sunrise, orange at sunset, moon-blue at night).

### 3.4 Motion

- The `canopy` group sways: rotation ±1.2° around the trunk top `(160, 250)`, 6 s, `ease-in-out`, alternating.
- When the user scrolls fast, increase the sway up to ±2.4° and ease it back to ±1.2° over 1.5 s after scrolling stops.
- The trunk never moves.
- With `prefers-reduced-motion`, no sway.

### 3.5 Visibility

Always visible from sunrise to midnight. It is part of the ground, not an effect.

---

## 4. Change 3 — Children playing at sunset

### 4.1 Files

`public/3d/scene/children.svg` (viewBox 300 × 120). Four children, each in its own group so they can be animated separately:

| Group id | Child | Motion |
|---|---|---|
| `kid1` | Jumping with both arms up | Jump: `translateY` 0 → −16px → 0, 1.1 s, `ease-in-out`, infinite |
| `kid2` | Running | Runs right by 120px over 3.6 s (`linear`, with a small 3px bounce), flips horizontally (`scaleX(-1)`), runs back. Set `transform-box: fill-box; transform-origin: center` for the flip |
| `kid3` | Kicking a ball | The ball (`#ball`) moves in an arc: 0,0 → 34px right and 18px up → 60px right and 0 up, 2.4 s, then returns the same way, infinite |
| `kid4` | Flying a kite | The group `#kite` (string and kite) rotates −5° ↔ +5°, 3.2 s, `ease-in-out`, alternating. Use `transform-box: view-box; transform-origin: 266px 52px` (the hand) |

Tint variables: `--kids` (silhouette color), `--ball`, `--kite`.

### 4.2 Placement

| Item | Desktop | Mobile |
|---|---|---|
| Position | centered at 38% of stage width (between the tree and the bench) | centered at 44% |
| Width | `clamp(180px, 17vw, 260px)` | `clamp(150px, 46vw, 220px)` |
| Vertical | feet on the field, 10% above the bottom of the stage | 12% |
| Depth | in front of the back grass band and flowers, **behind the tree** where they overlap | same |

### 4.3 Tint

| Stage | `--kids` | `--ball` | `--kite` |
|---|---|---|---|
| Sunset (p 0.64–0.76) | `#2a1222` | `#ffd37a` | `#ff6a5a` |
| Dusk (p 0.76–0.82, fading out) | `#120a14` | `#c9a45a` | `#a84a42` |

### 4.4 Visibility window (exact numbers)

| `p` | Children |
|---|---|
| < 0.64 | Not visible (opacity 0, animations paused) |
| 0.64 → 0.70 | Fade in (opacity 0 → 1) and rise 12px |
| 0.70 → 0.76 | Fully visible, all four animations running |
| 0.76 → 0.82 | Fade out (opacity 1 → 0) |
| > 0.82 | Not visible, animations paused |

This ends **before** the people sit on the bench (`p` 0.82 → 0.90), so the children "go home" as the people arrive. Scrolling back reverses it exactly.

### 4.5 Rules

- Pause all four animations whenever the group's opacity is 0 (use `animation-play-state: paused`).
- With `prefers-reduced-motion`: show the children static between p 0.64 and 0.82, no loops.
- Do not add faces, clothes, or other characters.

---

## 5. Change 4 — Birds at sunrise

### 5.1 Files

`public/3d/scene/birds.svg`. It shows the three wing frames when opened, and works as a sprite. Use one frame with:

```html
<svg viewBox="0 0 44 24"><use href="/3d/scene/birds.svg#bird-up"/></svg>
```

Frames: `#bird-up`, `#bird-mid`, `#bird-down`. Tint variable: `--bird` (`#2a2438` at sunrise).
Do not paste the whole file into the page (it also draws the preview card).

### 5.2 Flock layout

| Group | Count (desktop / mobile) | Size | Notes |
|---|---|---|---|
| Main flock, a loose "V" | 7 / 4 | lead bird `clamp(28px, 3vw, 52px)` wide, the others 0.9, 0.9, 0.8, 0.8, 0.7, 0.7 of that | Leader at the front, others behind and spread to both sides |
| Far birds | 3 / 2 | 0.5, 0.45, 0.4 of the lead size | Slightly lower and further right, slower |

Offsets of the main flock relative to the leader (in lead-bird widths): `(0,0)`, `(−1.2, +0.5)`, `(−1.2, −0.5)`, `(−2.4, +1.0)`, `(−2.4, −1.0)`, `(−3.6, +1.5)`, `(−3.6, −1.5)`.

### 5.3 Flight and flap

| Thing | Rule |
|---|---|
| Direction | left to right, with the whole flock gently rising (like going up with the sun) |
| Path | the leader starts at x = −10%, y = 36% of the stage height and ends at x = 110%, y = 14%. It follows a soft curve (one gentle S bend) |
| Driven by | scroll `p` (position), plus a small real-time bob: `sin(time × 1.6) × 6px` per bird with its own phase |
| Flap | swap frames in the order `up → mid → down → mid`, one frame every 120 ms. Each bird has its own random starting frame |
| Glide | about 30% of the birds hold `bird-mid` for 600 ms every few seconds |
| Far birds | flap at half speed (240 ms per frame) and cross at 70% of the main flock's speed |

### 5.4 Visibility window (exact numbers)

| `p` | Birds |
|---|---|
| 0.00 → 0.04 | Fade in (opacity 0 → 1) |
| 0.04 → 0.20 | Visible, crossing the sky |
| 0.20 → 0.26 | Fade out |
| > 0.26 | Not visible. Stop the flap timer. Birds never appear at noon, sunset or night |

Scrolling back replays the crossing in reverse.

### 5.5 Rules

- Maximum 10 birds on desktop and 6 on mobile.
- Birds must not cross the headline text area in front of the letters. They sit **behind** the headline layer.
- Stop the flap timer when the birds are not visible.
- With `prefers-reduced-motion`: show the flock static (frame `bird-mid`) at p 0.00–0.20, with no flapping or crossing.

---

## 6. Updated layer order (back to front)

This replaces the list in `AERIS_ORB_SCROLL_SITE.md` §5.

1. Sky gradient (CSS variables)
2. Stars canvas, nebula, aurora (night only)
3. **Birds** (sunrise only)
4. Headline (behind layer)
5. Clouds, far layer
6. **Orb** (sun/moon)
7. Headline (front layer, only for the overlap beats)
8. Clouds, near layer
9. Far hills (slight haze)
10. Grass field (back band)
11. Flowers
12. **Children** (sunset only)
13. Bench, then people on the bench (night)
14. Grass field (front band)
15. **Tree** (left, closest to the viewer, in front of the grass front band and the children)
16. Small copy + pill
17. Header

---

## 7. Conflicts with earlier files (already resolved)

| Earlier rule | Problem | Rule now |
|---|---|---|
| Orb plan §4, beat 4: small copy at "bottom-left" | The tree and children now occupy the bottom-left | Beat 4 small copy sits on the **right side, directly under the headline** |
| Orb plan §4: small copy at "left edge" (beats 1, 3, 6) | The tree canopy could cover it | Left-edge copy block must stay between **26% and 42% from the top** of the stage |
| Orb plan §4: small copy at "bottom-right" (beats 2, 5) | The bench and people are near the right | Bottom-right copy must start at **x ≥ 78%** of the stage width |
| Orb plan §6.3: "Use the pattern SVG … optional" | You do not want the outline pattern | Removed. No pattern texture anywhere |
| Orb plan §9 / old `ground.svg` icon | The old uploaded `ground.svg` is an icon, not grass | Deleted in Phase U0. The new grass `ground.svg` has the same name and replaces it |
| Orb plan timeline: people on bench at p 0.82–0.90 | Children and people must not overlap | Children fade out at p 0.76–0.82, before the people appear |

If Codex finds any other overlap on screen, it must report it and wait. It must not move things by itself.

---

## 8. Files to upload

Copy these into `public/3d/scene/` (they sit next to `ground.svg`, `flowers.svg`, `bench.svg`, `people.svg`):

| File | What it is |
|---|---|
| `tree.svg` | The foreground tree |
| `children.svg` | Four children (jumping, running, kicking a ball, flying a kite) |
| `birds.svg` | Bird sprite with 3 wing frames |

Reference only (keep outside `public/`, for example in `docs/`):

| File | What it shows |
|---|---|
| `scene_preview_sunrise.png` | Birds, flowers and tree at sunrise (the bench is drawn here only for placement; in the real timeline it appears at sunset) |
| `scene_preview_sunset.png` | Tree, children and bench at sunset |

If you have not yet replaced the earlier copies, also re-upload the updated `flowers.svg` and the latest `ground.svg`, `bench.svg` and `people.svg` from the earlier step.

---

## 9. Phases

Order: do **U0 right after the deployment check** (Phase 0 in `AERIS_CLOUD_JOURNEY.md`), because it only deletes code and you can see it live. Do **U1 to U6 together with or after Phase 6 (Ground scene)** of the Orb plan. If Phase 6 is not built yet, build the ground scene using these specs.

### Phase U0 — Remove the outline pattern
- **Goal**: the pattern is gone everywhere.
- **Tasks**: all steps in §2.2.
- **Do not**: see §2.3.
- **Done when**: see §2.4.
- **Commit**: `chore: remove outline pattern background`

### Phase U1 — Install the new scene files
- **Goal**: the three new SVGs are in the project and load.
- **Tasks**: copy `tree.svg`, `children.svg`, `birds.svg` to `public/3d/scene/`; write a debug page that shows each one on a neutral background; check the three files have no `localStorage`, scripts, or external links; check file names are lowercase and match the imports exactly (the live server is case-sensitive).
- **Do not**: edit the SVG artwork.
- **Done when**: the debug page shows the tree, four children, and three bird frames, and the production build includes the files.
- **Commit**: `feat: add tree, children and birds assets`

### Phase U2 — Tree
- **Goal**: tree on the left with tint and sway.
- **Tasks**: placement from §3.2, tint table from §3.3 driven by `p`, sway from §3.4.
- **Do not**: let the canopy top go above 46% from the top of the stage, or move the trunk.
- **Done when**: at 360, 390, 768, 1024, 1440 and 1920 px the tree is on the left, nothing overlaps the headline, and the colors change from sunrise to midnight.
- **Commit**: `feat: foreground tree`

### Phase U3 — Birds
- **Goal**: flock crossing at sunrise only.
- **Tasks**: layout from §5.2, flight and flap from §5.3, window from §5.4.
- **Do not**: show birds after p 0.26, or in front of the headline.
- **Done when**: birds fade in at the start, cross the sky while flapping, fade out by p 0.26, and the flap timer is stopped afterwards.
- **Commit**: `feat: sunrise birds`

### Phase U4 — Children
- **Goal**: four children playing during sunset.
- **Tasks**: placement from §4.2, tint from §4.3, the four animations from §4.1, the visibility window from §4.4.
- **Do not**: show children before p 0.64 or after p 0.82, or let them overlap the people.
- **Done when**: each child has its own animation, they fade in and out at the exact `p` values, and animations are paused when they are hidden.
- **Commit**: `feat: sunset children`

### Phase U5 — Integration and layout conflicts
- **Goal**: everything fits together.
- **Tasks**: apply the layer order from §6; apply the small-copy rules from §7; check mobile layout; check `prefers-reduced-motion` for the tree, birds and children.
- **Do not**: change any number outside this file without asking.
- **Done when**: at every beat and every screen size, no small copy, headline, tree, children, bench or people overlap each other.
- **Commit**: `feat: integrate scene objects and fix overlaps`

### Phase U6 — QA and deploy
- **Goal**: ship and verify on the live site.
- **Tasks**: run the checklist in §10 on the **live site** in a private window.
- **Done when**: every box in §10 is ticked on the live site.
- **Commit**: `chore: scene update release`

---

## 10. Final QA checklist (live site)

- [ ] No outline clouds, sparkles, crescent or dots anywhere on the site
- [ ] The real stars, NASA moon, photo clouds, nebula and aurora are still there
- [ ] Tree on the left, bench on the right, children between them at sunset
- [ ] Birds only at sunrise (p 0.00–0.26)
- [ ] Children only between p 0.64 and 0.82, and gone before the people sit down
- [ ] Tree colors follow the sky at every stage
- [ ] No overlap between the tree, headline, small copy, children, bench and people at six screen widths
- [ ] Reduced-motion version is static and complete
- [ ] No 404 errors for any SVG on the live site (check case of file names)

---

## 11. First prompt to give Codex (Phase U0 only)

```
Read AERIS_SCENE_UPDATE.md. Do Phase U0 only.

Find and delete the faint outline pattern (outline clouds, 4-point
sparkles, crescent moon, small dots) from the whole site. Follow
section 2.2 in order and list every file and rule you find before you
delete anything. Keep the sky gradient, the real stars, the moon, the
clouds, the nebula and the aurora. When done, show a before and after
screenshot and stop.
```
