# AERIS: 3D Sky Journey

**Sunrise → Day → Golden Hour → Sunset → Twilight → Moonlit Night**
A phase-by-phase build plan for VS Code + Codex. This file supersedes `AERIS_3D_SKY_JOURNEY_PLAN.md` and the earlier 2D "Cinematic Day-to-Night" document.

> **Tell Codex:** *"Read `AERIS_3D_SKY_JOURNEY_PHASES.md` fully. Work on ONE phase per run. After each phase run `npm run check`, take the screenshots described in Phase 10's script, commit, and wait for my approval before starting the next phase."*

---

## Progress Tracker

| Phase | Name | Outcome | Status |
|---|---|---|---|
| 0 | Safety and Stabilize | Current layout bugs fixed, branch + tag created | ☐ |
| 1 | Foundation | Timeline model, debug tools, static fallback, Sky Mode | ☐ |
| 2 | 3D Canvas and Sky Dome | Scroll-driven gradient sky in WebGL | ☐ |
| 3 | Sun and Sunrise Intro | Atmospheric 3D sun on a real arc | ☐ |
| 4 | Horizon Depth | Layered ridges, mist, camera motion | ☐ |
| 5 | Clouds | Lit, parallaxed cloud layers | ☐ |
| 6 | Sunset and Twilight | The cinematic showpiece transition | ☐ |
| 7 | Stars and Moon | Star field + NASA-textured moon | ☐ |
| 8 | Rich Content Layer | Typography, photo cards, HUD, counters, cursor, transitions | ☐ |
| 9 | Performance and Accessibility | Quality tiers, mobile, reduced effects | ☐ |
| 10 | Final QA and Docs | Screenshots, checklist, README | ☐ |

---

## Global Rules (apply to every phase)

1. **Safety first:** work on a branch and keep a rollback tag.
   ```bash
   git checkout -b feature/3d-sky
   git tag stable-before-3d
   ```
2. **Keep every existing feature:** auth/member routes, Planner, Atlas, Collections, gallery, chapter rail, cursor, Reduce Effects, Lenis. Extend them. Never delete.
3. **No new libraries** unless unavoidable. Three.js, GSAP, Lenis and SunCalc are already installed. Use vanilla Three.js (only use `@react-three/fiber` if the repo already uses it).
4. **One Lenis, one `gsap.ticker` loop.** No second `requestAnimationFrame` loop.
5. **No React state on scroll frames.** Use refs, shader uniforms, and GSAP setters.
6. **Every scroll position must render a valid sky.** The scene is a pure function of `progress` (0 to 1).
7. **Proof for each phase:** `npm run check` passes, no console errors, no horizontal scroll, screenshots at 1920x1080 and 390x844 reviewed.
8. **Real assets only:** use the existing local images and the NASA moon files below. No fake image URLs.

---

## Reference A: Timeline (single source of truth)

| p | Phase name | Sky top | Sky mid | Horizon | Sun | Stars | Moon |
|---|---|---|---|---|---|---|---|
| 0.00 | Pre-dawn | `#07111F` | `#13243B` | `#3B4960` | below horizon | 0.5 | 0 |
| 0.08 | Sunrise | `#182A45` | `#C77E67` | `#F1B77E` | breaking horizon | 0.1 | 0 |
| 0.20 | Morning | `#3F7FB0` | `#9CC7DD` | `#F3D2A8` | rising | 0 | 0 |
| 0.38 | Day | `#6FAED1` | `#A9D5E8` | `#DDEEF3` | high | 0 | 0 |
| 0.55 | Afternoon | `#6AA6CC` | `#A5CFE0` | `#E6E3CF` | high, moving right | 0 | 0 |
| 0.68 | Golden hour | `#587C9B` | `#D99561` | `#F2B56F` | descending | 0 | 0 |
| 0.78 | Sunset | `#4A3654` | `#B75F5D` | `#E58A62` | at horizon | 0 | 0 |
| 0.87 | Twilight | `#141A3A` | `#34376B` | `#7A4F78` | gone | 0.5 | 0.4 |
| 1.00 | Night | `#030712` | `#071329` | `#0B1832` | gone | 1 | 1 |

