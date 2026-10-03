# AERIS — Cloud Path Journey (the rest of the homepage)

This file builds everything **below** the sunrise → noon → sunset → dusk → midnight hero. A single cloud character travels along a path as you scroll. It stops at 4 checkpoints, changes shape and facial expression at each one, and between checkpoints it does an activity (blinking, happy, laughing, sleeping). The old homepage content is removed and its content is shown at the checkpoints.

> Read `AERIS_ORB_SCROLL_SITE.md` first. This file does not touch the hero. Give Codex **one phase at a time** and wait for the "Done when" check before the next phase.

---

## 0. Decisions already made (do not change without asking)

| Topic | Decision |
|---|---|
| Where it sits | Directly after the hero ends at midnight. Footer comes right after this section. |
| Background | The sky **continues from midnight**, so there is no jump back to daylight. It slowly shifts through night tints (see §6.3). |
| Pinning | CSS `position: sticky` inside a tall wrapper. **Do not use GSAP `pin`** (it caused offset bugs before). |
| Scroll driver | One value `j` from 0 to 1 for this whole section (the "journey progress"). Everything reads from `j`. |
| Checkpoints | Exactly 4. Desktop and mobile have the same 4, in the same order. |
| Cloud | One cloud element. It morphs between 4 shapes. It is **not** 4 separate clouds. |
| Face | Two circle eyes and **one** smiling-line mouth. No nose, no brows, no pupils. |
| Old homepage | Deleted completely (see Phase 1). Its content moves into `content/journey.ts`. |
| Replaces | In `AERIS_ORB_SCROLL_SITE.md`: §7 rows 2–7 and Phase 8. Section 8 (footer) stays. |

---

## 1. What the visitor sees

| Path fraction `f` | What happens |
|---|---|
| 0.00 → 0.20 | Cloud flies in from off-screen left. **Blinking** (2 slow blinks), like waking up. |
| **0.20 Checkpoint 1** | Cloud settles on the left as a **puffy cumulus**, calm smile. Content card **"Sky"** appears on the right. |
| 0.20 → 0.41 | Cloud travels to the right. **Happy** (bounces, bigger smile, squinting eyes). |
| **0.41 Checkpoint 2** | Cloud becomes a **wide flat stratus**, wide-open eyes, small smile. Card **"Nature"** appears on the left. |
| 0.41 → 0.60 | Cloud travels back to the left. **Laughing** (shakes, big smile, 2 tears). |
| **0.60 Checkpoint 3** | Cloud grows into a **tall tower**, proud grin with squinting eyes. Card **"Numbers"** appears on the right. |
| 0.60 → 0.81 | Cloud drifts to the right. **Sleeping** (eyes shut, small mouth, Z z z rising, slow breathing). |
| **0.81 Checkpoint 4** | Cloud wakes up as a **comet cloud** with a tail, gentle smile. Card **"Contact"** appears on the left. |
| 0.81 → 1.00 | Cloud flies off to the right. The footer scrolls in. |

The `f` values are desktop fractions. The exact checkpoint positions come from `cloud-rig.json` (§3). Use those numbers. Do not recompute them. Scroll progress `j` is converted to `f` by `remap()` in §4, which adds a short parked pause at each checkpoint.

---

## 2. Deployment check (do this first, Phase 0)

You said the latest changes appear on `localhost` but not on the deployed website. I cannot see your repo or your hosting account, so this is a checklist for Codex to run and report on. Do not start Phase 1 until Phase 0 is "done".

### 2.1 Most likely causes (check in this order)

