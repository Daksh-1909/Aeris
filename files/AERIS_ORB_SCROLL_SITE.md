# AERIS — Orb Scroll Site (Sunrise → Midnight)

A scroll-driven homepage modeled on your reference video. In the video, one hero object (the jar) stays near the center, rotates and tilts as you scroll, and big headlines swap around it. Here, **the jar becomes the Orb: one object that is the sun and then turns into the moon.** Everything else (sky, clouds, grass, flowers, bench, people, nebula, aurora) changes around it.

> This file replaces the earlier sky plans. Follow the phases in order. Give Codex one phase at a time.

---

## 1. What the reference video does (frame-by-frame read)

The video is a phone recording of a laptop screen, about 18 seconds long. I extracted frames at 1 frame per second.

| Time | What is on screen | What it teaches us |
|---|---|---|
| 0–1s | Flat red page. Jar sits lower-center, tilted. Tiny copy block + small pill button on the **left edge**. | Hero is calm. The object is the star. Copy is small and tucked away. |
| 1–2s | Big gold uppercase headline "A NEW ANGLE OF FLAVOR" enters at **top-left**. Jar rotates upright-to-sideways. | Headline is huge, left-aligned, and the object overlaps it. |
| 3s | Headline "UNWRAP THE ADVENTURE" is **centered**, jar passes in front of the letters. | Object sits between text layers (text behind and in front). |
| 4s | Jar centered, rotated about 90°. Small copy + pill moves to **bottom-right**. | Small copy swaps sides each beat. |
| 5s | "A NEW PERSPECTIVE ON TASTE" on the left, jar overlaps again. | Same pattern repeats, so each beat = headline + side copy + object pose. |
| 6s | Jar tips over and pours. A dark-and-magenta split panel **slides up from the bottom** ("WHAT'S INSIDE"). | The hero ends with a transition that hands over to the next section. |
| 7–8s | Split panel fills the screen: dark text half on the left, magenta image half on the right, object held in a hand. | Section 2 is a 50/50 split with a bold color change. |
| 9–10s | Page turns **cream**. "TRADITION & CREATION" top-left, photo cards float in at different positions and speeds. | Calm content section with parallax photo cards. |
| 11–12s | "WHY THE JAR MATTERS" centered, two small text columns, a row of photo tiles below. | Content section with a gallery strip. |
| 13–14s | Gallery bleeds to the edges, then a full-bleed magenta band "UNLOCK THE MAGIC INSIDE THE JAR" with the object repeated. | Big CTA band using repeated object imagery. |
| 15s | Back to red: "LET'S GET COOKING" centered with one pill button. | Closing CTA. |
| 16–17s | Three menu cards in a row, then footer with a magenta side panel. | Cards then footer. |

**Rules I copied from the video**

1. One hero object, always near the center, never leaves the screen during the hero.
2. Headline is huge, gold/uppercase, and swaps 5 times during the hero.
3. Small copy and a pill button swap sides (left, then bottom-right) on each beat.
4. The object overlaps the headline so the headline feels layered around it.
5. The hero ends with a **panel sliding up** to start the next section.
6. After the hero, the page changes background color per section (red, magenta, cream, red).

---

## 2. Concept mapping (jar → sky)

| Reference | Aeris version |
|---|---|
| Red flat background | Sky gradient that changes with scroll (dawn → blue → amber → midnight) |
| Jar (hero object) | **Orb**: sun by day, moon by night, same anchor position |
| Jar tilting/rotating | Orb rises, drifts slightly, glows, and finally **morphs into the moon** |
| Gold headline swaps | 6 headlines, one per beat (see §4) |
| Small copy + pill on left/bottom-right | Same, with a "Explore the gallery" pill |
| Jar pours into next panel | Orb sets behind the grass, then the sky panel slides up into "What's above" |
| Magenta panel | **Aurora/nebula panel** (green-violet aurora, magenta-blue nebula) |
| Cream section | **Dawn-cream** section for photos ("Tradition & Creation" becomes "Light & Landscape") |
| Photo cards floating | Your gallery photos with time, location, and cloud-type tags |
| CTA band | Full-bleed night sky band with moon |
| Menu cards | Three featured photo/story cards |

---

## 3. The scroll timeline (one master progress value)

One value `p` from `0` to `1` drives the entire hero. Never drive things separately.