Starting values. Tune by eye. Interpolate everything (smoothstep between the two surrounding keys); never switch colors abruptly.

**Chapter rail mapping (keep the existing 5 labels):**

| Rail label | Timeline range |
|---|---|
| Dawn | 0.00 to 0.30 |
| Midday | 0.30 to 0.58 |
| Golden Hour | 0.58 to 0.78 |
| Dusk | 0.78 to 0.90 |
| Night | 0.90 to 1.00 |

---

## Reference B: Assets

### B.1 Moon textures (already downloaded from NASA CGI Moon Kit)

The original file is in `public/3d/` (equirectangular color map, **8000x4000 WebP, about 1.6 MB**).

**Do NOT load the 8000x4000 file in the browser.** It decodes to roughly 128 MB of GPU memory (about 170 MB with mipmaps), and many phones cap textures at 4096 px. Use these optimized files instead (generated from the original, place them in `public/3d/`):

| File | Size | Use |
|---|---|---|
| `moon_color_2k.webp` | 2048x1024 (about 84 KB) | **Default for all devices.** The moon appears only 3 to 4° wide on screen (about 150 px), so 2k is already sharp. |
| `moon_color_4k.webp` | 4096x2048 (about 208 KB) | High tier only, and only if the moon is enlarged in a close-up moment. |
| `moon_bump_2k.webp` | 2048x1024 grayscale (about 84 KB) | Subtle surface relief (crater rims). Approximate: derived from the color map, not true elevation. Use a low `bumpScale` (0.15 to 0.3). |

Keep the original 8000x4000 file only as an archive. Move it out of `public/` (for example to `assets-src/`) so it is never shipped.

**Notes about this texture**
- The map is neutral grey and slightly soft (it was upscaled), so do not expect razor-sharp craters in extreme close-ups.
- The **top and bottom bands (polar regions) are smeared** (stretched in the flat map). They are almost invisible on a sphere, but this means **the moon must not spin**. The real Moon is tidally locked, so always show the **near side** and add only a tiny libration wobble (about ±3°, slow).
- **Orientation check:** lunar longitude 0° is the horizontal center of the map. With the near side facing the camera, you should see the large dark maria on the upper left, **Mare Crisium** (the small dark oval) near the right edge, and the bright rayed crater **Tycho** toward the bottom. In Three.js, the texture center lies toward the sphere's local `+x`; if the mesh's `+z` faces the camera, start with `moon.rotation.y = -Math.PI / 2` and confirm visually in the debug view.
- **Load settings:** `THREE.TextureLoader`, `colorMap.colorSpace = THREE.SRGBColorSpace`, `anisotropy = 4`, bump map stays linear.
- **Footer credit:** "Moon texture: NASA Scientific Visualization Studio (CGI Moon Kit)". Check the NASA SVS page usage note once and keep that wording.

### B.2 Everything else is procedural (no files)

| Element | Technique |
|---|---|
| Sky gradient, horizon glow | Fragment shader on an inverted sphere |
| Sun core and glow | Sphere + additive sprites with a canvas-generated radial gradient |
| Clouds | fbm-noise alpha shader on planes (optional CC0 sprites from Poly Haven if the look is flat) |
| Stars | `THREE.Points` + twinkle shader |
| Ridges and hills | Noise-displaced geometry, optional instanced pine silhouettes |
| Film grain | One tiny noise PNG as a CSS overlay |

**Budget:** all 3D assets together under 2 MB on mobile. Load them lazily after first paint.

---

## Reference C: Architecture

```
src/
  sky/
    SkyCanvas.tsx        React wrapper. Mounts one fixed canvas, lazy-loads the scene.
    SkyScene.ts          renderer, scene, camera, update(p, dt), render(), dispose()
    timeline.ts          keyframes + sample(p) (pure functions, no THREE objects)
    sunMoonPath.ts       sunDirection(p), moonDirection(p)
    quality.ts           device tier, DPR cap, adaptive quality
    layers/
      skyDome.ts  sun.ts  ridges.ts  clouds.ts  stars.ts  moon.ts
  hooks/useSkyProgress.ts
public/3d/               moon_color_2k.webp, moon_color_4k.webp, moon_bump_2k.webp
```