| # | Cause | How to check | Fix |
|---|---|---|---|
| 1 | Changes were never pushed | `git status` and `git log origin/<branch>..HEAD` | Commit and push |
| 2 | Pushed to the wrong branch | Compare the branch in the hosting dashboard (Production branch) with `git branch --show-current` | Push to the production branch, or change the setting |
| 3 | Build fails online but works locally | Open the latest deployment logs in the hosting dashboard | Fix the error shown. Run `npm run build` locally to reproduce |
| 4 | Viewing a Preview URL, not Production | Look at the URL. Preview URLs contain the commit or branch name | Promote the deployment to Production |
| 5 | Case-sensitive file names | Linux servers treat `Moon_Color_2k.webp` and `moon_color_2k.webp` as different files. Search the code for each asset path and compare it with the real file name | Rename files and imports so they match exactly, all lowercase |
| 6 | Assets ignored by git | `git check-ignore -v public/3d/*` and look at `.gitignore` | Remove the ignore rule. Make sure the files are committed |
| 7 | Large files rejected or on Git LFS | Look for `.gitattributes` with `lfs`, and check the deploy logs for size errors | Keep every texture small (the 2k files are under 100 KB) |
| 8 | Old version cached | Hard refresh, test in a private window, check for a service worker (`navigator.serviceWorker.getRegistrations()` in the console) | Unregister the service worker, bump cache version, purge the CDN cache |
| 9 | Environment variables missing online | Compare `.env.local` with the hosting dashboard's environment variables | Add the same variable names in the dashboard, then redeploy |
| 10 | Wrong Node version | Compare `node -v` locally with the version configured online | Set the same version in the hosting settings or `package.json` `engines` |
| 11 | Wrong base path or output folder | Site loads but assets 404 | Fix `base`/`basePath` and the output directory (`dist`, `build`, `out`) in the hosting settings |

### 2.2 Proof step (so we know deployment really works)

1. Add a tiny version stamp to the footer, for example `v0.1 · 2026-10-03`.
2. Push to the production branch.
3. Wait for the deployment to finish. Open the live site in a **private window**.
4. The stamp must be visible. If it is not, work down the table in §2.1 again.

### 2.3 What to report back

Codex must write a short `DEPLOY_NOTES.md` containing: hosting provider, production branch, build command, output folder, Node version, the cause that was found, and the fix. If you tell me the hosting provider and the live URL, I can also check the live site for you.

---

## 3. Files you upload (the cloud design)

Everything is in the folder `aeris-assets/3d/cloud-character/`. Copy it to `public/3d/cloud-character/` in the project.

| File | What it is |
|---|---|
| `cloud-rig.json` | **The single source of truth.** 4 cloud shapes (7 circles + 1 base each), face positions, 8 expressions, the 4 checkpoints, the 4 activities, and both scroll paths with exact checkpoint fractions |
| `cloud_cumulus.svg`, `cloud_stratus.svg`, `cloud_tower.svg`, `cloud_comet.svg` | Static versions of each shape with a calm face. Used as the **reduced-motion and no-JS fallback**, and as a visual reference |
| `cloud_face_parts.svg` | Sprite with `#tear`, `#z`, `#blush` |
| `cloud_path_desktop_preview.svg`, `cloud_path_mobile_preview.svg` | Pictures of the paths with numbered checkpoints. Reference only, **do not ship** (move them to a `docs/` folder) |
| `cloud_shapes_preview.png` | Picture of the 4 shapes. Reference only |

### 3.1 How the cloud is built

- The cloud is drawn from **7 circles and 1 rounded rectangle** (the flat bottom). Every shape has the **same 7 circles in the same order**.
- Morphing means moving each circle's `cx`, `cy`, `r` and the rectangle's `x`, `y`, `width`, `height`, `rx` from one shape's numbers to the next shape's numbers. Because the order matches, the shape changes smoothly.
- The gradient must use `gradientUnits="userSpaceOnUse"` (already set in the files). Without this, each circle gets its own gradient and ugly seams appear.
- The face is not part of the body. It is drawn on top: 2 ellipses for eyes and 1 curved path for the mouth. Face position and size also morph between shapes (`face.cx`, `cy`, `eyeDx`, `eyeY`, `mouthY`, `mouthW`, `eyeR`).

### 3.2 Shapes and their meaning

| Checkpoint | Shape | Why this shape | Expression |
|---|---|---|---|
| 1 | `cumulus` (puffy, round) | The classic cloud. Friendly start | `calm` |
| 2 | `stratus` (wide, flat) | Looks like a landscape, fits "Nature" | `wide` |
| 3 | `tower` (tall) | Grows upward, fits big numbers | `proud` |
| 4 | `comet` (tail on the left, head on the right) | Looks like it is about to leave, fits the send-off | `awake` |

### 3.3 Expressions (all values are in `cloud-rig.json`)

| Name | Eyes (`eyeScaleY`) | Mouth | Extra |
|---|---|---|---|
| `calm` | 1.0 (round) | soft smile (curve 14) | none |
| `wide` | 1.0, radius ×1.2 | small smile (curve 8, narrower) | none |
| `proud` | 0.55 (half-closed) | big smile (curve 22) | none |
| `awake` | 1.0 | gentle smile (curve 12) | none |
| `happy` | 0.45 | big smile (curve 24) | bounce |
| `laugh` | 0.30 | huge smile (curve 30, thick line) | **2 tears**, shake |
| `sleep` | 0.08 (shut) | tiny line (curve 3, very narrow) | **Z z z**, breathing |
| `blink` | 0.08 | keeps the current mouth | lasts 140 ms |