| p | Stage | Sky | Orb | Ground scene | Sky extras |
|---|---|---|---|---|---|
| 0.00–0.20 | **Sunrise** | Deep blue → peach → gold | Rises from the grass line, small and orange | Plain grass + **flowers bloom** | Peach low clouds, fading stars |
| 0.20–0.45 | **Morning → Noon** | Clear blue | Climbs to the anchor, white-yellow, bright | Grass, flowers fully open | Many random white clouds, parallax |
| 0.45–0.65 | **Afternoon** | Blue → warm | Starts to sink, grows slightly | Flowers sway | Clouds turn golden |
| 0.65–0.80 | **Sunset** | Orange → magenta → violet | Large, red-orange, near the horizon | **Bench appears** on the field | Amber clouds, first stars |
| 0.80–0.90 | **Dusk → Night** | Violet → navy | **Sun crossfades into the moon (same position)** | Bench in silhouette, **people sit on it** | Stars twinkle, nebula fades in |
| 0.90–1.00 | **Midnight** | Near-black blue | Full moon, steady | Silhouetted people on the bench | Stars sparkle, **aurora + nebula** at full |

Anchor position: the Orb lives around **x = 62% from left, y = 42%** on desktop (like the jar sitting center-right). At sunrise and sunset it dips lower toward the grass line, but it always returns to the same anchor. This keeps "the same place as the main object."

---

## 4. Headlines per beat (like the video's text swaps)

| Beat | Headline | Position | Small copy side |
|---|---|---|---|
| 1 Sunrise | READ THE SKY | top-left | left edge + pill |
| 2 Morning | A NEW ANGLE OF LIGHT | top-left | bottom-right |
| 3 Noon | UNDER AN ENDLESS BLUE | centered (Orb passes in front of the letters) | left edge |
| 4 Sunset | LIGHT, BEFORE IT LEAVES | right side (Orb on the left side of text) | bottom-left |
| 5 Dusk | THE SUN BECOMES THE MOON | centered | bottom-right |
| 6 Midnight | WHEN THE SKY BECOMES INFINITE | top-left | left edge + pill |

Text rules (this is what fixes the clipped-headline bug from before):

- Text may only **fade and move up/down**. Never slide sideways.
- Use `clamp()` font sizes. Headlines wrap, never overflow.
- Test at 360, 390, 768, 1024, 1440, 1920 px wide before any animation.

---

## 5. Layout (desktop, matches the video's placement)

```
┌──────────────────────────────────────────────────────────┐
│ logo (left)                          nav pills (right)   │  ← slim header, no banner overlap
│                                                          │
│  BIG HEADLINE (top-left)                                 │
│                                                          │
│                                  ╭────╮                  │
│  small copy                      │ORB │  ← anchor        │
│  [ pill ]                        ╰────╯                  │
│                                                          │
│ ~~~~~~~~~~~~~~~ grass field (flowers / bench) ~~~~~~~~~~ │
└──────────────────────────────────────────────────────────┘
```

Layer order, back to front:

1. Sky gradient (CSS variables)
2. Stars canvas, nebula, aurora (visible mostly at night)
3. Headline (behind layer)
4. Clouds, far layer
5. **Orb** (sun/moon)
6. Headline (front layer; only for the "overlap" beats, a clipped copy of the text)
7. Clouds, near layer
8. Far hills (slight blue haze)
9. Grass field (flat, plain) + flowers
10. Bench + people
11. Small copy + pill
12. Header

Mobile (under 768px): headline sits top-center, Orb anchor at x 50%, y 40%, small copy sits below the grass line. No overlap beats on mobile; the Orb stays behind the text.

---

## 6. Visual components

### 6.1 Orb (sun and moon in one element)

- One `div` at a fixed anchor, two stacked layers inside:
  - **Sun layer**: radial gradient (white-yellow core, orange edge) + soft glow ring + subtle slow rotation of a glow texture.
  - **Moon layer**: your NASA texture `public/3d/moon_color_2k.webp` on a circle, with `moon_bump_2k.webp` as light relief.
- Crossfade from sun to moon between `p = 0.78` and `0.88`. Both layers share the same size and position, so it visibly "transforms" in place.
- Moon never spins. It only wobbles about 2° (the real Moon shows one face to Earth).
- Correct moon orientation check: dark seas upper-left, small oval Mare Crisium at the right edge, bright Tycho toward the bottom.
- Moon credit in the footer: "Moon texture: NASA Scientific Visualization Studio".
- Option for later: a 3D sphere (three.js) with real lighting. Keep the 2D version as the fallback.

