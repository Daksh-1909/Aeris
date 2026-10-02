# AERIS — Cinematic UI, Scroll Journey, Layout and Color Cursor Plan (for VS Code + Codex)

> **How to use:** Put this file in the repo root. Tell Codex:
> *"Read `AERIS_CINEMATIC_UI_PLAN.md` fully. Audit the current code first and list what exists. Then build phase by phase. Run `npm run check` after each phase and fix every error before continuing."*
>
> If `AERIS_UI_POLISH_PLAN.md` was already applied, reuse its design tokens and cursor files and **upgrade** them. Do not duplicate them.

---

## 0. Inspiration (what to borrow, what not to copy)

Two references were studied:

**Reference 1: dark hero with glowing concentric rings (Zenova)**
- Near-black background with one big glowing light source on the right
- Concentric luminous rings that feel like a halo
- Tiny floating particles like stars
- Big, light-weight headline on the left, soft grey supporting text
- A single pill-shaped call-to-action with an arrow
- Minimal navigation

**Reference 2: scroll-driven cinematic site (screen recording)**
- A flowing ribbon of light that moves behind the hero
- Headline with one **italic serif accent word** next to a clean sans-serif
- Glass cards floating over the glowing background
- A large rounded shape that **expands and morphs between sections** as you scroll
- Pinned sections that change while you scroll
- Animated number counters
- A small, playful cursor

**Rule:** copy the *feeling* (cinematic, calm, premium, light-driven), not the layout, colors, text or assets. AERIS must look like **a sky**, not a tech product.

---

## 1. AERIS Creative Direction

> **AERIS is a journey through one day of sky.** As you scroll, the whole website moves through time: **Dawn → Midday → Golden Hour → Dusk → Night.** Background, light, colors, and cursor all change with it.

| Reference idea | AERIS version |
|---|---|
| Glowing concentric rings | **Sun halo / cloud rings**: soft concentric rings of light behind the hero, like a sun seen through thin cloud |
| Floating particles | **Stars and dust motes** that drift slowly, fading by "time of day" |
| Flowing light ribbon | **Wind streaks and cirrus veils** that drift across the hero |
| Expanding rounded shape | **A rounded photo frame that expands to full screen** to open each chapter |
| Pinned scroll sections | **Chapters**: each time of day is a pinned section with its own photo story |
| Counters | **Sky stats**: photographs, cloud types, locations, hours of light |
| Italic accent word | Serif italic word in each headline: *"Read the sky."* |

---

## 2. Design Tokens: Time-of-Day Palette

Keep the base nature/sky palette from the polish plan and add a **per-chapter theme** set as CSS variables on `<body data-chapter="dawn|day|golden|dusk|night">`.

```css
:root {
  --bg: #0B1A24; --fg: #EAF4F7; --muted: #9FB8C4;
  --accent: #7FD1C4;            /* sea-glass */
  --glow: 159, 214, 236;        /* rgb triplet for halos and cursor */
  --cursor-a: #9FD6EC; --cursor-b: #7FD1C4;
  --chapter-ease: 900ms cubic-bezier(.22,1,.36,1);
}
body { background: var(--bg); color: var(--fg); transition: background var(--chapter-ease), color var(--chapter-ease); }

body[data-chapter="dawn"]   { --bg:#14202E; --accent:#F2B8A0; --glow:242,184,160; --cursor-a:#F2B8A0; --cursor-b:#C9B6E8; }
body[data-chapter="day"]    { --bg:#0E2A3D; --accent:#9FD6EC; --glow:159,214,236; --cursor-a:#9FD6EC; --cursor-b:#EAF4F7; }
body[data-chapter="golden"] { --bg:#2A1B14; --accent:#F2B880; --glow:242,184,128; --cursor-a:#F2B880; --cursor-b:#E8A0A0; }
body[data-chapter="dusk"]   { --bg:#1E1633; --accent:#C9A0E8; --glow:201,160,232; --cursor-a:#C9A0E8; --cursor-b:#E8A0A0; }
body[data-chapter="night"]  { --bg:#070D16; --accent:#7FD1C4; --glow:127,209,196; --cursor-a:#7FD1C4; --cursor-b:#9FD6EC; }
```

Text must stay at least 4.5:1 contrast in every chapter (verify with a script or devtools). Put a `--scrim` gradient under text that sits over photos.