Eyes are circles squashed vertically with `scaleY` (set `transform-box: fill-box; transform-origin: center`). Never swap the eyes for arcs or other drawings.

---

## 4. Path and checkpoints

The cloud moves along an SVG path using `getPointAtLength()`.

- Desktop path: viewBox `1440 × 900`. Mobile path: viewBox `390 × 900`. Both are in `cloud-rig.json` under `paths`.
- Desktop checkpoint fractions: **0.203, 0.411, 0.604, 0.809**
- Mobile checkpoint fractions: **0.286, 0.469, 0.651, 0.811**
- Fraction = distance along the path divided by total length.

Map scroll to path position with one function. The cloud **eases to a stop** at each checkpoint, so it feels like it is stopping to show you something:

```ts
// HOLD = how long the cloud "parks" at each checkpoint, in path-fraction units.
// While parked, the path fraction f stays exactly on the checkpoint.
const HOLD = 0.035;

// j (0..1 scroll progress of the section) -> f (0..1 position along the path)
export function remap(j: number, cps: number[]): number {
  const stops = [0, ...cps, 1];
  let u = clamp(j, 0, 1) * (1 + HOLD * cps.length); // travel units add up to 1, plus the holds
  for (let i = 1; i < stops.length; i++) {
    const travel = stops[i] - stops[i - 1];
    if (u <= travel) return stops[i - 1] + u;       // travelling toward stops[i]
    u -= travel;
    if (i <= cps.length) {                          // parked on checkpoint i
      if (u <= HOLD) return stops[i];
      u -= HOLD;
    }
  }
  return 1;
}
```

State from progress:

| Name | Rule |
|---|---|
| `f` | Path fraction from `remap(j, checkpointFractions)` |
| `activeCheckpoint` | The checkpoint whose fraction is within `0.012` of `f` (so its card starts to appear just before the cloud arrives) |
| `segment` | Which gap the cloud is in: `start→1`, `1→2`, `2→3`, `3→4`, `4→exit` |
| `segmentProgress` | `(f − fa) / (fb − fa)` for the segment between checkpoint fractions `fa` and `fb`, from 0 to 1. Used to blend shapes and expressions |

Use a small hysteresis (0.01) so the active checkpoint does not flicker when the user scrolls back and forth on the edge.

---

## 5. Shape and expression blending (the rule that prevents glitches)

Inside each segment `a → b`:

1. **Shape**: stay on shape `a` for the first 25% of `segmentProgress`, blend to shape `b` between 25% and 85% using `easeInOutCubic`, then stay on `b`. This makes the change happen **between** stops, so the cloud arrives already in its new shape.
2. **Expression**: the **segment activity** (see §5.1) controls the face between checkpoints. For the last 12% of the segment, blend from the activity expression to the checkpoint expression of `b`. At the checkpoint the expression is exactly the checkpoint expression.
3. **Scrolling backwards** plays everything in reverse. No state may depend on the scroll direction.

```ts
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (A: number[], B: number[], t: number) => A.map((v, i) => lerp(v, B[i], t));

function shapeAt(rig, from: string, to: string, p: number) {
  const t = easeInOutCubic(clamp((p - 0.25) / 0.60, 0, 1));
  const A = rig.shapes[from], B = rig.shapes[to];
  return {
    circles: A.circles.map((c, i) => mix(c, B.circles[i], t)),
    base: mix(A.base, B.base, t),
    face: Object.fromEntries(Object.keys(A.face).map(k => [k, lerp(A.face[k], B.face[k], t)])),
  };
}
```

### 5.1 Activities between checkpoints

