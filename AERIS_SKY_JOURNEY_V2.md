# AERIS: Sky Journey V2

**One scroll. One day. Sunrise → Noon → Sunset → Night with a moon.**
A clean rebuild plan for VS Code + Codex. This file **replaces** all earlier sky plans (`AERIS_3D_SKY_JOURNEY_PLAN.md`, `AERIS_3D_SKY_JOURNEY_PHASES.md`, the 2D "Cinematic Day-to-Night" document).

> **Tell Codex:** *"Read `AERIS_SKY_JOURNEY_V2.md` fully. Do ONE phase per run. Build static first, animate second. After each phase run `npm run check`, take the screenshots from Section 9, commit, and wait for my approval."*

---

## 1. What Is Wrong Right Now (from your latest screenshot)

The live site still shows the old problems, plus new clutter:

| Seen in the screenshot | Problem |
|---|---|
| Hero text reads "he light." / "graph." | The headline is **shifted off the left edge of the screen** (it is clipped, and the offset even changed between two screenshots, so something is moving it). |
| Header logo and nav half hidden under the orange "Demo mode" bar | Banner and fixed header overlap. |
| Two dropdowns ("Sky Dawn" and a raw dark "Dusk" select) plus a floating "Back to scroll" chip in the header | Three controls doing one job, overlapping the nav. |
| A fuzzy blue disc on a **photograph** | A fake sun pasted on a flat photo. No depth. |
| Odd rail on the right with rotated "10" and "90" labels | Unfinished. |
| Round icons on the far right (book, podcast, grid, purple face) | Most likely **browser extensions**, not your site. Check by opening the site in an Incognito window. If they vanish, ignore them. |

**Why patching keeps failing:** each new request was layered on top of the old hero, so old transforms, old selects and the old photo keep fighting the new code.

**New strategy (non-negotiable):**
1. **Delete the old hero and Sky Clock UI. Do not patch them.** Build the journey as a new, self-contained module.
2. **Static first, animation second.** Lay out every section with plain CSS and confirm it fits at all screen sizes **before** adding any motion.
3. **No horizontal transforms on text containers. Ever.** Text may only animate `opacity` and `translateY`. This alone prevents the clipping bug.
4. **Use CSS `position: sticky` for the pinned stage**, not GSAP `pin`. GSAP pin creates spacer wrappers and offsets that commonly cause exactly this kind of bug.
5. **Prove every phase with screenshots**, not with "it should work."

---

## 2. The Experience (what the visitor sees)

The first screen **is** the journey. The whole homepage hero becomes one pinned stage while you scroll through about five screen-heights. The sun, sky, clouds, stars, moon and text all move together.

| Scene | Scroll range | Time | Sky and light | Text (left unless noted) |
|---|---|---|---|---|
| **1 Sunrise** | 0.00 to 0.22 | 05:48 | Dark indigo sky, warm glow behind misty ridges, sun just breaking the horizon, a few clouds catching peach light, faint stars fading out | Eyebrow "SUNRISE" · **Read the *sky.*** · "A journal of light, cloud and weather. Begin where the day begins." · CTA **Explore the sky →** |
| **2 Noon** | 0.26 to 0.50 | 12:10 | Clean blue sky, sun high and white, **bright clouds drifting with your scroll** | Eyebrow "NOON" · **Under an endless *blue.*** · "Cloud studies, light and weather, read slowly." · CTA **Open the Cloud Atlas →** |
| **3 Sunset** | 0.54 to 0.78 | 17:52 | Sun sinks behind the ridge on the left, sky goes amber → coral → rose → violet, clouds turn into glowing silhouettes | **Text moves to the right side.** Eyebrow "SUNSET" · **Light, before it *leaves.*** · CTA **Plan your golden hour →** |
| **4 Night** | 0.82 to 1.00 | 22:30 | Deep navy sky, **sparkling stars**, a lit moon with a soft halo, rare shooting stars | Eyebrow "NIGHT" · **When the sky becomes *infinite.*** · CTAs **Start your sky journal** and **Browse the gallery** |