- `SkyCanvas`: `position: fixed; inset: 0; z-index: -1; pointer-events: none; aria-hidden="true"`. Mounted once at the **home route** level. Other routes use a static CSS sky.
- Lazy-load: `const { createSkyScene } = await import('./SkyScene')` after first paint. Show a CSS gradient poster first, then cross-fade (400 ms) to the canvas.
- One master loop, hooked into the existing ticker:
  ```ts
  let target = 0, smooth = 0;
  lenis.on('scroll', ({ progress }) => { target = progress; });
  gsap.ticker.add((_, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    smooth += (target - smooth) * (1 - Math.exp(-6 * dt));
    sky.update(smooth, dt);
    sky.render();
  });
  ```

---

# PHASES

---

## Phase 0: Safety and Stabilize

**Goal:** fix the real bugs on the live site before any 3D work. (Seen in a 1920x1080 screenshot.)

| # | Bug | Fix |
|---|---|---|
| 1 | **Hero headline cut off on the left** ("D SKY", "ser. Learn the light." visible only) | Find the leftover negative `x` / `translateX` / `xPercent` (parallax, split-reveal, or a pinned/horizontal trigger that never reset). Hero content must start inside the page padding at every width. Use `gsap.context()` + `ctx.revert()` on unmount and `ScrollTrigger.refresh()` after fonts/images load. |
| 2 | **Header hidden under the "Demo mode" banner** | Make the banner slim and **dismissible**. Measure its height into `--banner-h` (ResizeObserver) and set `header { top: var(--banner-h) }`. |
| 3 | **Two raw dark `<select>` boxes ("Night", "Dusk") overlap the nav** | Replace with **one compact "Sky" pill** that opens a small popover (Auto / Dawn / Day / Golden / Dusk / Night). Keyboard accessible. |
| 4 | **Fake blue glowing disc on the photo** | Delete it. The 3D sun replaces it. |
| 5 | **Right rail shows rotated "10" / "90" and unclear dots** | Show chapter names as tooltips with a clear active dot. |

**Also verify** at 360, 390, 768, 1024, 1440, 1920 px:
- No horizontal scroll. Run in the console and fix everything it lists:
  ```js
  [...document.querySelectorAll('body *')].filter(e => {
    const r = e.getBoundingClientRect();
    return r.left < -1 || r.right > innerWidth + 1;
  }).map(e => e.tagName + '.' + e.className);
  ```
- Use `min-height: 100dvh` (not `100vh`).
- Search for `new Lenis` and `requestAnimationFrame`: exactly one Lenis, one loop.
- No console errors or warnings.

**Done when:** hero text fully visible, header and nav not overlapped, no horizontal scroll, `npm run check` green.
**Commit:** `fix(ui): repair hero offset, header overlap and sky controls`

---

## Phase 1: Foundation (no 3D yet)

**Goal:** the data model, safety nets and debug tools the 3D scene will rely on.

**Tasks**
1. `timeline.ts`: keyframes from Reference A plus extra fields (`glow`, `sunColor`, `cloudTint`, `exposure`, `fg`) and `sample(p)`.
2. `sunMoonPath.ts`:
   ```ts
   import * as THREE from 'three';
   const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
   const ease = (t: number) => t * t * (3 - 2 * t);

   export function sunDirection(p: number) {
     const t = clamp01((p - 0.04) / 0.76);                  // 0 rising → 1 setting
     const el = Math.sin(Math.PI * t) * 1.05 - 0.12;        // below horizon → ~53° peak → horizon near p≈0.78
     const az = THREE.MathUtils.lerp(-0.9, 0.9, t);         // left → right
     return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
   }
   export function moonDirection(p: number) {
     const t = ease(clamp01((p - 0.80) / 0.20));
     const el = THREE.MathUtils.lerp(-0.12, 0.75, t);       // rises gently
     const az = THREE.MathUtils.lerp(0.75, 0.35, t);        // right side of the screen
     return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).normalize();
   }
   ```