| Segment | Activity | Exactly what moves |
|---|---|---|
| start → 1 | `blink` | Two slow blinks. Each blink: eyes `scaleY` 1 → 0.08 → 1 over 140 ms. Blinks happen at `segmentProgress` 0.25 and 0.6. Mouth is `calm` |
| 1 → 2 | `happy` | Expression eased to `happy`. Cloud bounces: vertical offset `sin(segmentProgress × 6π) × 10px`. A blush (`#blush`) fades in on both cheeks |
| 2 → 3 | `laugh` | Expression eased to `laugh`. Cloud shakes: rotation `sin(time × 18) × 1.5°` plus scale pulse 1 ↔ 1.02. **Two tears** (`#tear`) spawn at the eyes, fall 28px and fade, loop every 700 ms, offset by 350 ms |
| 3 → 4 | `sleep` | Expression eased to `sleep`. Cloud "breathes": scale 1 ↔ 1.03 every 3 s. Three Z glyphs (`#z`) rise and fade in sequence from the cloud's upper right: small, medium, large, each taking 1.6 s, staggered by 0.5 s. In the final 12% the Z glyphs fade out and a single wake-up blink plays |
| 4 → exit | `blink` | One blink at `segmentProgress` 0.3, then a smile as the cloud leaves |

Rules:

- Activities are driven by `segmentProgress` (scroll). Only the small loops (tear falling, Z rising, breathing) use real time, and only while that segment is active.
- Only one activity is active at a time.
- When scrolling stops, the cloud keeps doing its small loop. It never freezes in a broken pose.

---

## 6. Layout, content and sky

### 6.1 Layout (desktop)

```
┌──────────────────────────────────────────────────────────┐
│  (sticky stage: 100vh, full width)                       │
│                                                          │
│   ☁ cloud (left)                  ┌──────────────────┐  │  checkpoint 1: card on the right
│                                   │  Sky             │  │
│                                   │  text · 3 photos │  │
│                                   └──────────────────┘  │
└──────────────────────────────────────────────────────────┘
 wrapper height: 700vh (the page scrolls through this)
```

| Checkpoint | Cloud side | Card side |
|---|---|---|
| 1 | left | right |
| 2 | right | left |
| 3 | left | right |
| 4 | right | left |

Cloud size: `clamp(200px, 26vw, 420px)` wide. Card width: `min(520px, 38vw)`.

Layers, back to front: sky and stars → nebula/aurora tint → faint dotted path line → mist trail → **cloud** → content card → progress dots.

### 6.2 Layout (mobile, under 768px)

- Use the mobile path (viewBox `390 × 900`).
- Cloud width `clamp(150px, 44vw, 220px)`.
- Card sits **above or below** the cloud (opposite vertical half), full width minus 32px, with a maximum height of 52vh. Cards never cover the cloud's face.
- Wrapper height 600vh.

### 6.3 Sky tint per checkpoint

The sky starts exactly where the hero ended (midnight values from the Orb plan) and shifts a little at each checkpoint.

| Checkpoint | Sky top | Sky bottom | Glow | Cloud tint (`--cloud-top` / `--cloud-bottom`) |
|---|---|---|---|---|
| Start | `#03060f` | `#0a1030` | none | `#dfe6f5` / `#9fb0d6` |
| 1 Sky | `#071a3a` | `#16306a` | moon-blue | `#f2f6ff` / `#b8c8ec` |
| 2 Nature | `#08272b` | `#0f4a45` | aurora green | `#eafff6` / `#a9d8c8` |
| 3 Numbers | `#1a1040` | `#3b2370` | nebula violet | `#f6eeff` / `#c7b3ee` |
| 4 Contact | `#2a1740` | `#7a3d6a` | pre-dawn rose | `#fff0f0` / `#e2b4c4` |
| Exit | `#2a1740` | `#7a3d6a` | pre-dawn rose | same as 4 |

Blend colors using the same `j`, as CSS variables on the stage.

### 6.4 Content mapping (fill from the Phase 1 inventory)

| Checkpoint | Heading | Content (take from the old homepage, do not invent) |
|---|---|---|
| 1 | Sky | The sky collection: short intro, 3 featured photos with time, location and cloud-type tag, link "See the sky collection" |
| 2 | Nature | The nature collection: short intro, 3 featured photos, link "See the nature collection" |
| 3 | Numbers | The real gallery counters (photos, locations, etc.) from the old homepage |
| 4 | Contact | The call to action, subscribe or contact from the old homepage, one button |

If the old homepage had more content than fits, put the extra links in a small list under the card of the closest checkpoint. **No content from the old homepage may be lost without your approval.**

---

## 7. Cinematic details (Phase 8 only; skip until the basics work)