- Between scenes, the outgoing text rises 24px and fades out (mask reveal), while the incoming text rises into place. The sun, light and text change together, never as separate "slides."
- The italic word in each headline is a serif italic accent.
- **After the journey**, the rest of your homepage (gallery, Cloud Atlas, Planner teaser, footer) continues on the **night sky** (deep navy with faint stars), so there is no jump back to daylight.

---

## 3. Visual Direction (the "polished" bar)

**Look:** cinematic, quiet, editorial. Premium because of light, depth and restraint, not because of many effects.

| Item | Spec |
|---|---|
| Fonts | Display: Cormorant Garamond (light/regular, italic accent). Body/UI: Inter. Load with `font-display: swap`. |
| Headline | `clamp(3rem, 8vw, 7rem)`, weight 300, line-height 0.98, letter-spacing −0.02em, max width about 14ch per line |
| Eyebrow | 12px, uppercase, letter-spacing 0.2em, with a thin line and the time ("05:48") |
| Body | `clamp(1rem, 1.1vw + .6rem, 1.2rem)`, max width 46ch, line-height 1.65 |
| Buttons | Pill, cloud-white fill + navy text (primary), glass outline (secondary), arrow nudges 4px on hover, visible focus ring |
| Glass | `background: rgba(255,255,255,.06)`, `backdrop-filter: blur(14px)`, 1px border `rgba(255,255,255,.12)`, radius 20px |
| Nav | One floating glass pill, centered: AERIS · Gallery · Cloud Atlas · Planner · Collections · Sign in. Hides on scroll down, returns on scroll up. |
| Grain | 3 to 4% static noise overlay |
| Motion | One easing curve for everything: `cubic-bezier(.22, 1, .36, 1)`. Text in/out 700 ms. Nothing bounces. |
| Spacing | 8px rhythm; side padding `clamp(1.25rem, 6vw, 6rem)` |

**Text legibility rule (every scene):** headline (large text) at least 3:1 contrast, small text at least 4.5:1. In the bright noon scene switch text to deep navy `#0B1A24`. In sunset and night use cloud-white `#EAF4F7` with a soft scrim behind the text block. Verify at 6 points through the journey.

---

## 4. Timeline and Palette (single source of truth)

All visuals read from one function: `sample(p)` where `p` is 0 to 1.

| p | Moment | Sky top | Sky mid | Horizon | Text color | Stars | Cloud brightness |
|---|---|---|---|---|---|---|---|
| 0.00 | Pre-dawn | `#07111F` | `#13243B` | `#3B4960` | `#EAF4F7` | 0.5 | 0.25 |
| 0.12 | Sunrise | `#182A45` | `#C77E67` | `#F1B77E` | `#EAF4F7` | 0.05 | 0.7 (peach) |
| 0.30 | Morning | `#3F7FB0` | `#9CC7DD` | `#F3D2A8` | `#0B1A24` | 0 | 0.95 |
| 0.42 | Noon | `#5FA3CE` | `#A9D5E8` | `#DDEEF3` | `#0B1A24` | 0 | 1.0 |
| 0.58 | Golden hour | `#587C9B` | `#D99561` | `#F2B56F` | `#EAF4F7` | 0 | 0.9 (amber) |
| 0.72 | Sunset | `#4A3654` | `#B75F5D` | `#E58A62` | `#EAF4F7` | 0 | 0.6 (rim glow) |
| 0.84 | Twilight | `#141A3A` | `#34376B` | `#7A4F78` | `#EAF4F7` | 0.5 | 0.2 |
| 1.00 | Night | `#030712` | `#071329` | `#0B1832` | `#EAF4F7` | 1.0 | 0.1 |

Interpolate every column with smoothstep between the two surrounding rows. Never snap. Starting values; tune by eye.

**Sun path (hand-authored in screen space, interpolated with a spline):**

| p | x | y | size | note |
|---|---|---|---|---|
| 0.00 | 70% | 88% (below ridge) | 1.0 | not visible yet |
| 0.12 | 68% | 74% | 1.3 | breaking the horizon, wide warm glow |
| 0.30 | 60% | 40% | 0.9 | rising |
| 0.42 | 50% | 16% | 0.7 | highest, white, tight glow |
| 0.58 | 40% | 40% | 0.9 | descending, amber |
| 0.72 | 30% | 74% | 1.4 | touching the ridge, very soft and wide |
| 0.80 | 26% | 92% | 1.4 | gone behind the ridge, fades out |