### 6.2 Clouds (day only)

- Use the 4 existing sprites `public/3d/clouds/cloud_1.webp` to `cloud_4.webp`.
- 3 depth layers: far (small, slow), mid, near (large, fast).
- Place **randomly** with a seeded random so the layout is the same on every load: 6 far, 5 mid, 3 near on desktop; about half on mobile.
- Each cloud moves with scroll (near layers move more) plus a slow constant drift.
- Tint by time: peach at sunrise, white at noon, amber at sunset, fade to 0 at night.

### 6.3 Stars, nebula, aurora (night only)

- **Stars**: a canvas with 250 stars (120 on mobile). Each has its own twinkle speed. About 12 bright stars get a four-point sparkle. The field rotates slowly with scroll. Occasional shooting star every 8–15 seconds.
- **Nebula**: 2–3 large blurred gradient blobs (magenta, blue, violet) using `mix-blend-mode: screen`, opacity ramps from 0 at p=0.8 to 0.7 at p=1.
- **Aurora**: 3 curtain bands (green, teal, violet) built from stretched gradients with a slow wave using CSS transforms and `filter: blur()`. Opacity ramps in from p=0.86.
- Use the pattern SVG for a subtle texture on the sky if it looks good; it is optional.

### 6.4 Grass field and scene objects

- Ground: one plain, flat grass band at the bottom 22–28% of the screen, with two soft tone layers (back lighter, front darker). The video's red flat look = flat, calm, no heavy detail.
- **Flowers** (sunrise): 20–30 small flowers scattered with seeded random. They scale up from 0 between p=0.02 and 0.18, then sway gently.
- **Bench** (sunset): appears at about 64% x. Fades in and rises 12px between p=0.62 and 0.72.
- **People** (night): two silhouettes sit on the bench. They fade in between p=0.82 and 0.90. They stay still (a tiny head movement is optional).
- Use the four SVG files in `public/3d/scene/` (see §9.1). They are written to be inlined in the page so CSS variables can tint them by time of day. Your uploaded `ground.svg` is an outline icon of clouds, sparkles and a crescent, not a grass field, so it is not used for the ground.

---

## 7. Sections after the hero (matching the video's flow)

| # | Section | Background | Layout (from video) | Content |
|---|---|---|---|---|
| 1 | Hero journey | Sky cycle | Orb + headlines | Sunrise to midnight |
| 2 | **WHAT'S ABOVE** | Panel slides up from the bottom; dark left, aurora/nebula right | 50/50 split | Short intro + hero photo of aurora/night sky |
| 3 | **LIGHT & LANDSCAPE** | Dawn cream | Headline top-left, 3–4 floating photo cards at different parallax speeds | Gallery photos with time/location/cloud-type tags |
| 4 | **WHY THE SKY MATTERS** | Cream | Centered headline, two small text columns, row of photo tiles | Your real gallery counters |
| 5 | **UNLOCK THE MAGIC OF THE SKY** | Full-bleed night/aurora band | Repeated moon/sun images, one pill | Subscribe / explore |
| 6 | **LET'S GO SKYWATCHING** | Deep navy | Centered headline + one pill | Primary CTA |
| 7 | Featured cards | Navy | Three cards in a row | Top 3 photos/stories |
| 8 | Footer | Night with aurora side panel | Simple links + credit | Moon texture credit |

The hero must **end on the panel slide-up** (the Orb sets behind the grass and the section 2 panel rises), just like the jar pours into the "What's inside" panel.

---

## 8. Technical approach

- **Stack**: keep your current framework. Add GSAP + ScrollTrigger and Lenis (smooth scroll).
- **Pinning**: use **CSS `position: sticky`** for the hero stage inside a tall wrapper (about 600vh). Do not use GSAP `pin`; it caused the offset bugs earlier.
- **One master timeline**: a single `ScrollTrigger` with `scrub: true` updates a progress value `p`. All stage changes read from `p`.
- **Colors**: define keyframes as CSS variables and interpolate them from `p`.