**Typography**
- Display: `"Cormorant Garamond"` (italic accent words) paired with a clean sans such as `"Inter"` or `"Manrope"` for headlines and body
- Hero headline: `clamp(3rem, 8vw, 7.5rem)`, weight 300 to 400, line-height 0.98, letter-spacing -0.02em
- Eyebrow labels: 12px, uppercase, letter-spacing 0.18em, muted color
- Load fonts with `font-display: swap` and fallbacks

---

## 3. Phase 0: Audit (no edits)

Codex writes `AUDIT_REPORT.md` covering:
1. Does `npm run lint` and `npm run build` pass? List errors.
2. Which GSAP plugins are installed? Are ScrollTrigger instances cleaned up?
3. Is there any existing smooth scroll, cursor, or page transition code?
4. List every section currently on the home page and in what order.
5. List layout problems at 360, 768, 1024, 1440, 1920 px.

Wait for approval before editing.

---

## 4. Phase 1: Smooth Scrolling Foundation

**Install:** `npm i lenis` (GSAP and ScrollTrigger are already used).

**Create `src/animations/smoothScroll.ts`:**
```ts
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initSmoothScroll() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return () => {};

  const lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  const tick = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => { gsap.ticker.remove(tick); lenis.destroy(); };
}
```
- Call it once in `App.tsx` inside `useEffect` and return the cleanup.
- Anchor links and "back to top" must use `lenis.scrollTo`.
- On route change: `lenis.scrollTo(0, { immediate: true })`, then `ScrollTrigger.refresh()`.
- Stop Lenis while modals, lightbox and the mobile menu are open (`lenis.stop()` / `lenis.start()`).
- Native scrolling stays on touch devices (do not hijack touch).

**Acceptance:** scrolling feels buttery on desktop, nothing jumps on route change, reduced-motion users get normal scrolling.

---

## 5. Phase 2: Cinematic Hero ("Sun Halo")

**Layout (desktop):**
- Full viewport (`min-height: 100dvh`), headline block on the **left** (about 45% width), glowing halo on the **right**
- Navigation: logo "AERIS" with a tiny beta/season badge, links (Gallery, Atlas, Planner, Collections), search icon, profile button
- Bottom-left: scroll cue. Bottom-right: small "Daily Sky" caption chip.

**Copy (suggested):**
- Eyebrow: `A SKY JOURNAL`
- Headline: `Read the` *sky.* `Chase the light.`
- Sub: "Moments above, captured and explained. Look closer, learn the clouds, plan your next golden hour."
- CTA: pill button **"Explore the sky →"** (cloud-white fill, dark text, arrow slides on hover) plus a text link "Plan a shoot"

**Visual layers (back to front):**
1. Background gradient from the current chapter color
2. **Sun halo:** 5 to 7 concentric rings (absolutely positioned circles with radial gradients, blurred, `mix-blend-mode: screen`) in the chapter `--glow` color, with opacity falling off outward
3. **Drifting cloud veils:** 2 to 3 large soft blurred ellipses or a light SVG filter, moving very slowly
4. **Particles:** a small canvas with 60 to 90 dots (1 to 2 px) drifting upward, twinkling, parallaxing on mouse move
5. Hero photo (optional, masked into the halo area with a soft radial mask)
6. Film grain, 3 to 4 percent static
7. Content layer

**Hero animation (on load, max 1.6 s total):**
- Rings scale from 0.8 to 1 and fade in with stagger 0.08 s
- Headline reveals **line by line** (mask + translateY 100% to 0, ease `expo.out`)
- The italic word fades in last with a slight letter-spacing settle
- CTA and nav fade up
- After load, rings "breathe" (scale 1 to 1.04, 6 to 9 s yoyo, staggered) and respond to the mouse with a 12 to 20 px parallax (desktop pointer only)

**Performance rules:** one canvas only, device pixel ratio capped at 2, pause when the tab is hidden or the hero is off screen (IntersectionObserver), no `filter: blur` on large animated elements (use pre-blurred gradients), only animate `transform` and `opacity`.

**Mobile:** halo centered behind the headline at reduced size, particles reduced to 30, headline `clamp(2.75rem, 12vw, 4rem)`.

---

## 6. Phase 3: Scroll Journey (the "Chapter" system)

The home page becomes **5 chapters** plus an intro and an outro. The `data-chapter` on `<body>` changes when each chapter's center crosses the viewport center, so the background, accent, halo color and cursor colors **cross-fade smoothly**.