**Moon path:** appears at p 0.80, `x 78%, y 62%` → `x 74%, y 24%` at p 1.0. Understated, with a soft halo.

---

## 5. Technical Architecture

```
src/sky-journey/
  SkyJourney.tsx        the section: sticky stage + content + rail
  journey.css           layout (plain CSS, no animation yet)
  timeline.ts           sample(p), sun/moon keyframes (pure functions)
  useJourneyProgress.ts progress 0..1 from scroll (ref based, no setState)
  scenes.ts             the 4 scenes: copy, text side, in/out ranges
  webgl/
    JourneyCanvas.ts    renderer, camera, loop, dispose
    sky.ts  sun.ts  clouds.ts  landscape.ts  stars.ts  moon.ts
public/3d/              moon_color_2k.webp, moon_color_4k.webp, moon_bump_2k.webp
public/3d/clouds/       cloud_1.webp ... cloud_4.webp
```

**Layout skeleton (plain CSS, build and verify this first):**
```css
.journey        { position: relative; height: 520vh; }              /* scroll track; 440vh on mobile */
.journey__stage { position: sticky; top: 0; height: 100dvh; overflow: clip; }
.journey__canvas{ position: absolute; inset: 0; width: 100%; height: 100%; }
.journey__content {
  position: absolute; inset: 0; display: grid; align-items: center;
  padding-inline: clamp(1.25rem, 6vw, 6rem);
  padding-top: var(--header-h, 88px);
}
.scene { grid-area: 1 / 1; max-width: min(40rem, 100%); }          /* all scenes stack in one grid cell */
.scene[data-side="right"] { justify-self: end; text-align: left; }
```
**Progress (no React state):**
```ts
const track = trackRef.current!;
const p = clamp((scrollY - track.offsetTop) / (track.offsetHeight - innerHeight), 0, 1);
```
- Use the **existing Lenis** scroll value. One Lenis, one `gsap.ticker` loop, no second `requestAnimationFrame`.
- Smooth the value: `smooth += (p - smooth) * (1 - Math.exp(-6 * dt))`.
- Drive everything (WebGL uniforms, text opacity/translateY, rail, HUD) from `smooth` through refs. **No React re-renders per scroll frame.**
- Every value of `p` must produce a complete, correct picture (no dependence on triggers firing).

**Scene text rule:** each scene has `inStart, inEnd, outStart, outEnd`. Opacity and `translateY` only (24px up). The container never receives `x`, `xPercent` or horizontal transforms.

**One time control instead of three:** a slim vertical **time rail** on the right with 4 stops (Sunrise 05:48 · Noon 12:10 · Sunset 17:52 · Night 22:30). The active stop glows in the current accent color. Clicking a stop scrolls there with Lenis. Remove the "Sky" dropdown, the raw "Dusk" select and the "Back to scroll" chip completely. No separate "clock mode."

**Demo-mode notice:** a small dismissible pill at the bottom center (or in the footer), never above the header. Header offset is always `top: 0` with no overlap.

**Optional HUD** (bottom-left, one quiet line): `05:48 · Sunrise · Sun 3°`, updated through a ref.

---

## 6. WebGL Scene Spec

Use **vanilla Three.js** (already installed). One canvas, `PerspectiveCamera`, `ACESFilmicToneMapping`, `outputColorSpace = SRGBColorSpace`, DPR capped at 2 (1.5 on mobile). Lazy-load the WebGL module after first paint; show the CSS gradient (from `sample(p)`) until the canvas is ready, then cross-fade 400 ms.

| Layer | Depth (z) | How |
|---|---|---|
| Sky dome | far | Inverted sphere + gradient shader (top/mid/horizon from `sample(p)`) + dithering to avoid banding |
| Stars | far | See 6.2 |
| Moon | far | Textured sphere, see 6.3 |
| Sun | far | Core sphere + 2 additive glow sprites (tight + very wide, canvas-generated radial gradient). Redder, flatter and more diffused near the horizon; whiter and smaller at noon. Never a flat neon disc. |
| Clouds | −200 / −350 / −550 | See 6.1 |
| Ridges | −120 / −220 / −340 / −480 | Noise-displaced silhouette layers. Far layers blend toward the horizon color (haze); near layers darkest with a thin warm rim light toward the sun. Optional instanced pine silhouettes (under 200) on the nearest ridge. Mist band between layers, strongest at sunrise. |