3. **Sky Mode:** `type SkyMode = 'scroll' | 'clock'`. `scroll` = progress from scroll (home default). `clock` = user picked a phase in the Sky pill: animate progress to that phase over 1.2 s and freeze, with a "Back to scroll" chip. Cursor colors, accent and chapter theme all read from `sample(p)` so nothing disagrees. Document this at the top of `timeline.ts`.
4. **Static fallback poster:** a CSS gradient + existing photo per phase, used before the canvas loads, with no WebGL, and with Reduce Effects.
5. **Dev debug overlay** (only when `import.meta.env.DEV`):
   `Sky Progress 0.62 | Phase Golden Hour | Sun elev 21° | Stars 0% | Moon 0% | Tier high | FPS 60`
   Support `?sky=0.62` to freeze progress for tuning.

**Done when:** `?sky=` changes the debug readout and the page background poster color; no 3D yet; checks green.
**Commit:** `feat(sky): add sky timeline model, sky mode and debug tools`

---

## Phase 2: 3D Canvas and Sky Dome

**Goal:** a scroll-driven gradient sky rendered in WebGL.

**Tasks**
- `SkyCanvas.tsx` + `SkyScene.ts`: renderer (`antialias`, `powerPreference: 'high-performance'`), `setPixelRatio(Math.min(devicePixelRatio, 2))`, `outputColorSpace = SRGBColorSpace`, `ACESFilmicToneMapping`, `PerspectiveCamera(55, aspect, 0.1, 2000)`.
- Hook the master loop (Reference C). Handle resize and `visibilitychange` (pause when hidden). Dispose on unmount.
- **Sky dome:** inverted sphere (radius about 900, `BackSide`, `depthWrite: false`) with this fragment shader:
  ```glsl
  uniform vec3 uTop, uMid, uBottom, uSunDir, uGlowColor;
  uniform float uGlow;
  varying vec3 vDir;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    vec3 d = normalize(vDir);
    float h = clamp(d.y, -0.1, 1.0);
    vec3 col = mix(uBottom, uMid, smoothstep(-0.05, 0.25, h));
    col = mix(col, uTop, smoothstep(0.2, 0.9, h));
    vec3 sd = normalize(uSunDir);
    float s = max(dot(d, sd), 0.0);
    col += uGlowColor * (pow(s, 6.0) * 0.45 + pow(s, 64.0) * 0.8) * uGlow;
    float side = pow(max(dot(normalize(vec3(d.x,0.,d.z)), normalize(vec3(sd.x,0.,sd.z))), 0.0), 2.0);
    col += uGlowColor * exp(-abs(d.y) * 9.0) * (0.15 + 0.35 * side) * uGlow;
    col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;   // dither: no banding
    gl_FragColor = vec4(col, 1.0);
  }
  ```
- Feed all uniforms from `sample(p)` each frame.
- Lazy-load and cross-fade from the poster.

**Done when:** scrolling smoothly changes the sky from pre-dawn to night with no flashes or banding; the poster-to-canvas fade works.
**Commit:** `feat(sky): add scroll-driven 3D sky dome`

---

## Phase 3: Sun and Sunrise Intro

**Goal:** the first screen is a believable 3D sunrise, and the sun travels a real arc.

**Tasks**
- **Sun core:** small sphere at `sunDirection(p) * 700`, `MeshBasicMaterial({ toneMapped: false })`.
- **Glow:** two additive `Sprite`s (tight + very wide, about 6x) using a canvas-generated radial gradient; opacity from `glow`. Never a flat neon disc: at sunrise and sunset the sun is redder, slightly flattened and diffused; at midday whiter and smaller.
- **Light:** one `DirectionalLight` aligned with the sun (color/intensity from the timeline) + a `HemisphereLight` from sky top/bottom colors.
- **Fade out** between p = 0.78 and 0.84.
- **Intro (first 2.5 s after load):** sun lifts from just below the ridge, mist thins, camera rises slightly, then scroll takes over. Skip under reduced effects.
- Optional (desktop): soft light-ray streaks when the sun is low.

**Done when:** at p=0 the sun is just breaking the horizon; at p≈0.4 it is high and white; at p≈0.78 it touches the horizon; no hard edges or neon look.
**Commit:** `feat(sky): add atmospheric 3D sun and sunrise intro`

---

## Phase 4: Horizon Depth

**Goal:** real depth. This is what makes it feel 3D.