```ts
// pseudo-code: one ScrollTrigger per chapter
ScrollTrigger.create({
  trigger: chapterEl,
  start: "top 55%",
  end: "bottom 45%",
  onToggle: (self) => self.isActive && document.body.setAttribute("data-chapter", name),
});
```

### Page order and arrangement

| # | Section | Layout and behavior |
|---|---|---|
| 0 | **Hero** (Dawn) | Sun halo hero from Phase 2 |
| 1 | **Intro statement** | Huge centered paragraph (3 to 4 lines). Words go from 20% to 100% opacity as you scroll (scrubbed). Italic accent words. |
| 2 | **Chapter I: Dawn** | **Expanding frame** transition (see 6.1). Pinned. A big photo on one side, and 3 short text blocks that swap as you scroll. Caption chips: location, time, cloud type. |
| 3 | **Chapter II: Midday** | **Horizontal gallery** pinned: photos slide sideways while scrolling vertically, with varied sizes and parallax inside each frame |
| 4 | **Chapter III: Golden Hour** | Split layout: sticky headline left, scrolling stack of photo cards right, each card tilts slightly (±2°) and lifts on hover. Includes a "Plan your golden hour" call-to-action linking to the Planner. |
| 5 | **Chapter IV: Dusk** | Large full-bleed photo with a text overlay and **sky stats counters** (see 6.3) |
| 6 | **Chapter V: Night** | Star-field background (dense particles), quiet centered text, a final CTA: "Start your sky journal" and the Daily Sky card |
| 7 | **Footer** | Giant "AERIS" wordmark that parallaxes up, link columns, back-to-top |

### 6.1 Expanding frame transition (signature effect)
Inspired by the rounded shape that expands between sections:
- Before each chapter, a **rounded rectangle photo frame** (border-radius 32px, about 38vw by 50vh) sits centered
- As the user scrolls, it scales to cover the full viewport and its border-radius animates to 0, revealing the chapter. Use `ScrollTrigger` with `scrub: 1` and `pin: true`; animate with `clip-path: inset(...)` or width/height transforms (`clip-path` preferred for performance).
- The photo inside counter-scales slightly (1.15 to 1) for depth
- The chapter title appears as the frame finishes expanding
- Reuse one reusable component: `src/components/chapter/ChapterReveal.tsx`

### 6.2 Text scroll effects (reusable)
- `SplitReveal`: line-by-line masked reveal (use plain DOM splitting or a small helper; do not add heavy dependencies)
- `ScrubWords`: words brighten as scrolled
- `ParallaxText`: large outlined words ("DAWN", "DUSK") drifting slowly behind content at 0.2 speed

### 6.3 Counters
Count up on enter (1.4 s, `power2.out`), tabular numbers, respect reduced motion (show final values):
- **Photographs** (real count from gallery data)
- **Cloud types** (count from Atlas data if present)
- **Locations** (unique count from gallery data)
- **Hours of golden light** (a simple, honest static figure or computed)

Use real numbers from the data files, not fake ones.

### 6.4 Chapter indicator
A slim vertical progress rail on the right (5 dots with labels Dawn, Midday, Golden, Dusk, Night). The active dot glows in the chapter accent. Clicking scrolls to the chapter with Lenis.

---

## 7. Phase 4: Layout and Arrangement Rules (make everything look "totally amazing")

**Grid and spacing**
- 12-column grid, max width 1360px, side padding `clamp(1.25rem, 5vw, 4rem)`
- Vertical rhythm: sections `clamp(6rem, 14vw, 12rem)` apart; inside sections use an 8px scale
- Break the grid on purpose: offset images (some bleed to the edge), overlap text on photos with a scrim, alternate left and right

**Images**
- Mixed aspect ratios (4:5 portrait, 3:2 landscape, 1:1) arranged in a balanced composition, never a uniform boring grid
- `object-fit: cover` with a per-photo `object-position` to protect the subject
- Rounded corners 20 to 32px, thin 1px border `rgba(255,255,255,.08)`, soft shadow
- Inner parallax: image moves ±8% inside its frame on scroll
- Grain and a subtle vignette for a cinematic look; lazy-loaded with blur-up placeholders
- Always include credit and alt text