**Camera:** slow dolly and tilt with `p` (about ±5° pitch, ±3 units forward), plus ±0.6 unit mouse parallax on desktop (damped). Intro on first load (about 2 s): the sun lifts slightly from behind the ridge and the mist thins, then scroll takes over.

### 6.1 Clouds (moving with scroll in the daytime)
- **Sprites provided:** `public/3d/clouds/cloud_1.webp` to `cloud_4.webp` (1024x512, about 30 KB each, white with baked soft shading and transparency). Load as `Sprite` or textured planes; **tint with the material color** from the timeline (`cloud brightness` column; peach at sunrise, white at noon, amber at golden hour, violet-grey at dusk).
- 3 depth layers, 5 to 7 clouds each on desktop (3 to 4 on mobile). Far layers smaller, hazier and slower.
- **Movement = scroll + slow drift:** `x = baseX + (p * speed * layerFactor)` plus a tiny time drift (0.5 to 2 units/s). Layer factors about 1.0 / 0.6 / 0.3, so closer clouds sweep across faster as you scroll (clear parallax). Wrap clouds around when they leave the view.
- Opacity follows the timeline: faint at pre-dawn, full at noon, glowing rims at sunset, nearly gone at night (keep 1 to 2 dark silhouettes at night for atmosphere).
- These are generated sprites. If you later want photoreal clouds, swap in CC0 cloud textures (Poly Haven) with the same loader; no code change.

### 6.2 Stars (sparkling and dynamic at night)
- **Three classes:** about 2500 tiny stars, 500 medium, and 40 bright "sparkle" stars (desktop; about 40% of that on mobile).
- **Twinkle:** per-star random phase and speed in the shader (brightness 0.7 to 1.0), the bright stars flare with a **4-point sparkle** sprite that gently pulses at different rates.
- **Color variety:** mostly white, a few warm and blue-white stars.
- **Movement:** the whole star group **rotates slowly with scroll** (about 0.35 rad over the night range) so the sky feels alive, plus a faint mouse parallax.
- **Milky Way:** one faint diagonal band of dense, very low-opacity stars/noise. Subtle.
- **Shooting stars:** at full night, one every 7 to 14 s at a random upper position, 0.8 s streak, soft fade. Off under reduced motion.
- Stars fade in from p 0.78 and are fully visible by 0.95. A faint set exists at p 0 (fading out by sunrise). They never draw over the sun glow.