**Tasks**
- **3 to 4 ridge layers** (noise-displaced planes) at z ≈ −120, −220, −340, −480. Far layers blend toward the horizon color (aerial perspective); near layers are darkest with a thin rim of `sunColor` on the sun side.
- **Mist band** (additive gradient plane) between layers, strongest at sunrise.
- Optional: instanced pine silhouettes (under 200 instances) on the nearest ridge. Optional calm water plane with a faked sky reflection.
- **Camera path from progress:** low and looking at the horizon at sunrise → tilts up and dollies forward toward day → returns low at sunset → tilts up toward the moon at night. About ±6° pitch, ±3 units dolly.
- **Mouse parallax** (desktop only): ±0.6 units, damped.
- Ridge colors come from the same timeline so they match the sky in every phase.

**Done when:** layered silhouettes with visible haze at every phase; camera motion is smooth and subtle; no popping.
**Commit:** `feat(sky): add layered horizon, mist and camera motion`

---

## Phase 5: Clouds

**Goal:** lit, almost imperceptibly alive clouds.

**Tasks**
- 3 layers on planes at z ≈ −200, −350, −550 with an fbm alpha shader (`transparent`, `depthWrite: false`). Different scale, opacity, speed (very slow), and vertical position per layer.
- **Sun lighting:** brighten edges facing the sun, tint with `cloudTint`. At sunset: warm highlights, dark bodies (silhouettes). At night: nearly invisible, a hint of blue-grey.
- If the look is flat, switch to 6 to 10 CC0 cloud sprites per layer (Poly Haven) with slow parallax.
- Mobile: 2 layers.

**Done when:** clouds catch sunrise light, look soft in daytime, silhouette at sunset, and never look like a weather animation.
**Commit:** `feat(sky): add sun-lit cloud layers`

---

## Phase 6: Sunset and Twilight (the showpiece)

**Goal:** Golden Hour → Sunset → Twilight reads as **one cinematic shot**.

**Sequence to tune**
```
warm sky → sun sinks behind the ridge → horizon glow widens and softens
→ orange → coral → rose → violet → warm colors fade
→ deep blue/violet twilight → (stars begin in Phase 7) → night
```
**Tasks**
- Tune keyframes for 0.62 to 0.92: glow size, ridge rim light, cloud silhouettes, haze tint, exposure.
- Photos and text colors respond to the same curve (a warm wash on cards during golden hour).
- Reuse the existing **expanding-frame** transition at Day → Golden and Sunset → Night. No hard page wipes.
- **No black flash.** Night begins at `#030712` through a smooth curve, never a jump.

**Done when:** scrubbing the page slowly from p=0.6 to 0.95 looks like a film shot; every frame in between is coherent (check with `?sky=` at 0.05 steps).
**Commit:** `feat(sky): tune golden hour, sunset and twilight`

---

## Phase 7: Stars and Moon

**Goal:** a star-filled night with a realistic, understated moon using the NASA texture.

**Stars**
- `THREE.Points`: 3000 desktop, 1200 mobile, upper hemisphere, radius about 850, per-star size and twinkle phase, `uOpacity` from the timeline. Fade stars near the sun glow. Twinkle off under reduced effects.
  ```ts
  const N = tier === 'low' ? 1200 : 3000;
  const pos = new Float32Array(N * 3), size = new Float32Array(N), phase = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const th = Math.random() * Math.PI * 2, y = Math.random() * 0.92 + 0.08, r = Math.sqrt(1 - y * y);
    pos.set([Math.cos(th) * r * 850, y * 850, Math.sin(th) * r * 850], i * 3);
    size[i] = 0.6 + Math.random() * 1.6; phase[i] = Math.random() * 6.283;
  }
  ```