**Text**
- Left-aligned headlines, max 14 to 18 words, max-width 18ch to 22ch for big headings
- Body copy max-width 56ch, line-height 1.65, muted color
- One italic serif accent word per heading (never more than two)
- Eyebrow, then headline, then body, then CTA. Same order everywhere.

**Cards and glass**
- Glass cards: `background: rgba(255,255,255,.04)`, `backdrop-filter: blur(16px)`, 1px border `rgba(255,255,255,.1)`, radius 24px
- Use sparingly (info chips, stat cards, the Daily Sky card)

**Buttons**
- Primary: pill, cloud-white fill, dark text, arrow icon that slides 4px on hover
- Secondary: pill outline with glass fill
- All have hover, active, focus-visible and disabled states

**Navigation**
- Transparent at the top; after 60px becomes a floating glass pill centered at the top, hides on scroll down and shows on scroll up
- Active link has a sliding dot indicator

**Mobile**
- Pinned and horizontal sections become simple vertical stacks (no pinning under 768px if it hurts performance)
- Touch targets at least 44px, bottom-safe-area padding, lighter particles

---

## 8. Phase 5: Color Cursor Effects (replace the boring cursor)

Upgrade or create `src/components/cursor/CustomCursor.tsx`. Mount once in `App.tsx`.

### 8.1 Layers
1. **Core dot** (8px): follows instantly
2. **Halo ring** (40px): follows with lag, border and glow in `--cursor-a`
3. **Light trail:** a canvas that paints a short fading comet tail of glowing particles in a gradient from `--cursor-a` to `--cursor-b`. The colors follow the active chapter (dawn peach, day sky blue, golden amber, dusk violet, night sea-glass).
4. **Ambient spotlight (hero and photo areas):** a soft radial glow (`rgba(var(--glow), .14)`, radius 280px) following the pointer, using `mix-blend-mode: screen`

### 8.2 States

| Hover target | Effect |
|---|---|
| Default | Dot plus ring plus trail in the chapter colors |
| Links and buttons | Ring grows to 64px, fills with the accent at 18%, **magnetic pull** (up to 10px) on primary buttons |
| Photos (`data-cursor="view"`) | Ring becomes an 88px frosted circle with the label **"View"**; the photo gets a spotlight reveal (brightness 1.08) |
| Sliders and the horizontal gallery (`data-cursor="drag"`) | Label **"Drag"** with two small arrows |
| Chapter title areas | Trail intensity doubles, and tiny sparkle particles (stars) burst on click |
| Text inputs and textareas | Custom cursor hides, native I-beam shows |
| Mouse down | Ring shrinks to 0.8, then a **ripple ring** expands and fades (color = chapter accent) |
| Fast movement | Trail lengthens and the ring stretches slightly in the direction of travel (velocity-based scale) |
| Idle for 3 s | Ring gently pulses like a breathing light |
| Leaving the window | Fades out |

### 8.3 Technical rules
- Only on `(hover: hover) and (pointer: fine)`; never on touch
- Disabled with `prefers-reduced-motion` (native cursor remains)
- Position via `gsap.quickTo`; **no React state updates on mousemove**
- Trail canvas: `position: fixed; inset: 0; pointer-events: none`, DPR capped at 2, max about 40 live particles, draw with `requestAnimationFrame`, pause when the tab is hidden
- Read colors from CSS variables (`getComputedStyle(document.body).getPropertyValue('--cursor-a')`) and re-read when `data-chapter` changes (use a `MutationObserver` on the `data-chapter` attribute)
- Event delegation on `document` with `data-cursor` attributes
- Restore the native cursor on inputs, `select`, `textarea`, `[contenteditable]`, and if the component fails
- Never the only indicator of interactivity; hover and focus styles still exist on all controls
- Remove all listeners, tweens, observers and the rAF loop on unmount

