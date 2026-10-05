# AERIS — Master Update (Layers, Real Sun, Realism, Performance, Premium Design)

This is the single file to give Codex. It fixes the text collisions and the sun layering, adds a real NASA sun, makes the site smooth and photographic, and decides every open design question so Codex does not have to guess.

> **Precedence.** This file wins over every earlier plan. The earlier files are still used for their details, but where they disagree with this file, follow this file. The list of overrides is in §2.2.
> Earlier files: `AERIS_ORB_SCROLL_SITE.md` (hero), `AERIS_SCENE_UPDATE.md` (tree, children, birds, pattern removal), `AERIS_CLOUD_JOURNEY.md` (cloud path section, deployment check).
> Give Codex **one phase at a time** (§12). Wait for the "Done when" check before the next phase.

---

## 0. What I could and could not verify

| Item | Status |
|---|---|
| Your screenshot of the collision | **Not visible to me.** It did not come through. I built the layer system from your README, your two reports ("text is colliding", "sun is not in the correct layer") and the earlier plans. Phase M1 makes Codex find the exact cause on screen before changing anything |
| Your repo and live site | I have not read the code or opened the live site. Class names below are labels. Codex must map them to the real names in `src/sky-journey/SkyJourney.tsx` |
| NASA SDO image addresses | I confirmed the address pattern `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_<size>_<channel>.jpg` from NASA's "Sun Now" listing (sizes 256 and 1024 and channels `0171`, `0193`, `HMIIF` appeared). Sizes `2048` and channel `HMIIC` are the standard names but I did not open them. Open the link in a browser before downloading |
| Helper scripts | Tested on synthetic images only (a fake sun disc and a fake cloud). They have not been run on real NASA or photo files |
| Visual result | Everything here is specification. I have not seen it animate |

---

## 1. Current state (from your README)

- React + TypeScript + Vite. Hero in `src/sky-journey/SkyJourney.tsx`, sky colors and time interpolation in `src/sky/timeline.ts`, page composition in `src/App.tsx`.
- One normalized progress value drives sky palette, orb, cloud layers, ground scene, six headline beats, stars, nebula, aurora.
- Sun and moon are CSS layers at the same position. Stars are a canvas that pauses offscreen.
- Desktop: Lenis + GSAP ScrollTrigger. Narrow screens: native scrolling. Reduced motion and a "Reduce effects" control exist.
- Routes: home, journal, gallery, `/atlas`, `/planner`, sign-in, member pages, contact. Demo mode stores data in the browser.
- Fonts come from Google Fonts. Gallery photos are demo copies.
- A Playwright script `qa:phase10` tests six widths in Chrome, Edge and WebKit.

---

## 2. Decisions (made for you)

### 2.1 Decision log