**Moon (uses the files from Reference B.1)**
- `SphereGeometry(1, 64, 64)`, scaled to about 3 to 4° across. `MeshStandardMaterial({ map: moonColor, bumpMap: moonBump, bumpScale: 0.2, roughness: 1, metalness: 0, color: 0xece9e2, emissive: 0x0a1020, emissiveIntensity: 0.4 })`. The tiny blue emissive acts like earthshine so the unlit side is not pure black.
- Load `moon_color_2k.webp` by default (`moon_color_4k.webp` only on the high tier for close-ups) and `moon_bump_2k.webp`.
- **Near side faces the camera, no spin.** Use the orientation check from B.1. Add a tiny libration wobble (about ±3°, very slow).
- A dedicated pale blue-white `DirectionalLight` from the side and slightly behind gives a natural gibbous phase.
- **Halo:** an additive wide, faint sprite plus a very faint larger ring at full night. Position from `moonDirection(p) * 650`; opacity and halo from the timeline.
- Understated and photographic: never a flat bright white disc.
- Add the NASA credit to the footer.

**Done when:** the stars fade in during twilight, the moon rises gently into the upper right, shows recognizable maria and craters (Crisium, Tycho), has a soft halo, and nothing spins.
**Commit:** `feat(sky): add stars and NASA-textured moon`

---

## Phase 8: Rich Content Layer

**Goal:** the page itself feels premium and alive, not just the background.

### 8.1 Hero
- Left-aligned headline in a display serif with one italic accent word: "Read the *sky*." Supporting line, one pill CTA ("Explore the sky →") plus a text link ("Plan a shoot").
- Text sits on a soft scrim for contrast. Headline reveals line by line (mask + rise, 1.4 s total).
- Scroll cue that fades out.

### 8.2 Sky HUD (a small, meaningful detail)
A slim readout tied to the scene, bottom-left of the viewport: **simulated time** (for example `05:48 → 23:40`), **sun elevation**, and the **phase name**. It updates from `sample(p)` through refs (no React state). Coordinates and time stamps echo the editorial photography style.

### 8.3 Sections (map to the chapter rail)
| Chapter | Layout |
|---|---|
| Dawn | Intro statement that brightens word by word as you scroll, then a "Sunrise" photo story |
| Midday | Cloud studies as framed cards in a **horizontal gallery** + Cloud Atlas teaser |
| Golden Hour | **Sticky headline** left, warm photo stack right, "Plan your golden hour" CTA to the Planner |
| Dusk | Sunset and blue-hour photos with a large outlined chapter word ("DUSK") drifting behind |
| Night | Quiet centered closing message, Daily Sky card, **sky stats counters** (real numbers from gallery data), final CTA "Start your sky journal" |

### 8.4 Photography as "memories"
- DOM elements (accessible, lazy-loaded, crisp) in mixed aspect ratios (4:5, 3:2, 1:1), rounded 24px, thin border, soft shadow, subtle tilt and inner parallax.
- Each card shows a **capture chip**: time of day, location, cloud type.
- Existing local WebP images only.

### 8.5 Typography and surfaces
- Display serif (Cormorant Garamond) + clean sans (Inter), fluid sizes with `clamp()`, eyebrow labels in small caps with wide tracking, body max 56ch.
- Glass panels for info (`backdrop-filter: blur(14px)`, low-alpha navy, 1px border). Use sparingly.
- Film grain overlay at 3 to 4%.

### 8.6 Legibility in every phase (non-negotiable)
- Over bright sky (p 0.20 to 0.62) interpolate `--fg` to deep navy `#0B1A24`, or place text on a glass panel.
- Contrast ≥ 4.5:1 at p = 0, 0.1, 0.2 … 1.0.

### 8.7 Cursor and interactions
- Existing cursor reads its colors from `sample(p)` (peach at dawn, sky blue by day, amber at golden hour, violet at dusk, sea-glass at night). Keep "View" and "Drag" labels, magnetic buttons, ripple on click.
- Floating glass nav pill that hides on scroll down and returns on scroll up; the Sky pill sits inside it.
- Counters count up once, 1.4 s, tabular numbers.

### 8.8 Transitions
- Existing expanding-frame between chapters; route transition as a soft fade in the current sky colors; text reveals with opacity + 24px rise + mask. No heavy blur, no per-letter chaos.

**Done when:** every section reads clearly over the sky at every phase, layouts are balanced at all widths, and the page feels cinematic and editorial.
**Commit:** `feat(home): rich content layer synced with the sky journey`

---

## Phase 9: Performance and Accessibility

**Quality tiers (`quality.ts`)**