### 8.4 Starter code for the trail (Codex may refine)
```ts
// src/components/cursor/trail.ts
type P = { x: number; y: number; vx: number; vy: number; life: number; size: number };

export function createTrail(canvas: HTMLCanvasElement, getColors: () => [string, string]) {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize(); addEventListener("resize", resize);

  const parts: P[] = [];
  let raf = 0, last = { x: -100, y: -100 };

  const emit = (x: number, y: number) => {
    const speed = Math.hypot(x - last.x, y - last.y);
    const n = Math.min(3, 1 + Math.floor(speed / 18));
    for (let i = 0; i < n; i++) {
      parts.push({ x, y, vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6 - .15, life: 1, size: 1.5 + Math.random() * 2.5 });
    }
    if (parts.length > 40) parts.splice(0, parts.length - 40);
    last = { x, y };
  };

  const loop = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const [a, b] = getColors();
    ctx.globalCompositeOperation = "lighter";
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx; p.y += p.vy; p.life -= 0.035;
      if (p.life <= 0) { parts.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
      g.addColorStop(0, i % 2 ? a : b); g.addColorStop(1, "transparent");
      ctx.globalAlpha = p.life * 0.8; ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2); ctx.fill();
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  return { emit, destroy: () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); } };
}
```
Wire `emit` to `pointermove`. Add the label states and the ripple using the CSS and GSAP approach from the polish plan.

---

## 9. Phase 6: Page Transitions and Micro-interactions

- **Route transitions:** a full-screen panel in the chapter color wipes up (400 ms), the route swaps, then the panel wipes away (400 ms). Under reduced motion, use a simple fade.
- **Link hover:** underline draws left to right; arrow nudges 4px
- **Image hover:** scale 1.04, brightness 1.06, caption slides up
- **Loader:** a short intro (under 1.2 s, once per session) with the AERIS wordmark and a halo ring expanding; skipped on reduced motion and on repeat visits
- **Toasts:** slide up, `aria-live="polite"`

---

## 10. Phase 7: Performance, Accessibility, Compatibility

- Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95
- Pause every animation loop (particles, trail, halo breathing) when off screen or when the tab is hidden
- Use `will-change` only on actively animating layers, and remove after
- Cap total canvas count at 2 (hero particles and cursor trail)
- Provide a **"Reduce effects" toggle** in the footer or settings that disables the cursor trail, particles, smooth scroll and parallax, saved in storage
- Keyboard: skip link, logical focus order, visible focus rings in `--accent`, chapter rail reachable by keyboard
- Screen readers: decorative layers get `aria-hidden="true"`; pinned sections remain readable in DOM order
- Test: Chrome, Safari (iOS), Firefox, Edge; 60 fps on a mid-range laptop
- Fix any layout shift (CLS < 0.05) by reserving image and font space

---

## 11. Final Acceptance Checklist

- [ ] Hero shows the glowing sun-halo, particles, and line-by-line headline with an italic accent word
- [ ] Smooth (Lenis) scrolling works; no jumps on route change; reduced-motion respected
- [ ] 5 chapters change the whole site's colors smoothly while scrolling
- [ ] Expanding-frame transition works and is smooth (no jank)
- [ ] Horizontal gallery, sticky split section, and counters work
- [ ] Layout looks balanced at 360, 768, 1024, 1440, 1920 px with no overflow
- [ ] Color cursor: dot, halo, glowing trail, "View" and "Drag" labels, ripple, magnetic buttons
- [ ] Cursor is absent on touch and reduced-motion, and normal in inputs
- [ ] No React re-renders from mouse movement
- [ ] "Reduce effects" toggle works
- [ ] All contrast checks pass in every chapter
- [ ] `npm run check` passes with zero errors
- [ ] README updated (chapter system, cursor, how to add a new chapter)

---

## 12. Suggested Order and Commits

| Order | Task | Example commit |
|---|---|---|
| 1 | Audit report | `docs: add cinematic UI audit` |
| 2 | Lenis smooth scroll | `feat(scroll): add Lenis smooth scrolling synced with GSAP` |
| 3 | Chapter tokens and body theming | `style: add time-of-day chapter themes` |
| 4 | Sun-halo hero and particles | `feat(hero): add cinematic sun halo hero` |
| 5 | Chapter sections and expanding frame | `feat(home): add scroll journey chapters` |
| 6 | Layout and image polish | `style: refine layout, imagery and typography` |
| 7 | Color cursor and trail | `feat(cursor): add chapter-aware color cursor with light trail` |
| 8 | Transitions, performance, a11y | `perf: optimize animations and add reduce-effects toggle` |

---

## 13. First Prompt to Give Codex

```
Read AERIS_CINEMATIC_UI_PLAN.md completely. Do Phase 0 only: audit the current
home page, scroll setup, cursor code and layout at the listed widths, then
write AUDIT_REPORT.md. Do not change source files yet. After I approve,
start with Phase 1 (Lenis smooth scrolling) and run npm run check after each phase.
```