```ts
// timeline.ts — single source of truth
export const stops = [
  { p: 0.00, skyTop: '#0b1530', skyBottom: '#f4a77a', orbY: 0.78, orbColor: '#ffb066' }, // sunrise
  { p: 0.30, skyTop: '#2f7fe0', skyBottom: '#bfe3ff', orbY: 0.42, orbColor: '#fff3c4' }, // noon
  { p: 0.70, skyTop: '#3a2a6a', skyBottom: '#ff7a3d', orbY: 0.70, orbColor: '#ff6a2a' }, // sunset
  { p: 0.85, skyTop: '#0a1030', skyBottom: '#2a2260', orbY: 0.42, orbColor: '#dfe6f5' }, // dusk
  { p: 1.00, skyTop: '#03060f', skyBottom: '#0a1030', orbY: 0.42, orbColor: '#eef2ff' }, // midnight
];
```

```ts
// orb sun→moon crossfade at the same position
const t = clamp((p - 0.78) / 0.10, 0, 1);
sunLayer.style.opacity = String(1 - t);
moonLayer.style.opacity = String(t);
```

- **Performance**: only animate `transform` and `opacity`. Pause the stars canvas when the hero is off-screen. Lazy-load the 4k moon only on large, high-end screens.
- **Accessibility**: respect `prefers-reduced-motion` (show a static noon-to-night crossfade, no star rotation, no shooting stars). All text keeps a 4.5:1 contrast on the sky at every stage (add a soft text shadow or scrim at noon).
- **Fallback**: if JS fails, show the noon sky with the headline and a static grass field.

---

## 9. Assets checklist

Already created for you:

- `public/3d/moon_color_2k.webp`, `moon_color_4k.webp`, `moon_bump_2k.webp` (move the 8000×4000 original out of `public/`)
- `public/3d/clouds/cloud_1.webp` … `cloud_4.webp`
- `public/3d/scene/ground.svg`, `flowers.svg`, `bench.svg`, `people.svg` (new, see §9.1)
- `scene_preview_noon.png`: a noon-time preview of the ground scene, for reference only

Your uploaded `ground.svg` (an icon with two clouds, sparkles and a crescent) and `pattern_sky.svg` are not used. Delete or ignore them. The new `ground.svg` has the same name and replaces it.

Still to make in the build:

- Nebula blobs and aurora bands (pure CSS, no files)
- Photo cards: use your real gallery images

### 9.1 Ground scene SVGs

| File | What it is | ViewBox | Tint variables |
|---|---|---|---|
| `ground.svg` | Flat grass field: very low far hills, a back band (the horizon the sun rises from), a front band, sparse blade texture | 1440×420, stretches to the screen width | `--haze`, `--hill`, `--grass-back`, `--grass-mid`, `--grass-front`, `--blade` |
| `flowers.svg` | Sprite with three flowers: `#daisy`, `#tulip`, `#bell`. Each has its base at the bottom center | 40×60 each | `--f1`, `--f1-core`, `--f2`, `--f2-light`, `--f3`, `--f3-core`, `--stem` |
| `bench.svg` | Wooden park bench seen from the front. Seat top is at y=78 | 240×140 | `--bench`, `--bench-dark` |
| `people.svg` | Two seated silhouettes. Same box as the bench, so stack it exactly on top | 240×140 | `--people` |

How to use them:

- **Inline them in the page** (or import them as raw strings). CSS variables do not reach inside an SVG loaded with `<img>` or as a CSS background.
- Flowers: inline `flowers.svg` once, then place each one with `<svg viewBox="0 0 40 60"><use href="#daisy"/></svg>`. Position about 26 of them with a seeded random, mostly in the front band, and scale each one from 0 at sunrise (grow from the bottom, `transform-origin: 50% 100%`).
- Bench and people: wrap them in one element at about 64% x, and fade `people.svg` in separately at night so the bench shows first at sunset.
- Variable values per stage (set on the ground wrapper and interpolate with `p`):

| Stage | `--grass-back` | `--grass-front` | `--haze` | `--bench` | `--people` |
|---|---|---|---|---|---|
| Sunrise | `#9ab36a` | `#4d7a38` | `#f4b58a` | `#7a4f30` | `#1a1420` |
| Noon | `#8cc063` | `#3f7a33` | `#9fc2e8` | `#6b4528` | `#0a0d1a` |
| Sunset | `#8a8a4a` | `#3a5a2c` | `#ff9a5a` | `#5a3320` | `#120a14` |
| Midnight | `#16302f` | `#0c1c20` | `#1a2150` | `#1d1a24` | `#04060c` |