| Tier | When | Settings |
|---|---|---|
| high | discrete GPU desktop | DPR ≤ 2, bloom (strength 0.35, threshold 0.85), 4 cloud layers, 3000 stars, mouse parallax |
| medium | integrated GPU, tablets | DPR ≤ 1.5, no bloom, 3 cloud layers, 2000 stars |
| low | phones, weak GPU, Save-Data | DPR ≤ 1.25, 2 cloud layers, 1200 stars, no parallax |
| static | no WebGL, Reduce Effects, reduced motion | no canvas, CSS poster per phase |

**Tasks**
- **Adaptive quality:** if average frame time over 2 s is above about 22 ms, drop one tier (DPR first, then bloom, then clouds). Never bounce up and down.
- Pause rendering when the tab is hidden or the canvas is off-screen. Handle `webglcontextlost` / `webglcontextrestored`.
- Dispose all geometries, materials, textures and the renderer on unmount. No memory growth after 20 route changes.
- **Reduce Effects / `prefers-reduced-motion`:** no canvas animation, no smooth scroll, no parallax, no twinkle. The final night state must not depend on animation.
- **Mobile (360 to 430 px):** natural touch scrolling, avoid pinning if it hurts, fewer layers, sun and moon still visible, no horizontal overflow.
- Canvas `aria-hidden="true"`; all content is real DOM text in logical order; keyboard navigation and the chapter rail work; visible focus rings.
- Targets: about 60 fps on a normal laptop, Lighthouse Performance ≥ 85 on mobile, CLS < 0.05.

**Commit:** `perf(sky): add quality tiers, mobile tuning and fallbacks`

---

## Phase 10: Final QA and Docs

**Screenshot script (`scripts/sky-shots.mjs`, Playwright as a devDependency):** for `p` in `[0, 0.08, 0.2, 0.38, 0.55, 0.68, 0.78, 0.87, 1.0]` and viewports **1920x1080** and **390x844**, open `/?sky=<p>`, wait for the canvas, save `shots/sky-<p>-<width>.png`. Codex must review the screenshots and fix: clipped text, header overlap, unreadable text, horizontal scroll, black flashes, banding, a flat-looking sun or moon.

**Manual tests:** scroll down and up, fast and slow scroll, touch scroll, resize during scroll, route navigation, reload at top and at a deep URL, Reduce Effects, reduced motion, keyboard-only, Chrome / Edge / Firefox / Safari iOS / Chrome Android.

**Final acceptance checklist**
- [ ] Hero text fully visible; header not overlapped; no horizontal scroll at any width
- [ ] First screen is a 3D sunrise with an intro lift
- [ ] Sun arcs through a bright blue day, golden hour, and sets at the horizon
- [ ] Sunset → twilight → stars → moon → night is one continuous shot with no black flash
- [ ] Moon shows the NASA texture (maria, Crisium, Tycho), near side only, soft halo, no spin
- [ ] Depth is visible: ridges with haze, cloud parallax, subtle camera and mouse motion
- [ ] Scrolling backward reverses naturally; any scroll position gives a coherent sky
- [ ] Text contrast ≥ 4.5:1 in every phase
- [ ] Existing gallery, Planner, Atlas, Collections, auth, chapter rail, cursor, Sky pill all work
- [ ] Reduce Effects, reduced motion, no-WebGL and context-loss fallbacks work
- [ ] 3D assets under budget; the original 8000x4000 moon file is not shipped; NASA credit in footer
- [ ] No console errors; `npm run check` passes
- [ ] README documents the sky system, the timeline, Sky Mode, quality tiers, and how to tune keyframes

**Commit:** `docs: document 3D sky journey`

---

## First Prompt to Give Codex

```
Read AERIS_3D_SKY_JOURNEY_PHASES.md completely.
Create the branch feature/3d-sky and tag stable-before-3d.
Do Phase 0 only: audit the homepage, then fix the five layout bugs listed
in Phase 0. Run npm run check and take screenshots at 1920x1080 and 390x844.
Also move the original 8000x4000 moon file out of public/ (archive it) and
confirm moon_color_2k.webp, moon_color_4k.webp and moon_bump_2k.webp exist in public/3d/.
Do not start any 3D work. Show me the results and wait for approval.
```