| Effect | Exact rule |
|---|---|
| Mist trail | 12 small soft circles follow the cloud. Each trails the cloud's position from 80 ms to 900 ms earlier, fading out. Only on desktop |
| Camera drift | The whole stage layer shifts 0–24px opposite to the cloud's movement for depth. Stars shift half as much |
| Card entrance | When a checkpoint becomes active, its card fades in and rises 24px over 500 ms. When it ends, it fades out. **Never move sideways** |
| Dotted path | The path is drawn as a faint dotted line (opacity 0.25). The part already travelled glows brighter |
| Progress dots | 4 dots on the right edge, one per checkpoint, click to jump. The active one is larger |
| Eye follow | At each checkpoint the eyes shift 2px toward the card (a "look at it" feel) |
| Shooting star | One shooting star during the sleep segment only |

---

## 8. Phases

Every phase has: **Goal, Tasks, Do not, Done when, Commit**. Do not start a phase before the previous one passes.

### Phase 0 — Deployment diagnosis
- **Goal**: find out why deployed ≠ localhost and fix it.
- **Tasks**: run the checklist in §2.1 in order; add the version stamp from §2.2; write `DEPLOY_NOTES.md`.
- **Do not**: change any visual code in this phase.
- **Done when**: the version stamp is visible on the live site in a private window.
- **Commit**: `chore: fix deployment and add version stamp`

### Phase 1 — Inventory and cleanup of the old homepage
- **Goal**: save the old homepage content, then remove the old sections completely.
- **Tasks**:
  1. List every section of the current homepage below the hero in a table: section name, headings, text, images, links, numbers, buttons.
  2. Save all of it as data in `content/journey.ts` (typed object with 4 groups: `sky`, `nature`, `numbers`, `contact`; plus `extraLinks`). Keep original wording.
  3. Show the table to the user and **wait for approval of the mapping** to the 4 checkpoints (§6.4).
  4. Delete the old section components, their CSS, and unused images from `public/`. Delete any code and styles that only they used.
  5. Leave an empty `<section id="cloud-journey">` right after the hero and before the footer.
- **Do not**: touch the hero or the footer. Do not keep old sections hidden with CSS. Delete them.
- **Done when**: build passes, no unused imports remain, the page shows hero → empty section → footer, and `content/journey.ts` has all the old content.
- **Commit**: `refactor: remove old homepage sections, save content`

### Phase 2 — Install the cloud assets
- **Goal**: add and validate the design files.
- **Tasks**: copy `cloud-character/` to `public/3d/cloud-character/` (keep the preview files in `docs/`, not in `public/`); write a typed loader for `cloud-rig.json`; add a check that every shape has 7 circles and that all shapes have the same keys.
- **Do not**: change any number in `cloud-rig.json` without telling the user.
- **Done when**: a debug page renders the 4 static SVGs side by side and the loader's validation passes.
- **Commit**: `feat: add cloud character assets and rig loader`

### Phase 3 — Static stage and layout
- **Goal**: the sticky stage, wrapper height, cards, and the static cloud at each checkpoint. **No motion yet.**
- **Tasks**: wrapper 700vh (desktop) and 600vh (mobile); sticky stage 100vh; a debug slider that sets `j`; place the cloud and card for each checkpoint according to §6.1 and §6.2; draw the dotted path from `cloud-rig.json`.
- **Do not**: use GSAP pin, `overflow: hidden` on the wrapper (it breaks sticky), or horizontal slides.
- **Done when**: using the slider, each checkpoint shows its card without clipping at 360, 390, 768, 1024, 1440 and 1920 px, and the card never covers the cloud's face.
- **Commit**: `feat: static cloud journey layout`

### Phase 4 — Cloud follows the path
- **Goal**: scroll moves the cloud along the path and parks it at checkpoints.
- **Tasks**: compute `j` from scroll position of the wrapper; implement `remap()` from §4; move the cloud with `getPointAtLength()`; compute `activeCheckpoint`, `segment`, `segmentProgress` with hysteresis; show them in a small debug panel.
- **Do not**: use more than one scroll listener. Use one `requestAnimationFrame` loop reading the scroll position.
- **Done when**: scrolling slowly parks the cloud at 0.203, 0.411, 0.604, 0.809 (desktop), scrolling back reverses exactly, and nothing jumps at the start or end.
- **Commit**: `feat: cloud follows path with checkpoint parking`