| # | Question | Options | **Decision** | Why |
|---|---|---|---|---|
| D1 | Where does the sun/moon sit in the layer stack? | Between far and near clouds (old plan) · in front of all clouds · behind all clouds | **Behind all clouds, in front of the sky and stars, behind hills and ground** | This is how the sky really works: the sun is behind every cloud and behind the horizon. It also fixes "sun not on the correct layer" |
| D2 | Can the orb overlap the headline? | "Orb passes in front of letters" · never overlap | **Never overlap.** Text and orb live in separate columns (desktop) or rows (mobile). Soft glow may pass behind text | The overlap trick is the biggest source of collisions. Glow behind text is handled with a scrim |
| D3 | How is text laid out? | Headline, copy and pill positioned separately · one block per beat | **One `beat` block per scene, built with normal document flow** (eyebrow, headline, copy, pill stacked), placed in one fixed zone | Items in a flow cannot overlap each other |
| D4 | Which side do beats sit on? | Alternate left and right · always left | **Always the left column on desktop, always the top on mobile** | The orb, bench and tree then have a fixed, predictable area |
| D5 | Sun image | Procedural CSS sun · NASA photo | **NASA SDO visible-light image (HMIIC) as a round disc, with CSS glow** (§6) | You asked for a real sun like the moon. It also looks real at sunrise |
| D6 | Sun and moon size | Different sizes · same | **Same diameter, same anchor** | Physically correct (both about 0.5° wide) and it makes the sun-to-moon change seamless |
| D7 | Real vs illustrated imagery | All photographic · all illustrated · mixed | **Photographic for sky, sun, moon, clouds, stars and gallery. Flat silhouettes only for foreground life (tree, bench, people, children, birds), graded like silhouettes in a photo. Ground gets an optional real meadow photo** | A silhouette against a real sunset is how photographers shoot it, so it stays believable. Full photographic people or trees would need real cut-outs you do not have yet |
| D8 | Cloud sprites | Keep generated placeholders · real photos | **Replace with real cloud cut-outs from your own sky photos or CC0 photos** (§7) | The earlier sprites were generated placeholders |
| D9 | Cloud character (the one with a face) | Remove · keep flat · give it a real cloud texture | **Keep, as the one intentional stylized element you asked for. Optional upgrade: fill the body with a real cloud photo texture** (§9.3) | You explicitly asked for the face and the shape changes |
| D10 | Sky gradient animation | Interpolate CSS variables each frame · cross-fade 5 pre-made layers | **Cross-fade 5 stacked gradient layers by opacity** | Opacity on a layer is handled by the GPU. Recoloring a full-screen gradient repaints the whole screen every frame |
| D11 | Blur and glass | CSS `filter: blur` on moving layers and `backdrop-filter` cards · baked blur and plain translucent cards | **Baked blur in the image files. `backdrop-filter` only on the small header pill, and not on mobile** | These two properties are the most common cause of janky scroll |
| D12 | Pinning | GSAP `pin` · CSS `position: sticky` | **CSS sticky** | `pin` already caused offset bugs. Sticky also works well with Lenis |
| D13 | Smoothing | Lenis + GSAP `scrub: 0.8` · Lenis only | **Lenis for smoothing, `scrub: true` (no extra smoothing)** | Two smoothing layers add lag and a floaty feel |
| D14 | Writing progress into the page | React state each frame · direct DOM writes | **Direct DOM writes to cached elements. React state only for discrete things (current beat, current checkpoint)** | Re-rendering React 60 times a second is the usual cause of stutter |
| D15 | Fonts | Cormorant + Inter + JetBrains Mono (Gemini) · two families | **Cormorant Garamond + Inter only, self-hosted, no Google Fonts request** | One request fewer, no layout jump, fewer files. Numbers use Inter with tabular figures |
| D16 | Gradient-clipped headline text (Gemini) | Use · don't | **Don't** | Lower legibility on photos, extra repaint cost. Solid text colors with a scrim are cleaner |
| D17 | Film grain | Animated SVG noise (Gemini) · static tiny tile | **Static 128 px WebP tile (`grain_tile.webp`, 19 KB) at low opacity** | Cheap, and it removes gradient banding |
| D18 | Custom exposure-meter cursor (Gemini) | Build · skip | **Skip** | Hurts accessibility and touch, adds per-frame work, and adds little |
| D19 | Three.js celestial sphere (Gemini) | Build · skip | **Skip for now** | About 150 KB of extra code and constant GPU use, and it duplicates the hero. For the planner use real sun and moon times from `suncalc` (§10.3) |
| D20 | Dashboard numbers | Sample data (Gemini) · only real data | **Only real data** (computed with `suncalc`, or from the member's own content). No invented metrics, names or weather | Fake numbers on a live nature site damage trust |
| D21 | Lighthouse mobile target | 80 · 90 | **90 or higher** | You asked for strict smoothness |
| D22 | Where the Kelvin/time readout goes | Dev slider only · permanent | **Permanent small readout on the time rail** (§10.1), driven by the same progress value | It supports the "reading the light" idea. The scrub slider stays dev-only |

### 2.2 Overrides of earlier files

| Earlier file | Old rule | New rule (this file) |
|---|---|---|
| Orb plan §4 | Beats 3 and 5 centered, orb passes in front of letters | Removed (D2) |
| Orb plan §4 | Small copy left edge / bottom-right / bottom-left | Removed. One beat block (D3, D4) |
| Orb plan §5 | Orb between far and near clouds | Orb behind all clouds (D1). New order in §4.2 |
| Orb plan §3 | Orb anchor x = 62% | Orb anchor x = 68% on desktop, 50% on tablet and mobile (§4.4) |
| Orb plan §8 | Interpolate colors with CSS variables | Gradient layers cross-fade (D10). Text and tint colors may still use variables |
| Scene update §6 | Birds behind headline at layer 3 | Birds above the clouds, below text (§4.2) |
| Scene update §7 | Small copy zones | Replaced by §4.3 |
| Cloud journey §6.3 | Sky tint as interpolated colors | Same colors, done with stacked tint layers cross-fading (D10) |
| Cloud journey §6 | Glass cards | Plain translucent cards, no `backdrop-filter` (D11) |
| Cloud journey §0 | Lighthouse above 80 | 90 or higher (D21) |
| Cloud journey §3 | Flat gradient body | Flat body is the default. Real-texture body is an optional upgrade (§9.3) |

---

## 3. Design system (colors, type, material)

### 3.1 Principles

1. **Real light first.** Warm amber and dusty rose near the horizon, deep ink blue above. No neon, no pure `#000`, no pure `#fff` on large areas.
2. **One accent.** Champagne (`#F0D7B0`) for highlights, links and numbers. A second, muted atmosphere blue for small status marks.
3. **Quiet UI.** Thin hairlines, large type, lots of space. Nothing glows except the sky itself.
4. **Photographs carry the page.** Cards and layouts frame photos and stay out of their way.

### 3.2 Color tokens

| Token | Value | Use |
|---|---|---|
| `--ink-950` | `#070A12` | Page background at night, footer |
| `--ink-900` | `#0B1020` | Sections after the hero |
| `--ink-800` | `#121A2E` | Cards, rail |
| `--plum-700` | `#2A1A38` | Dusk sections |
| `--terracotta` | `#C85F3E` | Sunset accent (rare) |
| `--amber` | `#E3A15A` | Golden hour accent |
| `--champagne` | `#F0D7B0` | Main accent |
| `--mist` | `#E6ECF4` | Light surfaces and noon text on dark scrim |
| `--atmos-blue` | `#8DB8E8` | Small status marks, focus ring |
| `--text-hi` | `rgba(244,247,252,.96)` | Headlines |
| `--text-mid` | `rgba(244,247,252,.74)` | Body |
| `--text-low` | `rgba(244,247,252,.52)` | Captions (never below this) |
| `--hairline` | `rgba(255,255,255,.12)` | Borders |
| `--surface-1` | `rgba(11,16,32,.66)` | Cards over the sky (no blur) |
| `--surface-2` | `rgba(18,26,46,.82)` | Cards on dark sections |

The five sky stage colors stay in `src/sky/timeline.ts`. Do not change them unless Phase M1 shows a stage looks wrong.

### 3.3 Typography

Families: **Cormorant Garamond** (300, 400, 300 italic) for display, **Inter** (variable, 400 and 500) for everything else. Self-host both (Phase M6).

| Role | Font | Size | Line height | Tracking | Notes |
|---|---|---|---|---|---|
| Hero headline (desktop) | Cormorant 300 | `clamp(2.4rem, 4.6vw + 0.2rem, 5rem)` | 1.0 | `-0.015em` | `text-wrap: balance`, max 2 lines in the beat box |
| Hero headline (mobile) | Cormorant 300 | `clamp(2rem, 9vw, 2.75rem)` | 1.02 | `-0.01em` | Max 3 lines |
| Eyebrow | Inter 500 | `0.72rem` | 1.2 | `0.28em` | Uppercase, `--text-mid`, 24 px rule before it |
| Beat copy | Inter 400 | `clamp(0.95rem, 0.9rem + 0.25vw, 1.1rem)` | 1.65 | 0 | Max 46 characters wide, max 2 lines in the beat |
| Section title | Cormorant 300 | `clamp(2.2rem, 4vw, 4rem)` | 1.05 | `-0.01em` | One italic phrase at most |
| Card title | Cormorant 400 | `1.5rem` | 1.2 | 0 | |
| Readout and numbers | Inter 500 | `0.72rem` | 1.3 | `0.08em` | `font-variant-numeric: tabular-nums` |

Rules: no text under 12 px; tracking never above `0.3em`; solid colors only (D16); headlines in `--text-hi`; a champagne solid color is allowed on one italic word.

### 3.4 Material

- Cards: `--surface-1` or `--surface-2`, `1px solid var(--hairline)`, radius 14 px, a 1 px top highlight (`linear-gradient` on a `::before`), shadow `0 24px 60px -28px rgba(0,0,0,.6)`. **No `backdrop-filter`.**
- Buttons: pill, 44 px tall, champagne border, hover raises 2 px (transform only).
- Grain: `public/3d/grain_tile.webp` tiled on one fixed full-screen layer, `opacity: .7` of its own alpha, `pointer-events: none`, z-index 50.
- Motion curve: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances, 500 to 700 ms. Nothing animates `width`, `height`, `top`, `left`, `margin`, `box-shadow` or `filter`.

---

## 4. The layer and collision system (the core fix)

### 4.1 Rules (apply to every layer)

1. The hero stage is **one** sticky element with `isolation: isolate; overflow: clip; contain: layout paint style`. Nothing inside can leak out or fight with the header.
2. The stage contains **planes**. A plane is a full-size `position: absolute; inset: 0; pointer-events: none` element. **Only planes have a `z-index`.** Children of a plane never set one.
3. All z-index values come from the tokens in §4.2. No other numbers anywhere in the hero.
4. Planes and objects move only with `transform: translate3d(...)` and `opacity`.
5. Text is never positioned with absolute pixel offsets. It lives in the **beat zone** (§4.3) in normal flow.
6. Every plane and object has `data-layer="..."` so the test script and the debug view can find it.

### 4.2 Stack (back to front)

| z | `data-layer` | Contents | Notes |
|---|---|---|---|
| 0 | `sky` | 5 stacked gradient layers (sunrise, noon, sunset, dusk, midnight) | D10. Cross-fade by opacity |
| 1 | `stars` | Star canvas, Milky Way image | Night only. Pauses when hidden |
| 2 | `nebula-aurora` | Nebula and aurora images | Night only. Baked images, normal blending |
| 3 | `orb-glow` | Sun bloom, moon halo | Soft light. May pass behind text |
| 4 | `orb` | Sun disc and moon disc (same place and size) | Never above clouds or ground |
| 5 | `clouds-far` | Far cloud sprites | Slow, baked soft |
| 6 | `clouds-mid` | Mid cloud sprites | |
| 7 | `clouds-near` | Near cloud sprites | Fast. Translucent (max opacity .75). Not allowed over the beat zone |
| 8 | `birds` | Flock (sunrise only) | In front of the clouds and the sun |
| 9 | `hills` | Far hills, haze | |
| 10 | `ground-back` | Back grass band | The horizon the sun rises behind |
| 11 | `flowers` | Flowers | |
| 12 | `children` | Children (sunset only) | |
| 13 | `bench` | Bench, then people on it (night) | |
| 14 | `ground-front` | Front grass band | |
| 15 | `tree` | Foreground tree | Closest to the viewer |
| 16 | `mist` | Optional low mist (desktop only) | Opacity max .25 |
| 30 | `beats` | The six text beats | Always above the scene |
| 40 | `header` | Site header | |
| 45 | `rail` | Time rail | |
| 50 | `grain` | Film grain (fixed, whole page) | |

Put these as CSS variables once:

```css
:root {
  --z-sky: 0; --z-stars: 1; --z-nebula: 2; --z-orb-glow: 3; --z-orb: 4;
  --z-clouds-far: 5; --z-clouds-mid: 6; --z-clouds-near: 7; --z-birds: 8;
  --z-hills: 9; --z-ground-back: 10; --z-flowers: 11; --z-children: 12;
  --z-bench: 13; --z-ground-front: 14; --z-tree: 15; --z-mist: 16;
  --z-beats: 30; --z-header: 40; --z-rail: 45; --z-grain: 50;
}
.stage { position: sticky; top: 0; height: 100svh; isolation: isolate; overflow: clip; contain: layout paint style; }
.plane { position: absolute; inset: 0; pointer-events: none; }
```

Use `100svh` (not `100vh`), so the mobile address bar does not make the scene jump.

### 4.3 Zones (the layout map)

Percentages of the stage. These numbers are the **contract**. The collision test (§11.2) fails if anything breaks it.

| Zone | Desktop ≥ 1024 px (and height ≥ 700 px) | Tablet 768–1023 px | Mobile < 768 px |
|---|---|---|---|
| Header | 0–9% height | 0–9% | 0–9% |
| **Beat zone** (left, x / y / width / max height) | x 6% · y 13% · w 44% · h 33% (bottom edge 46%) | x 7% · y 11% · w 86% · h 30% | x 6% · y 10% · w 88% · h 30% |
| Orb center x | 68% | 50% | 50% |
| Orb center y: sunrise / noon / sunset / moon | 78% / 30% / 70% / 40% | 76% / 50% / 72% / 50% | 75% / 52% / 70% / 52% |
| Orb diameter | `clamp(112px, 12vw, 220px)` | `clamp(140px, 22vw, 200px)` | `clamp(96px, 28vw, 150px)` |
| Ground top (horizon) | 74% | 78% | 76% |
| Tree (left x · width) | 4% · `clamp(200px, 20vw, 340px)` | −4% · 34vw | −8% · 36vw |
| Children (center x · width) | 38% · `clamp(180px, 17vw, 260px)` | 46% · 30vw | 42% · 34vw |
| Bench (center x · width) | 64% · 25vw | 72% · 36vw | 80% · 40vw |

**Short screens** (height under 700 px, for example a laptop with the browser toolbars): hide the beat copy and the pill (`display: none`), keep eyebrow and headline only, set the tree height to 30vh. Under 560 px height also hide the eyebrow.

The beat block:

```css
.beats { position: absolute; z-index: var(--z-beats);
  left: var(--beat-x); top: var(--beat-y); width: var(--beat-w); max-height: var(--beat-h);
  display: grid; }              /* all beats sit in the same cell */
.beat { grid-area: 1 / 1; display: flex; flex-direction: column; gap: 14px; align-items: flex-start;
  opacity: 0; transform: translate3d(0, 16px, 0); pointer-events: none; }
.beat[data-active="true"] { opacity: 1; transform: none; pointer-events: auto; }
.beat::before { content: ""; position: absolute; inset: -24px -32px -24px -32px; z-index: -1;
  background: linear-gradient(90deg, rgba(5,10,30, var(--scrim, .38)), rgba(5,10,30,0) 78%); }
```

- Text only fades and moves up or down. Never sideways.
- `--scrim` is `.38` from sunrise to sunset, `.12` at night. This keeps white text above 4.5:1 on the bright noon sky.
- Beat text must be written to fit: eyebrow (1 line), headline (2 lines desktop, 3 mobile), copy (2 lines), one pill. Codex must shorten any copy that does not fit. It must never shrink the font below the table in §3.3.

### 4.4 Orb path

- The orb moves with `transform: translate3d(x, y, 0)` from the numbers in the zone table, interpolated between the five stage stops in `timeline.ts` (stops: sunrise 0.00, noon 0.30, sunset 0.70, dusk 0.85, midnight 1.00).
- At sunrise and sunset the orb is partly under the horizon. Because the ground planes are above the orb in the stack, the **ground hides it**. Do not use clipping or masks for this.
- The sun-to-moon change happens in place between `p` 0.78 and 0.88: sun layer opacity 1 → 0, moon layer opacity 0 → 1, same size, same center.

### 4.5 Collision matrix

"Box" means the element's bounding rectangle at the moment.

| A | B | Allowed to overlap? |
|---|---|---|
| Beat block | Orb disc | **No** |
| Beat block | Tree, bench, people, children | **No** |
| Beat block | Header | **No** |
| Tree | Bench | **No** |
| Tree | Children | **No** (the tree's trunk and canopy box vs the children's box, 8 px gap) |
| Children | Bench | **No** |
| Children | People | Never visible at the same time |
| Orb disc | Clouds, ground, hills, bench, tree | **Yes** (by design: clouds and ground are in front) |
| Orb glow | Anything | **Yes** (it is light) |
| Birds | Everything except the header | Yes, but only inside the sky area (above the horizon) |
| Near clouds | Beat block | **No** (near clouds are kept outside the beat zone) |

### 4.6 Debug view

Add `?debug=layers` (development only). It draws each plane's box in its own color with its `data-layer` and z number, and draws the beat zone, the orb disc and the horizon line. Phase M1 uses it to find the collision on screen.

---

## 5. Making the sun correct (all steps)

1. Orb and orb-glow are two separate planes (z 4 and z 3). The disc is not scaled by glow.
2. Disc size = `--orb-d` (§4.3). Sun and moon use the same variable.
3. Stack inside the orb plane: moon disc, sun disc, sun tint overlay, sun white overlay. All centered in one wrapper moved by `translate3d`.
4. The glow plane holds one big radial gradient (bloom). Its size is 2.8 × the disc diameter.
5. Nothing in front of the orb can be an opaque flat block. Clouds are translucent sprites. The ground is the only opaque thing above the orb.

---

## 6. The real sun (reference and files)

### 6.1 What to download (do this yourself, once)

Use NASA's Solar Dynamics Observatory images. They are real photographs of the Sun.

| Option | Channel | Address pattern | Look |
|---|---|---|---|
| **A (chosen)** | Visible light, colorized (`HMIIC`) | `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_2048_HMIIC.jpg` | Orange disc with real sunspots and edge darkening. This is what the Sun's surface looks like in visible light |
| B (alternative) | Extreme ultraviolet, gold (`0171`) | `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_2048_0171.jpg` | Dramatic gold with glowing loops. Looks like space, not like a sunrise |
| C (fallback) | Visible light, flattened grey (`HMIIF`) | `https://sdo.gsfc.nasa.gov/assets/img/latest/latest_2048_HMIIF.jpg` | Grey. Tint it orange with the overlay in §6.4 |

Steps:

1. Open the link for option A in a browser. If it does not load, try size `1024`, then option C.
2. These are "latest" images, so they change every day. Choose a day with **a few small sunspots, no black dropouts and no bright flare**. NASA's browse tool lets you pick a date: `https://sdo.gsfc.nasa.gov/data/aiahmi/`.
3. Save the picture as `sun_source.jpg`. **Do not hotlink NASA from the website.** The site must serve its own copy.

### 6.2 Turn it into the site file

Use the script `aeris-assets/scripts/make_sun_texture.py` (needs `pip install pillow numpy`):

```
python make_sun_texture.py sun_source.jpg sun_color_1k.webp 1024
```

It finds the disc, crops it, makes everything outside the disc transparent with a soft 2 px edge and saves a WebP of about 100 KB. **1024 px is enough** for every screen: the largest disc on screen is 220 px, so even at 3× pixel density that needs under 700 px.

Put the file at `public/3d/sun_color_1k.webp`.

### 6.3 Credit

Add to the footer, next to the moon credit: `Sun image: NASA/SDO`. NASA images are generally free to use, but confirm on NASA's media usage guidelines page before launch, and keep the credit.

### 6.4 How the sun is drawn (exact layers, inside the orb wrapper)

| Layer | What | Per stage |
|---|---|---|
| `sun-disc` | `<img src="/3d/sun_color_1k.webp">`, width and height set, `decoding="async"`, circular | Always. Rotates slowly: `animation: spin 240s linear infinite` (paused when the sun is hidden or reduced motion is on) |
| `sun-tint` | A div with `radial-gradient` and `mix-blend-mode: multiply`, sized to the disc | Sunrise: `#FF8A3D`, opacity .75 · Noon: `#FFF1C4`, opacity .10 · Sunset: `#FF5A1F`, opacity .85 |
| `sun-white` | A div with `radial-gradient(circle, #fff 0%, rgba(255,255,255,0) 72%)` | Sunrise: opacity 0 · Noon: opacity .80 (looks overexposed, like a real camera) · Sunset: opacity 0 |
| `orb-glow` (separate plane) | Big radial gradient, 2.8 × disc | Sunrise: peach `rgba(255,170,110,.55)` scale 1.0 · Noon: white-gold `rgba(255,244,214,.45)` scale 1.3 · Sunset: red-orange `rgba(255,96,40,.55)` scale 1.2 |

Between stages, only the **opacities** and the glow scale change. Never animate `filter`.
`mix-blend-mode` is used on this one small element only. It is the only blend mode in the hero.

### 6.5 Moon

The moon stays as already built (NASA CGI Moon Kit, `moon_color_2k.webp`, no spin, slight wobble). Same size and anchor as the sun (D6). Same credit.

---

## 7. Real clouds

1. Replace the generated cloud sprites in `public/3d/clouds/` with **real cloud cut-outs**: 6 sprites (2 far, 2 mid, 2 near), each about 640 px wide, about 30 to 60 KB.
2. Source: **your own sky photos** (best: it is a photography site) or CC0 photos. Check the license of each file and keep a `CREDITS.md`.
3. Cut them out with `aeris-assets/scripts/make_cloud_sprite.py`:

```
python make_cloud_sprite.py my_cloud_photo.jpg cloud_real_1.webp 640
```

It turns blue sky into transparency, softens the edge and removes the blue fringe. Use photos where a single cloud sits on a plain blue sky. Keep the original colors: the site tints them by time of day with overlays, not with filters. If sky remains, raise `--high`. If thin edges are cut, lower `--low`.
4. Far sprites: bake extra softness into the file (blur it 3 px in an image editor) instead of using CSS blur.
5. Place clouds with a **seeded random** (same layout every load): 5 far, 4 mid, 2 near on desktop; about half on mobile. Far and mid clouds must stay out of the orb's box so the sun is not hidden for long. Near clouds may cross the orb briefly but never the beat zone.
6. Tint by stage with a color overlay element per layer (opacity only): peach at sunrise, white at noon, amber at sunset, fade out at night.
7. Cloud files are lazy images with fixed `width` and `height`. Only the moving layers get `will-change: transform`.

---

## 8. Performance (strict)

### 8.1 Budgets

| Metric | Target | How it is checked |
|---|---|---|
| Lighthouse mobile performance (home) | **90 or more** | Lighthouse in Chrome, mobile preset, production build |
| LCP | 2.2 s or less | The LCP element is the hero headline text, not an image |
| CLS | 0.02 or less | Fixed sizes on every image, font fallback metrics |
| INP | 150 ms or less | |
| Total blocking time | 150 ms or less | |
| Frame time while scrolling the hero | 95% of frames at 16.7 ms or less on a mid laptop; 95% at 24 ms or less with CPU slowed 4× | `qa:perf` (§11.3) |
| Main JavaScript bundle | 180 KB gzipped or less | `vite build` report |
| Hero images transferred on first view | 700 KB or less (sun is lazy until `p` > 0 starts) | Network panel |
| Animated hero DOM nodes | 40 or fewer | Count in the debug view |
| Composited layers in the hero | 16 or fewer | Chrome Layers panel |

### 8.2 Scroll driver

- **One** driver: Lenis (desktop) feeding one `ScrollTrigger` for the hero (sticky, `scrub: true`) and one for the cloud journey.
- A single function `update(p)` computes everything for the frame and writes it to cached element references (D14). Skip the write if `p` changed by less than `0.0004`.
- No layout reads (`getBoundingClientRect`, `offsetWidth`) during scroll. Measure on resize with `ResizeObserver` and cache.
- Beat changes and checkpoint changes are the only things that call into React, and only when the integer index changes.
- Do not use `calc(var(--p) ...)` chains across many elements. They force style recalculation on all of them.

### 8.3 Compositing rules

- Allowed per frame: `transform`, `opacity`.
- Forbidden per frame: `filter`, `backdrop-filter`, `box-shadow`, `clip-path`, `mask`, `width`, `height`, `top`, `left`, gradients that change color.
- Baked instead of live: blur (in the image), aurora and nebula (images), grain (tile), glow (static gradient scaled with transform).
- `will-change: transform` only on: orb wrapper, cloud layers, tree canopy. Remove it from anything idle.
- `content-visibility: auto` with `contain-intrinsic-size` on every section below the hero.

### 8.4 Stars canvas

- 250 stars desktop, 120 mobile. Canvas pixel ratio capped at 1.5.
- Pre-render star sprites once. Never create gradients inside the frame loop.
- Run only when: the hero is on screen **and** `p` > 0.55 **and** the tab is visible. On mobile cap at 30 fps.

### 8.5 Runtime governor (adaptive quality)

Measure the average frame time every second. If it is above 22 ms for 3 seconds in a row, step down one tier. Never step back up in the same visit.

| Tier | Changes |
|---|---|
| 0 (default) | Everything |
| 1 | Remove the mist trail and the cloud-journey trail. Stars at 60% |
| 2 | Remove far clouds, birds use 2 frames, tree sway off |
| 3 | Static clouds, no sway, children and birds static |

Start at tier 1 when `navigator.hardwareConcurrency` is 4 or less, at tier 2 when `navigator.connection.saveData` is true. Store the tier in `sessionStorage`.

### 8.6 Loading

- Self-host fonts (D15): two preloaded WOFF2 files (Cormorant 300, Inter variable), the others on demand. `font-display: swap` with a fallback tuned by `size-adjust` so nothing jumps. Total under 120 KB.
- Route code splitting: `React.lazy` for `/atlas`, `/planner`, dashboard, sign-in. No chart or map library on the home page.
- Images: AVIF or WebP with `srcset` and `sizes`, `fetchpriority="high"` only for the one LCP image (if any), lazy for the rest, always with `width` and `height`.
- Preload only: the two fonts, and the first sky layer is pure CSS. The sun, moon and cloud files load after first paint with `requestIdleCallback`.
- Version asset names (`sun_color_1k.v1.webp`) and serve them with `Cache-Control: public, max-age=31536000, immutable`. HTML must not be cached for long.
- Keep every WebP under its budget: sun 120 KB, moon 100 KB, each cloud 60 KB, grain 20 KB.

### 8.7 Page-wide

- Pause all hero loops (sun spin, tree sway, birds, children) when the hero is out of view, when the tab is hidden, or in reduced-motion mode.
- No `console.log` in production. No layout-shifting banners over the header (the old demo notice must not push or hide the header: reserve its space or make it a slim fixed bar above the header).

---

## 9. Integration with earlier plans

### 9.1 Order of work

Hero fixes first (this file M1 to M7), then the scene objects (`AERIS_SCENE_UPDATE.md` U1 to U5, built with §4 here), then the cloud journey (`AERIS_CLOUD_JOURNEY.md` phases 1 to 10), then the content sections and tools (§10).

### 9.2 Cloud journey adjustments

- The cloud journey stage uses the same plane rules (§4.1), its own sticky wrapper and the z tokens: sky tint layers (z 0), stars (z 1), path line, mist (z 16), cloud character (z 20), cards (z 30).
- Sky tint per checkpoint (`AERIS_CLOUD_JOURNEY.md` §6.3) is done with **5 stacked tint layers** that cross-fade (D10), starting exactly from the midnight look.
- Cards use `--surface-1`, no `backdrop-filter` (D11).
- Cards must not overlap the cloud character's box or the header (same collision test, §11.2).

### 9.3 Optional: real texture inside the cloud character

If Phase M9 goes well, fill the character's body with a real cloud photo instead of a flat gradient:

1. Make a 512 × 320 grayscale-to-color cloud texture (`cloud_body_texture.webp`) from a real cumulus photo with `make_cloud_sprite.py`, keeping the interior opaque.
2. In the cloud SVG, draw the 7 circles and the base rectangle into an SVG `<mask>`, and draw one `<image>` using that mask. The mask morphs the same way as now.
3. Keep the soft shade and the face on top.
4. If frame time rises above budget, fall back to the flat gradient body (tier 2 of the governor).

---

## 10. Premium design for the rest of the site

### 10.1 Header and rail

- Header: slim, transparent over the hero, 72 px, logo left (Cormorant, tracking `.2em`), four links, one pill button. A small `backdrop-filter: blur(14px)` is allowed here only, off on mobile. It must never sit under the demo banner (see §8.7).
- Time rail (right edge on desktop, bottom dots on mobile): Sunrise, Noon, Sunset, Night, clickable. Under it a small **light readout** in Inter tabular: `06:12 · 2,700 K`. It is a poetic readout of the journey, not a real clock:

| `p` | Clock | Colour temperature |
|---|---|---|
| 0.00 | 05:50 | 2,700 K |
| 0.30 | 12:00 | 5,600 K |
| 0.70 | 18:40 | 2,300 K |
| 0.85 | 21:00 | 7,500 K |
| 1.00 | 24:00 | 9,500 K |

Interpolate linearly. Update the text only when the displayed minute or hundred-Kelvin changes.

### 10.2 Editorial sections, journal, gallery

- Every section: one eyebrow, one big Cormorant title, short Inter text, generous space (section padding `clamp(96px, 12vw, 180px)`).
- Photo cards: the photo is the hero, text sits below it. Each photo has data (`time`, `place`, `cloud type`, `credit`). Show them as small Inter captions.
- Soft color glow behind a photo: **computed at build time** and stored as a `tone` value on the photo (no runtime color extraction). Applied as a static `box-shadow` color. No `blur(80px)` layers.
- Reveal: one-time clip reveal (`clip-path: inset()` to full) when a card enters the view, using an IntersectionObserver and CSS. Not scrubbed by scroll.
- Hover (only where `hover: hover`): the image scales to 1.02 inside its frame, 600 ms. Nothing else moves.
- Parallax inside photos: at most ±24 px, only for photos in view, at most 6 at once.
- Gallery photos must be **studio-owned or properly licensed** with verified credits before launch (your README already says this). Do not use AI-generated sky photos.

### 10.3 Planner (`/planner`)

Real calculations only. No invented numbers.

- Use the small library `suncalc` on the client. It gives sunrise, sunset, golden hour, blue hour, sun altitude, moon phase, moonrise and moonset for a place and date. No network call.
- Layout: location and date at the top, then a horizontal **light timeline** for the day (a line chart of sun altitude with golden and blue hour bands), then cards: sunrise, golden hour, sunset, blue hour, moon phase, moonrise and moonset, day length.
- Chart drawn with plain SVG or canvas computed from the numbers (this is data, not decoration).
- Optional second step (Phase M10b): cloud cover by layer (low, mid, high) from a free forecast service such as Open-Meteo, cached for 30 minutes. **Check the service's terms first: free tiers are usually for non-commercial use.** If it is not wired, show a clear "Connect a forecast source" empty state, never a made-up percentage.

### 10.4 Cloud atlas (`/atlas`)

- A calm grid of the ten cloud genera. Each card: a real photo, the name (Latin and common), altitude band, one sentence on the light it makes, and a link to related photos.
- No 3D hover. Hover is the same 1.02 scale as the gallery.
- Photos from your own library or properly licensed sources, with credits.

### 10.5 Dashboard / member area

- Layout: left rail 232 px (icon and label, active item with champagne hairline), top bar 64 px, content max width 1280 px, 12-column grid, 24 px gap.
- First card "Today's light" for the member's saved place: values from `suncalc` (§10.3). Below: the member's collections, favorites, recent saves, profile.
- Surfaces `--surface-2`, radius 14 px, hairlines, no blur. Numbers in Inter tabular, titles in Cormorant.
- Empty states are written like captions ("No saved skies yet."), with one action.
- No fake names, fake metrics or fake weather.

---

## 11. Tests (so nothing collides and nothing janks)

Extend the existing Playwright setup. Add these npm scripts: `qa:layers`, `qa:contrast`, `qa:perf`.

### 11.1 Layer order test (`qa:layers`)

For each `data-layer`, read its computed `z-index` and check it matches the table in §4.2. Fail if any element inside the stage has its own z-index other than the planes.

### 11.2 Collision test (`qa:layers`)

Use these screen sizes (width × height): 360×740, 390×844, 768×1024, 1024×768, 1440×900, 1920×1080, plus 1366×640 for a short laptop. For each size, set the scroll to 24 steps from `p` = 0 to 1 and, at each step:

```ts
const boxes = await page.evaluate(() => {
  const r = (s: string) => document.querySelector(s)?.getBoundingClientRect();
  return { beat: r('[data-layer="beats"] [data-active="true"]'), orb: r('[data-layer="orb"] .orb-disc'),
           tree: r('[data-layer="tree"]'), bench: r('[data-layer="bench"]'),
           kids: r('[data-layer="children"]'), header: r('[data-layer="header"]') };
});
// fail if beat intersects orb, tree, bench, kids or header; tree intersects bench or kids; kids intersect bench
```

Use a tolerance of 8 px. The orb's own opacity can be 0 (then it is skipped). Save a screenshot on failure.

### 11.3 Contrast and performance

- `qa:contrast`: screenshot each beat, sample the pixels behind the text box, compute the contrast ratio with the text color. Must be 4.5 or more for copy and 3 or more for the large headline.
- `qa:perf`: in Chromium, slow the CPU 4× with the DevTools protocol, scroll the hero from top to bottom in 10 seconds, record `requestAnimationFrame` gaps. Fail if the 95th percentile is above 24 ms. Also run Lighthouse CI on the production build and fail below 90.

### 11.4 Manual checks

Check with a real phone (mid-range Android) and one laptop: no stutter while scrolling the hero, no text over the orb, sun rises from behind the grass, sun sets behind the grass, moon replaces the sun in place.

---

## 12. Phases for Codex

Every phase has: Goal, Tasks, Do not, Done when, Commit. Phase M0 can be done in parallel with M1.

### Phase M0 — Deployment and baseline
- **Goal**: the live site shows your latest code, and we know today's numbers.
- **Tasks**: run the deployment check in `AERIS_CLOUD_JOURNEY.md` §2 and fix it. Add the version stamp. Run Lighthouse (mobile) and a 10 s scroll recording on the **live** site and save the numbers in `docs/baseline.md`. Check every new asset name for lowercase and the case-sensitive match.
- **Do not**: change visuals.
- **Done when**: the stamp is visible in a private window on the live site and `docs/baseline.md` exists.
- **Commit**: `chore: fix deployment, record baseline`

### Phase M1 — Find the collisions and the sun layer on screen
- **Goal**: know exactly what is wrong.
- **Tasks**: add `?debug=layers` (§4.6). At the six widths in §11.2, at `p` = 0.05, 0.30, 0.55, 0.70, 0.90, take screenshots with the debug view and list: every text overlap, the orb's actual z-index and parent stacking context, every element that creates its own stacking context (`transform`, `filter`, `opacity < 1`, `position` with `z-index`, `will-change`). Write `docs/layer-audit.md`.
- **Do not**: fix anything yet.
- **Done when**: the audit lists each collision with a screenshot and the cause.
- **Commit**: `docs: layer audit`

### Phase M2 — Rebuild the layer system
- **Goal**: planes, z tokens and zones exactly as §4.
- **Tasks**: add the CSS variables (§4.2). Wrap the scene in planes with `data-layer`. Remove every other z-index in the hero. Build the beat zone (§4.3). Put all six beats in it with the flow layout. Remove the old absolute-positioned text and the overlap trick.
- **Do not**: change text copy except to shorten it to fit.
- **Done when**: `qa:layers` passes the layer-order test and the beat block never intersects the header or the orb at the six widths.
- **Commit**: `refactor: layer system and beat zone`

### Phase M3 — The real sun and the orb
- **Goal**: NASA sun disc drawn correctly, behind clouds, behind the ground.
- **Tasks**: follow §5 and §6. Install `sun_color_1k.webp`. Build the five orb layers (§6.4). Same size and anchor as the moon. Add the footer credit.
- **Do not**: use `filter` on the orb, hotlink NASA, or put the orb above clouds or ground.
- **Done when**: the sun rises from behind the grass, sets behind the grass, becomes the moon in place, and sits behind every cloud. The orb never touches a beat block.
- **Commit**: `feat: real sun disc and orb layers`

### Phase M4 — Real clouds
- **Goal**: photographic clouds in the right layers.
- **Tasks**: §7. Replace sprites, seeded layout, keep-out zone around the orb, tint overlays.
- **Do not**: use CSS blur or put near clouds over the beat zone.
- **Done when**: clouds look like real clouds at six widths and `qa:layers` still passes.
- **Commit**: `feat: real cloud sprites`

### Phase M5 — Performance refactor
- **Goal**: the budgets in §8.1.
- **Tasks**: single driver and direct DOM writes (§8.2), gradient cross-fade (D10), remove forbidden per-frame properties (§8.3), stars rules (§8.4), governor (§8.5), `content-visibility` below the hero, pause rules (§8.7).
- **Do not**: add new effects.
- **Done when**: `qa:perf` passes and Lighthouse mobile is 90 or more on the production build.
- **Commit**: `perf: single driver, compositor-only animation, governor`

### Phase M6 — Fonts, type, color, grain
- **Goal**: the design system in §3.
- **Tasks**: self-host the fonts, set tokens, type scale, scrim, grain tile (`public/3d/grain_tile.webp`), card material, button style. Remove JetBrains Mono, gradient-clipped headlines and all `backdrop-filter` except the header pill.
- **Done when**: `qa:contrast` passes, CLS is 0.02 or less, and fonts load without a Google request.
- **Commit**: `feat: design system and self-hosted fonts`

### Phase M7 — Scene objects
- **Goal**: the tree, children and birds from `AERIS_SCENE_UPDATE.md` (U0 to U5), built to §4 here.
- **Tasks**: follow U0 (remove the outline pattern), U1 to U5. Use the zones and layers in §4.2 and §4.3 (the layer order here replaces the one in the scene file).
- **Done when**: the collision test passes at all steps and widths with the tree, children, bench and people present.
- **Commit**: `feat: tree, children, birds on the new layer system`

### Phase M8 — Cloud journey
- **Goal**: `AERIS_CLOUD_JOURNEY.md` phases 1 to 10, with the adjustments in §9.2.
- **Done when**: its final QA checklist and §11 here both pass on the live site.
- **Commit**: as in that file.

### Phase M9 — Editorial sections, journal, gallery
- **Goal**: §10.2.
- **Tasks**: apply the card material, captions, one-time reveals, hover scale and build-time `tone`. Replace demo images or mark each with a visible "demo photo" TODO list in `docs/photo-todo.md`. Optional: the real texture cloud body (§9.3).
- **Done when**: no card has a blur filter, every photo has a credit field, and Lighthouse stays at 90 or more.
- **Commit**: `feat: editorial sections and gallery`

### Phase M10 — Planner, atlas, dashboard
- **Goal**: §10.3 to §10.5.
- **Tasks**: `suncalc` planner with the light timeline, the atlas grid, the dashboard layout. M10b (optional forecast) only after you confirm the terms.
- **Do not**: show any number that is not computed or entered by the member.
- **Done when**: values match an independent source for two test places, and the pages are lazy-loaded (not in the home bundle).
- **Commit**: `feat: planner, atlas, dashboard`

### Phase M11 — Accessibility, reduced motion, mobile
- **Tasks**: reduced-motion version (static noon-to-night crossfade, no spin, sway, birds, children, shooting stars, trail), keyboard access, focus rings, `aria-hidden` on scene planes, text alternatives for photos, touch targets 44 px, native scrolling on narrow screens.
- **Done when**: three modes (full, reduced motion, no JavaScript) show all content.
- **Commit**: `feat: accessibility and reduced motion`

### Phase M12 — QA and release
- **Tasks**: run all scripts in §11 on the production build, then on the **live** site. Real phone and laptop check (§11.4). Update the README (§13).
- **Done when**: every box in §14 is ticked on the live site.
- **Commit**: `chore: release`

---

## 13. README updates

- Replace the "Fonts: Google Fonts" line with the self-hosted fonts.
- Add the sun credit (`Sun image: NASA/SDO`) and the cloud and photo credits (`CREDITS.md`).
- Document the layer table (§4.2) and zone table (§4.3), the three QA scripts, and the performance budgets.

---

## 14. Final checklist (live site)

- [ ] The version stamp shows in a private window
- [ ] No text overlaps the orb, tree, bench, children, header or each other at the six widths and the short-laptop height
- [ ] The sun is a real NASA disc, rises from behind the grass, sets behind the grass, and sits behind the clouds
- [ ] The sun becomes the moon in the same place and size
- [ ] Clouds are real photo cut-outs, no blue fringe, none over the beat text
- [ ] The outline pattern is gone
- [ ] Sky crossfades smoothly through all five stages, no banding visible
- [ ] Lighthouse mobile performance 90 or more, LCP 2.2 s or less, CLS 0.02 or less
- [ ] 95% of hero frames at 24 ms or less with the CPU slowed 4×
- [ ] Only two font families, no Google Fonts request
- [ ] No `backdrop-filter` except the desktop header pill, no `filter` animation, no gradient-clipped text
- [ ] Planner, atlas and dashboard show only real or member-entered data
- [ ] Every photo has a credit, and none is AI-generated
- [ ] Reduced-motion and no-JS versions show all content
- [ ] Footer credits: moon (NASA SVS), sun (NASA/SDO), photos

---

## 15. What you must supply

| Item | Where it goes | Notes |
|---|---|---|
| `sun_source.jpg` from NASA SDO | run through `make_sun_texture.py` → `public/3d/sun_color_1k.webp` | §6.1 and §6.2 |
| 6 real cloud photos (your own or CC0) | run through `make_cloud_sprite.py` → `public/3d/clouds/` | §7 |
| Real gallery photos with credits | `public/images/` | Replace the demo copies |
| Optional: a real meadow photo strip (2400 × 500) | `public/3d/scene/meadow.webp` | Grade it with the same stage overlays as the ground. If you skip it, the current ground stays |

Files already made for you (in `aeris-assets/`): `3d/grain_tile.webp`, `scripts/make_sun_texture.py`, `scripts/make_cloud_sprite.py`, plus all the scene SVGs and the cloud-character folder from earlier steps.

---

## 16. First prompts for Codex

**Phase M0 and M1 together are safe to start with:**

```
Read AERIS_MASTER_UPDATE.md (it overrides the other AERIS_*.md files).
Do Phase M0 and Phase M1 only.

M0: find why the deployed site does not show my latest changes (follow
AERIS_CLOUD_JOURNEY.md section 2), add the version stamp, record the
baseline Lighthouse mobile and scroll numbers in docs/baseline.md.

M1: add the ?debug=layers view and write docs/layer-audit.md listing every
text collision and the real z-index and stacking context of the orb, at the
six widths and the five progress values in the plan, with screenshots.

Do not fix anything else. Stop when both phases are done and show me the
audit.
```