Known limits: the people are simple silhouettes facing the viewer, and the two overlap a little at the shoulders. Move person B about 6 units right in `people.svg` if you want more space between them.

---

## 10. Build phases

Each phase has a goal, a "done when" check, and a commit message. Do them in order.

### Phase 0 — Clean slate
- **Goal**: remove the old hero, fake sun, dropdowns, and "Back to scroll" chip. Fix the header under the banner.
- **Done when**: page loads with a simple header and an empty hero container, no layout errors at all six screen widths.
- **Commit**: `chore: remove old hero and reset layout`

### Phase 1 — Static layout
- **Goal**: build the hero stage (sticky wrapper, layers, headline, small copy, pill) with no motion.
- **Done when**: all six headline states can be shown by a debug slider and none are clipped at 360–1920px.
- **Commit**: `feat: static hero layout and layers`

### Phase 2 — Master timeline and sky
- **Goal**: add the `p` value, sky gradients, and the debug scrubber (a slider that sets `p`).
- **Done when**: dragging the slider moves smoothly from sunrise to midnight, and scroll drives the same value.
- **Commit**: `feat: master scroll timeline and sky colors`

### Phase 3 — The Orb
- **Goal**: sun layer, moon layer (NASA texture), path from the grass line to the anchor and back, crossfade at the same position.
- **Done when**: the sun rises out of the grass, reaches the anchor, sets, and becomes the moon in the same spot. Moon orientation check passes.
- **Commit**: `feat: sun-to-moon orb`

### Phase 4 — Headlines and text beats
- **Goal**: 6 headline swaps, side-copy swaps, and the "Orb in front of the letters" overlap on desktop.
- **Done when**: text only fades and moves vertically, and nothing is clipped.
- **Commit**: `feat: headline beats`

### Phase 5 — Clouds
- **Goal**: 3-layer random clouds with scroll parallax, drift, and time-of-day tint.
- **Done when**: clouds are visible and moving through sunrise to sunset, and gone at midnight.
- **Commit**: `feat: day clouds`

### Phase 6 — Ground scene
- **Goal**: grass field, flowers at sunrise, bench at sunset, people at night.
- **Done when**: each object appears at its stage, none appear early, and colors match the sky.
- **Commit**: `feat: grass, flowers, bench, people`

### Phase 7 — Night sky
- **Goal**: twinkling stars, sparkle stars, shooting star, nebula, aurora.
- **Done when**: night looks rich, and the frame rate stays smooth on a mid-range phone.
- **Commit**: `feat: stars, nebula, aurora`

### Phase 8 — Hero handoff and content sections
- **Goal**: the slide-up "What's above" panel, then sections 3–8 from §7 with parallax photo cards.
- **Done when**: the transition from hero to section 2 matches the video's "pour into panel" feel.
- **Commit**: `feat: content sections`

### Phase 9 — Polish, performance, accessibility
- **Goal**: reduced-motion mode, mobile layout, lazy loading, contrast checks, Lighthouse pass.
- **Done when**: mobile performance score is above 80 and keyboard navigation works.
- **Commit**: `perf: polish and accessibility`

### Phase 10 — QA and docs
- **Goal**: test on 6 widths and 3 browsers, add the moon credit, write the README.
- **Done when**: everything in the checklist below passes.
- **Commit**: `docs: final QA and readme`

---

## 11. Final QA checklist

- [ ] No clipped headline at 360, 390, 768, 1024, 1440, 1920px
- [ ] Header is never hidden under a banner
- [ ] Sun rises out of the grass and not from a flat photo
- [ ] Sun and moon appear in the same place
- [ ] Flowers at sunrise, bench at sunset, people at night
- [ ] Random clouds in the day, none at midnight
- [ ] Stars twinkle, nebula and aurora appear only at night
- [ ] Moon does not spin and has the right orientation
- [ ] Hero ends with the panel slide-up
- [ ] Reduced-motion version works
- [ ] NASA moon credit is in the footer

---

## 12. First prompt to give Codex (Phase 0 only)

```
Read AERIS_ORB_SCROLL_SITE.md. Do Phase 0 only.

Remove the old photo hero, the fake sun, the two header dropdowns, and the
"Back to scroll" chip. Fix the header so it is never hidden under the Demo
banner. Leave an empty <section id="journey"> where the new hero will go.
Do not add any animation or 3D yet. When done, show me screenshots at
360, 768, and 1440 px wide and stop.
```