### 6.3 Moon (uses your NASA texture)
- Files are ready in `public/3d/`: `moon_color_2k.webp` (default), `moon_color_4k.webp` (high tier only), `moon_bump_2k.webp` (subtle relief, `bumpScale` 0.2). **Never load the original 8000x4000 file.** Move it out of `public/`.
- `SphereGeometry(1, 64, 64)`, about 3.5° wide on screen. `MeshStandardMaterial({ map, bumpMap, roughness: 1, color: 0xece9e2, emissive: 0x0a1020, emissiveIntensity: 0.4 })` (the faint emissive is "earthshine" so the dark side is not pure black). Color map `colorSpace = SRGBColorSpace`, `anisotropy = 4`.
- **Near side faces the camera, no spin** (the real Moon is tidally locked; the map's poles are smeared). Only a tiny libration wobble (±3°, very slow). Orientation check: dark seas on the upper left, small dark oval Mare Crisium near the right edge, bright rayed crater Tycho toward the bottom. If the mesh's +z faces the camera, start with `rotation.y = -Math.PI / 2`.
- A pale blue-white `DirectionalLight` from the side gives a natural gibbous phase. A soft additive halo sprite plus a very faint larger ring at full night.
- Footer credit: "Moon texture: NASA Scientific Visualization Studio (CGI Moon Kit)".

---

# PHASES

| Phase | Name | Result | Status |
|---|---|---|---|
| 0 | Clean slate | Old hero and clutter removed, header fixed, branch + tag | ☐ |
| 1 | Stage and scroll engine | Sticky stage, 4 text scenes, time rail, CSS gradient sky (no WebGL) | ☐ |
| 2 | Sky and sun | WebGL sky + sun moving with scroll | ☐ |
| 3 | Landscape and clouds | Ridges, mist, clouds drifting with scroll | ☐ |
| 4 | Sunset, stars and moon | Cinematic sunset, sparkling stars, moon | ☐ |
| 5 | Polish and integration | Nav, cursor, grain, night continuation of the page | ☐ |
| 6 | Performance and accessibility | Quality tiers, mobile, reduced effects | ☐ |
| 7 | Final QA and docs | Screenshots, checklist, README | ☐ |

---

## Phase 0: Clean Slate

**Tasks**
1. `git checkout -b feature/sky-journey-v2` and `git tag stable-before-v2`.
2. **Delete** from the home page: the old photo hero, the fake blue sun disc, the "Sky" pill and popover, the raw "Dusk" `<select>`, the "Back to scroll" chip, the old right rail with "10 / 90", and any SkyMode/clock-mode code. Remove dead CSS and unused components.
3. Fix the header: `top: 0`, no overlap. Move the Demo-mode notice to a dismissible bottom pill.
4. Keep: routes, auth, gallery, Planner, Atlas, Collections, cursor, Lenis, Reduce Effects.
5. Make the home page temporarily render: header + a plain dark hero block with the headline from Scene 1 (static) + the remaining sections below.
6. Verify no horizontal overflow (run this in the console, fix everything it lists):
   ```js
   [...document.querySelectorAll('body *')].filter(e => {
     const r = e.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1;
   }).map(e => e.tagName + '.' + e.className);
   ```
7. Confirm exactly one `new Lenis` and one ticker loop (`grep` for both).

**Done when:** headline fully visible and left-aligned at 360, 390, 768, 1024, 1440, 1920 px; header clear; `npm run check` green.
**Commit:** `refactor(home): remove old hero and sky clock clutter`

## Phase 1: Stage and Scroll Engine (no WebGL)

**Tasks:** build `.journey` / `.journey__stage` / `.journey__content` exactly as in Section 5; four `.scene` blocks with the copy from Section 2; `timeline.ts` + `useJourneyProgress.ts`; text in/out by opacity + translateY; the time rail; the sky as a **CSS gradient** driven by `sample(p)` through CSS variables; text color per `sample(p)`; `?p=0.42` dev param to freeze progress; dev-only debug line.

**Done when:** scrolling slowly shows four scenes crossing smoothly, sky colors blend continuously, text never clips or moves sideways, rail clicks work, reverse scroll works, mobile (390x844) fits.
**Commit:** `feat(journey): add sticky stage, scroll engine and text scenes`

## Phase 2: Sky and Sun

**Tasks:** `JourneyCanvas.ts` (renderer, loop on the existing ticker, resize, visibility pause, dispose, lazy-load, cross-fade from the CSS sky); sky dome shader fed by `sample(p)`; sun core + glow sprites on the Section 4 path; sunrise intro; fade the sun out behind the ridge area after p 0.80.

**Done when:** sun rises from the lower right, crosses high at noon, sinks on the left, looks atmospheric (no neon disc), and matches the text scenes.
**Commit:** `feat(journey): add WebGL sky and scroll-driven sun`

## Phase 3: Landscape and Clouds

**Tasks:** ridge layers with haze and rim light; mist band; optional pine silhouettes; camera dolly/tilt and mouse parallax; cloud sprites from `public/3d/clouds/` in 3 layers with scroll-driven parallax plus slow drift, tinted per timeline; wrap-around.

**Done when:** you can feel depth; clouds visibly sweep with the scroll in the daytime and tint warm at sunrise and sunset; no popping.
**Commit:** `feat(journey): add layered landscape and scroll-driven clouds`

## Phase 4: Sunset, Stars and Moon

**Tasks:** tune p 0.55 to 0.90 into one cinematic shot (amber → coral → rose → violet, clouds to silhouettes, ridge rim light fading); stars (3 classes, twinkle, sparkle sprites, scroll rotation, Milky Way, shooting stars); moon (Section 6.3); no black flash; night stays a deep navy, never pure black.

**Done when:** scrubbing p from 0.55 to 1.0 looks like a film shot; stars sparkle and slowly turn; the moon shows maria and craters and does not spin.
**Commit:** `feat(journey): add sunset, sparkling stars and NASA moon`

## Phase 5: Polish and Integration

**Tasks:** floating glass nav pill (hide on scroll down); cursor colors follow `sample(p)` (peach, sky blue, amber, violet, sea-glass); grain overlay; one-line HUD; after-journey sections placed on a **night-sky background** (deep navy with faint static stars) so the page continues naturally; photo cards styled as framed "memories" with capture chips (time, location, cloud type); counters using real gallery data; consistent spacing and type per Section 3.

**Done when:** the whole page feels like one product, with no leftover old styling.
**Commit:** `style(home): polish nav, cursor and night continuation`

## Phase 6: Performance and Accessibility

**Tiers:** high (DPR ≤ 2, 3000 stars, bloom optional) · medium (DPR ≤ 1.5, 2000 stars, no bloom) · low/mobile (DPR ≤ 1.25, 1200 stars, fewer clouds, no parallax) · static (no WebGL, Reduce Effects, `prefers-reduced-motion`: CSS gradient + still scene, normal scrolling).
**Tasks:** adaptive quality if frame time stays above about 22 ms; pause when the tab is hidden; handle `webglcontextlost`; dispose everything on unmount; canvas `aria-hidden`; all text real DOM in order; keyboard navigation and visible focus rings; rail is keyboard operable; mobile uses 440vh track and keeps natural touch scroll.

**Done when:** about 60 fps on a normal laptop, smooth on a mid phone, Lighthouse mobile Performance ≥ 85, CLS < 0.05.
**Commit:** `perf(journey): add quality tiers, mobile and reduced-motion fallbacks`

## Phase 7: Final QA and Docs

Run the screenshot script (Section 9), the checklist below, then update the README (journey overview, timeline, how to tune keyframes, quality tiers, asset credits).

**Final checklist**
- [ ] Headline and all text fully visible at every width; no horizontal scroll
- [ ] Header never overlapped; no dropdown clutter; one time rail
- [ ] Sunrise first screen; sun moves with scroll through noon, sunset, gone
- [ ] Text changes smoothly with each scene; side switches at sunset
- [ ] Clouds drift with scroll in the day; sparkling, slowly rotating stars at night; moon with halo; rare shooting stars
- [ ] No black flash, no color banding; reverse scroll works; any scroll position is a complete picture
- [ ] Contrast OK in all scenes; reduced motion and no-WebGL fallbacks work
- [ ] Existing routes, gallery, Planner, Atlas, Collections, auth still work
- [ ] 8000x4000 moon file not shipped; NASA credit in footer
- [ ] No console errors; `npm run check` passes

**Commit:** `docs: document sky journey v2`

---

## 9. Screenshot Proof (every phase)

Add `scripts/journey-shots.mjs` (Playwright, devDependency). For `p` in `[0, 0.12, 0.3, 0.42, 0.58, 0.72, 0.84, 1.0]` and viewports **1920x1080** and **390x844**, open `/?p=<p>`, wait for the canvas, and save `shots/journey-<p>-<width>.png`. Codex must **look at them** and fix any: clipped or sideways text, header overlap, unreadable text, horizontal scroll, black flashes, banding, or a flat sun/moon. A phase is not finished until the screenshots are clean.

---

## 10. First Prompt to Give Codex

```
Read AERIS_SKY_JOURNEY_V2.md completely.
Create branch feature/sky-journey-v2 and tag stable-before-v2.
Do Phase 0 only. Delete the old photo hero, the fake sun disc, the Sky pill,
the raw "Dusk" select, the "Back to scroll" chip, the old right rail and any
SkyMode code. Fix the header/banner overlap. Replace the hero with a static,
plain-CSS version of Scene 1 and make sure the headline is fully visible and
left-aligned at 360, 390, 768, 1024, 1440 and 1920 px with no horizontal scroll.
Run npm run check and give me screenshots. Do not add any animation or WebGL yet.
```