### Phase 5 — Shape morph
- **Goal**: the cloud changes shape between checkpoints.
- **Tasks**: render the cloud from the rig numbers in one `<svg>` (7 circles + 1 rect); apply the blend rule from §5.
- **Do not**: swap SVG files during scroll, or fade between 2 images. Interpolate the numbers.
- **Done when**: at every checkpoint the shape is exactly the checkpoint shape, and the middle of each segment looks like the "morph at 50%" images (a clean blend with no holes or flicker).
- **Commit**: `feat: cloud shape morph`

### Phase 6 — Face and checkpoint expressions
- **Goal**: eyes and mouth, with expression changes at checkpoints.
- **Tasks**: 2 ellipses and 1 path for the mouth; implement expressions from §3.3; blend between expressions with the 12% rule from §5; eyes shift 2px toward the card at a checkpoint.
- **Do not**: add other facial features.
- **Done when**: the 4 checkpoint expressions match the table in §3.3, and the mouth is always a single line.
- **Commit**: `feat: cloud face and checkpoint expressions`

### Phase 7 — Activities between checkpoints
- **Goal**: blink, happy, laugh, sleep.
- **Tasks**: implement every row of §5.1 exactly, including tears and Z glyphs from `cloud_face_parts.svg`.
- **Do not**: run two activities at once, or let loops keep running while their segment is inactive.
- **Done when**: each segment shows only its own activity, the laugh shows exactly 2 tears, the sleep shows 3 Z glyphs one after another, and the cloud wakes with a blink at checkpoint 4.
- **Commit**: `feat: cloud activities`

### Phase 8 — Content and cinematic polish
- **Goal**: show the real content and add the effects from §7.
- **Tasks**: render cards from `content/journey.ts`; card entrance and exit; sky tint from §6.3; mist trail; camera drift; progress dots; shooting star.
- **Do not**: add any effect that is not in §7.
- **Done when**: all 4 cards show the approved content, the sky colors match the table, and the section ends cleanly into the footer.
- **Commit**: `feat: journey content and cinematic effects`

### Phase 9 — Mobile, reduced motion, accessibility
- **Goal**: works for everyone.
- **Tasks**:
  - Mobile layout from §6.2 using the mobile path and fractions.
  - `prefers-reduced-motion`: no path travel and no activities. Show 4 stacked blocks, each with its static cloud SVG (`cloud_cumulus.svg` and so on) beside its card, with no scroll animation.
  - No-JS: the same stacked version.
  - Cards are real text (not images), headings in order, contrast at least 4.5:1 against every sky tint (add a soft panel behind text if needed).
  - The cloud is decorative: `aria-hidden="true"`. Tears and Zs are hidden from screen readers too.
  - Progress dots are buttons with labels ("Go to Sky", and so on) and visible keyboard focus.
- **Done when**: the three modes (full, reduced motion, no-JS) all show all four contents.
- **Commit**: `feat: mobile, reduced-motion and accessibility`

### Phase 10 — Performance, QA, deploy
- **Goal**: ship it.
- **Tasks**: animate only `transform` and `opacity` where possible (circle attributes may change, but update them in one batch per frame); pause the loop when the section is off-screen; remove debug panels; run Lighthouse; deploy; check the live site in a private window.
- **Done when**: the checklist in §9 is all ticked **on the live site**, not only on localhost.
- **Commit**: `perf: polish and release journey section`

---

## 9. Final QA checklist (test on the live site)

- [ ] Old homepage sections are gone, and none of their content was lost
- [ ] Cloud flies in blinking, and parks at the 4 checkpoints
- [ ] Shapes: cumulus, stratus, tower, comet, in that order
- [ ] Expressions at checkpoints: calm, wide, proud, awake
- [ ] Activities between: blink, happy, laugh (2 tears), sleep (3 Z)
- [ ] Face is always 2 circles and 1 line
- [ ] Scrolling backwards reverses everything with no stuck poses
- [ ] No text or card clipped at 360, 390, 768, 1024, 1440, 1920 px
- [ ] Sky continues from midnight with no jump, and the footer follows cleanly
- [ ] Reduced-motion and no-JS versions show all four contents
- [ ] Version stamp visible in a private window on the live site
- [ ] Mobile Lighthouse performance above 80

---

## 10. First prompt to give Codex (Phase 0 only)

```
Read AERIS_CLOUD_JOURNEY.md and AERIS_ORB_SCROLL_SITE.md.
Do Phase 0 only (deployment diagnosis). Follow section 2 in order.
Do not change any visual code. When done, write DEPLOY_NOTES.md,
show me the cause you found and the fix, confirm the version stamp
is visible on the live site in a private window, and stop.
```
