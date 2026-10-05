# AERIS — UI Polish, Bug Fixes, Palette and Cursor Plan (for VS Code + Codex)

> **How to use:** Put this file in the repo root. Tell Codex:
> *"Read `AERIS_UI_POLISH_PLAN.md` fully. Do Phase 0 (audit) first and report findings without editing. Then work phase by phase. After each phase run `npm run check` and fix every error before moving on."*

---

## 0. Project Context

- **Repo:** `Daksh-1909/Aeris` | **Live:** `aeris-liart.vercel.app`
- **Stack:** React, TypeScript (strict), Vite, Tailwind CSS, GSAP, optional Supabase
- **Structure:** `src/{animations,components,data,hooks,sections,services,types}`, `App.tsx`, `index.css`
- **Current theme color in `index.html`:** `#080909` (near-black, no nature identity)
- **Goal of this plan:** a **bug-free, visually perfect, cohesive UI** with a **sky / cloud / nature palette** and a **premium custom cursor**.

**Ground rules for Codex**
1. Do not remove features. Fix and polish them.
2. Keep TypeScript strict. No `any` without a comment.
3. All colors, radii, shadows, spacing and motion values must come from design tokens (Section 2), never hard-coded in components.
4. Every change must work on mobile, tablet and desktop, with keyboard only, and with `prefers-reduced-motion`.
5. Make small commits per task, e.g. `fix(ui): correct hero overflow on small screens`.

---

## Phase 0 — Audit First (no edits)

Codex must inspect the project and produce a written report (`AUDIT_REPORT.md`) listing:

1. **Build health:** run `npm install`, `npm run lint`, `npm run build`. List every error and warning.
2. **Console errors:** run `npm run dev`, open every route, and list every console error/warning (React key warnings, hydration issues, failed network requests, missing images, ScrollTrigger warnings).
3. **Route check:** visit `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/dashboard`, `/favorites`, `/collections`, `/search`, `/notifications`, `/profile/:username`, `/contact` and an unknown URL. Note any blank, broken, or unstyled page.
4. **Visual defects:** at widths **360, 390, 768, 1024, 1280, 1536, 1920 px**, list overflow, overlapping text, clipped images, inconsistent spacing, unreadable text over images, misaligned grids, layout shift.
5. **Interaction defects:** buttons without hover/focus/active/disabled states, dead links, forms with no validation or feedback, modals that don't trap focus, scroll jumps.
6. **Animation defects:** GSAP/ScrollTrigger instances not cleaned up on unmount, animations replaying on every re-render, jank, animation running when the tab is hidden.
7. **Accessibility defects:** missing alt text, bad heading order, low contrast, missing labels, no focus ring.

Output format per finding: `ID | Severity (Critical/High/Medium/Low) | Route/File | Problem | Proposed fix`.
**Wait for approval before editing.**

---

## Phase 1 — Bugs and Errors Checklist

Fix everything found in Phase 0, and specifically verify all of these common problems:

### 1.1 Build and code health
- [ ] `npm run check` passes with **zero** errors and **zero** warnings
- [ ] No unused imports, variables, or dead files
- [ ] No `console.log` left in production code
- [ ] No hard-coded secrets; `.env.example` is up to date

### 1.2 React and animation correctness
- [ ] Every `useEffect` that creates GSAP tweens or ScrollTriggers returns a cleanup (`ctx.revert()` using `gsap.context`)
- [ ] ScrollTrigger is refreshed after images load (use image `onLoad` or `ScrollTrigger.refresh()` after fonts and images settle)
- [ ] Lists use stable `key` props (IDs, not array index)
- [ ] No state updates after unmount
- [ ] Route changes scroll to top (or restore position on back) and move focus to the main heading
- [ ] The error boundary shows a friendly message with a "Reload" button, not a stack trace

### 1.3 Images
- [ ] Every `<img>` has a width, height or aspect-ratio (no layout shift), meaningful `alt`, and `loading="lazy"` (except the hero)
- [ ] A broken or slow image shows a soft sky-gradient placeholder, not a broken-image icon
- [ ] Add a graceful `onError` fallback for every remote image

### 1.4 Forms and routes
- [ ] Inline validation with clear error text under each field, plus an `aria-live` message for submit results
- [ ] Disabled and loading states on submit buttons
- [ ] A proper 404 page; empty states for favorites, collections, notifications, search with no results
- [ ] Demo-mode banner when Supabase is not configured (honest labelling)

### 1.5 Responsive and overflow
- [ ] No horizontal scroll at any width (`overflow-x` must not be hidden to mask the problem; fix the cause)
- [ ] Use `min-h-dvh` instead of `100vh` for full-screen sections (mobile browser bars)
- [ ] Safe-area padding for notched phones (`env(safe-area-inset-*)`)
- [ ] Touch targets are at least 44x44 px

---

## Phase 2 — Design System and Nature / Sky / Cloud Palette

Create or replace the tokens in `src/index.css` (as CSS variables) and map them in `tailwind.config.js`. The default look is **"Dusk Sky"** (dark, cinematic, fits the photos). Also provide a **"Daylight"** light theme.

### 2.1 Palette: "Dusk Sky" (default dark theme)

| Token | Hex | Meaning | Use |
|---|---|---|---|
| `--sky-950` | `#0B1A24` | Deep night sky | Page background |
| `--sky-900` | `#10283A` | Twilight | Cards, sections |
| `--sky-800` | `#14323F` | Dusk teal | Raised surfaces, nav |
| `--sky-600` | `#3D5566` | Storm cloud | Borders, dividers |
| `--mist-400` | `#9FB8C4` | Morning mist | Secondary text |
| `--cloud-50` | `#EAF4F7` | Cirrus white | Primary text |
| `--azure-300` | `#9FD6EC` | Clear sky | Links, info, focus ring |
| `--sage-300` | `#7FD1C4` | Fresh canopy / sea-glass | Primary accent, buttons |
| `--gold-300` | `#F2B880` | Golden hour | Highlight accent, "Daily Sky" |
| `--rose-300` | `#E8A0A0` | Sunset rose | Errors/danger (soft), favorites heart |

Verified text contrast on `--sky-950`: cloud-50 15.8:1, mist-400 8.5:1, azure-300 11.2:1, sage-300 9.9:1, gold-300 10.1:1. Dark text (`--sky-950`) on a `--sage-300` or `--gold-300` button is 9.9:1 or 10.1:1.

### 2.2 Palette: "Daylight" (light theme, optional toggle)

| Token | Hex | Use |
|---|---|---|
| `--day-bg` | `#F4F8F6` | Page background (soft cloud white) |
| `--day-surface` | `#FFFFFF` | Cards |
| `--day-text` | `#14323F` | Primary text (12.6:1 on bg) |
| `--day-muted` | `#5A6F7A` | Secondary text (4.9:1 on bg, use only at 14px+ regular or bold) |
| `--day-accent` | `#1F4E5F` | Buttons/links (8.5:1 on bg) |

### 2.3 Gradients (use sparingly, one hero gradient per page)
```css
:root {
  --grad-dusk:  linear-gradient(180deg, #0B1A24 0%, #10283A 55%, #14323F 100%);
  --grad-dawn:  linear-gradient(180deg, #10283A 0%, #3D5566 60%, #F2B880 130%);
  --grad-mist:  radial-gradient(60% 50% at 50% 0%, rgba(159,214,236,.18), transparent 70%);
  --scrim:      linear-gradient(180deg, rgba(11,26,36,0) 0%, rgba(11,26,36,.78) 100%);
}
```
- Put `--scrim` over every image that has text on it so the text always has enough contrast.
- Use `--grad-mist` as a soft glow behind hero text, not as a flat fill.

### 2.4 Type, spacing, radius, shadow, motion tokens
```css
:root {
  /* Type: one display serif + one clean sans (Google Fonts, with fallbacks) */
  --font-display: "Cormorant Garamond", "Playfair Display", Georgia, serif;
  --font-body:    "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;

  /* Fluid type scale */
  --text-hero: clamp(2.75rem, 7vw + 1rem, 6.5rem);
  --text-h2:   clamp(1.875rem, 3vw + 1rem, 3.25rem);
  --text-h3:   clamp(1.25rem, 1vw + 1rem, 1.625rem);
  --text-body: clamp(1rem, .2vw + .95rem, 1.125rem);

  /* Spacing (8px rhythm) */
  --space-1: .5rem; --space-2: 1rem; --space-3: 1.5rem;
  --space-4: 2rem;  --space-6: 3rem; --space-8: 4rem; --space-12: 6rem;

  /* Radius and shadow */
  --radius-sm: 8px; --radius-md: 14px; --radius-lg: 24px; --radius-pill: 999px;
  --shadow-soft: 0 10px 30px -12px rgba(0,0,0,.45);
  --shadow-glow: 0 0 0 1px rgba(159,214,236,.18), 0 18px 50px -20px rgba(127,209,196,.35);

  /* Motion */
  --ease-sky:   cubic-bezier(.22, 1, .36, 1);
  --dur-fast: 160ms; --dur-base: 320ms; --dur-slow: 700ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; }
}
```

### 2.5 Apply the palette (tasks)
1. Replace every hard-coded color in `index.css` and components with tokens. Search the codebase for `#`, `rgb(`, `rgba(`, `black`, `white`, `gray-` and replace.
2. Update `<meta name="theme-color">` in `index.html` to `#0B1A24`.
3. Set `color-scheme: dark light` and add a theme toggle (Dusk / Daylight / Auto) that stores the choice and avoids a flash of wrong theme (set the class in an inline script before React loads).
4. Buttons: **Primary** = `--sage-300` background with `--sky-950` text. **Secondary** = transparent with a `--mist-400` border. **Accent** = `--gold-300`. All need hover, active, focus-visible and disabled states.
5. Links use `--azure-300` with an animated underline, and a visible focus ring: `outline: 2px solid var(--azure-300); outline-offset: 3px;`.
6. Cards use `--sky-900` with a 1px `--sky-600` border at low opacity, `--radius-lg`, and a hover lift (translateY(-4px) + `--shadow-glow`).
7. Add a subtle **film-grain or noise overlay** at 3 to 4 percent opacity on the hero only (static, not animated, for performance).

---

## Phase 3 — Perfect UI: Section-by-Section Polish

Codex should review each area against this checklist and fix what fails.

### 3.1 Global
- [ ] One consistent max content width (e.g. 1280px) with fluid side padding (`clamp(1rem, 4vw, 3rem)`)
- [ ] Consistent vertical rhythm between sections (`--space-12` desktop, `--space-8` mobile)
- [ ] Smooth anchor scrolling with a fixed-header offset (`scroll-padding-top`)
- [ ] Custom thin scrollbar in the palette (`scrollbar-color: var(--sky-600) var(--sky-950)`)
- [ ] Text selection color: `::selection { background: var(--sage-300); color: var(--sky-950); }`
- [ ] A branded page-load experience: short fade-in with a small "AERIS" wordmark, max 800 ms, skipped under reduced motion
- [ ] Smooth **page transitions** between routes (fade + 12px rise, 300 ms)

### 3.2 Navigation / header
- [ ] Transparent over the hero, then a blurred glass bar (`backdrop-filter: blur(14px)`, `--sky-950` at 70 percent) after 40px of scroll
- [ ] Active route indicator (small sage dot or underline that slides between items)
- [ ] Mobile menu: full-screen overlay, focus trap, Esc to close, body scroll lock, staggered link reveal
- [ ] Logo is a link to home with a clear focus state

### 3.3 Hero
- [ ] Headline uses `--font-display` at `--text-hero`, with a short supporting line and **one** clear primary call-to-action plus one secondary
- [ ] A slow, subtle parallax or Ken Burns zoom on the background image (disabled for reduced motion)
- [ ] Animated drifting-cloud layer (CSS gradients or a light SVG, no heavy video) with very low opacity
- [ ] Scroll cue ("Scroll to explore") that fades out after scrolling
- [ ] Text always sits on `--scrim` for contrast

### 3.4 Gallery and photo cards
- [ ] A masonry or balanced grid with consistent gaps and no cropped subjects (use `object-position` per photo if needed)
- [ ] Hover (desktop): image scales 1.04, overlay reveals title and location, cursor changes to "View" (see Section 4)
- [ ] Tap (mobile): shows overlay info without breaking navigation
- [ ] Staggered reveal on scroll (opacity and 24px rise), triggered once, not on every scroll
- [ ] Lightbox: keyboard (arrows, Esc), swipe, focus trap, preloads neighbors, caption and credit

### 3.5 Forms, buttons, inputs
- [ ] Inputs: 48px height, `--sky-900` fill, 1px `--sky-600` border, focus ring in `--azure-300`, floating or clear labels
- [ ] Error state in `--rose-300` with an icon plus text (never color alone)
- [ ] Success state in `--sage-300` with a short animated check
- [ ] Button press feedback: scale .98, and a loading spinner that keeps the button width

### 3.6 Dashboard, favorites, collections, notifications, profile
- [ ] Consistent page header (title, short description, primary action)
- [ ] Skeleton loaders (soft shimmering cloud-colored blocks) instead of spinners
- [ ] Friendly empty states with a small illustration (inline SVG cloud or sun) and a clear next action
- [ ] Heart/favorite button: pop animation, `--rose-300` fill, `aria-pressed`
- [ ] Notification list: unread dot in `--gold-300`, mark-all-read action

### 3.7 Footer
- [ ] Clear columns (Explore, Account, Contact), small print, back-to-top button
- [ ] A subtle horizon-line gradient divider above the footer

### 3.8 Micro-interactions (keep tasteful)
- Magnetic effect on primary buttons (max 8px pull, desktop pointer only)
- Link underline draws left to right
- Section titles reveal line by line
- Toast notifications slide in from the bottom with `aria-live="polite"`

---

## Phase 4 — Premium Custom Cursor

The current cursor feels boring. Build a **cloud-light cursor system** that is delightful but never gets in the way.

### 4.1 Concept
A small **dot** that follows the pointer instantly, plus a larger soft **halo ring** that follows with smooth lag (like a drifting cloud or lens glow). The halo changes shape and label depending on what the user hovers.

### 4.2 States

| Element hovered | Cursor behavior |
|---|---|
| Default / empty space | 8px dot (`--cloud-50`) + 36px ring, `--azure-300` at 40% opacity, `mix-blend-mode: difference` optional |
| Links and buttons | Ring grows to 56px, fills with `--sage-300` at 18% opacity, dot shrinks |
| Photo cards / gallery images | Ring becomes a 84px frosted circle with the label **"View"** |
| Draggable / sliders | Ring shows **"Drag"** with left and right arrows |
| Text inputs and textareas | Cursor hides and the **native text I-beam** shows (never block text editing) |
| Disabled elements | Ring turns to a small "not allowed" muted style |
| Mouse down | Ring scales to 0.85 with a soft ripple |
| Hero area | Optional soft light glow (radial gradient, azure at 12%) that follows the pointer and slightly brightens the photo |
| Leaving the window | Cursor fades out; fades back in on re-entry |

### 4.3 Implementation requirements
1. Create `src/components/cursor/CustomCursor.tsx` and `useCursor.ts`. Mount it once in `App.tsx`.
2. **Only enable on devices with a fine pointer and hover**: `window.matchMedia('(hover: hover) and (pointer: fine)')`. Never render on touch devices.
3. **Disable under `prefers-reduced-motion`**: fall back to the native cursor.
4. Use **`gsap.quickTo`** for position (dot: duration .08, ring: duration .45, ease `power3.out`). Do **not** update React state on `mousemove`; write transforms directly to refs to avoid re-renders.
5. Use `transform: translate3d`, `will-change: transform`, `pointer-events: none`, `position: fixed`, high `z-index`, `contain: layout paint`.
6. Detect hover targets via **event delegation** on `document` (`pointerover`/`pointerout`) and a `data-cursor` attribute:
   - `data-cursor="view"`, `data-cursor="drag"`, `data-cursor="hide"`, `data-cursor="link"` (links and buttons are detected automatically)
7. Keep the **native cursor** hidden only while the custom one is active and working (`html.has-custom-cursor { cursor: none; }`), and **always restore it** on inputs, `select`, `textarea`, iframes, and `[contenteditable]`. If the component fails to mount, the native cursor must remain.
8. Clean up all listeners and GSAP tweens on unmount; handle window resize and `visibilitychange`.
9. The cursor is **purely decorative**: it must not be the only indicator of interactivity. All interactive elements still need hover and focus styles.
10. Keyboard users keep the standard focus ring. The custom cursor never replaces it.

### 4.4 Starter code (Codex may refine)
```tsx
// src/components/cursor/CustomCursor.tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce || !dot.current || !ring.current) return;

    document.documentElement.classList.add("has-custom-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3.out" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3.out" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3.out" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3.out" });

    const move = (e: PointerEvent) => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); };

    const setState = (state: string, text = "") => {
      ring.current!.dataset.state = state;
      if (label.current) label.current.textContent = text;
    };

    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor], a, button, input, textarea, select, [contenteditable]");
      if (!t) return setState("default");
      if (t.matches("input, textarea, select, [contenteditable]")) return setState("hidden");
      const kind = t.dataset.cursor;
      if (kind === "view") return setState("view", "View");
      if (kind === "drag") return setState("drag", "Drag");
      setState("link");
    };

    const down = () => ring.current!.classList.add("is-down");
    const up = () => ring.current!.classList.remove("is-down");
    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.2 });
    const enter = () => gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.2 });

    window.addEventListener("pointermove", move);
    document.addEventListener("pointerover", over);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" data-state="default" aria-hidden="true">
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
```

```css
/* index.css */
.has-custom-cursor, .has-custom-cursor a, .has-custom-cursor button { cursor: none; }
.has-custom-cursor input, .has-custom-cursor textarea,
.has-custom-cursor select, .has-custom-cursor [contenteditable] { cursor: text; }

.cursor-dot, .cursor-ring {
  position: fixed; top: 0; left: 0; pointer-events: none; z-index: 9999;
  transform: translate3d(-50%, -50%, 0); will-change: transform;
}
.cursor-dot  { width: 8px;  height: 8px;  border-radius: 50%; background: var(--cloud-50); }
.cursor-ring {
  width: 36px; height: 36px; border-radius: 50%;
  border: 1px solid rgba(159,214,236,.5);
  display: grid; place-items: center;
  transition: width var(--dur-base) var(--ease-sky), height var(--dur-base) var(--ease-sky),
              background var(--dur-base) var(--ease-sky), opacity var(--dur-fast);
}
.cursor-ring[data-state="link"] { width: 56px; height: 56px; background: rgba(127,209,196,.18); }
.cursor-ring[data-state="view"],
.cursor-ring[data-state="drag"] {
  width: 84px; height: 84px; background: rgba(16,40,58,.55);
  backdrop-filter: blur(8px); border-color: rgba(234,244,247,.35);
}
.cursor-ring[data-state="hidden"] { opacity: 0; }
.cursor-ring.is-down { scale: .85; }
.cursor-label { font: 500 .75rem/1 var(--font-body); letter-spacing: .08em; text-transform: uppercase; color: var(--cloud-50); }
```
Add `data-cursor="view"` to gallery cards and `data-cursor="drag"` to any carousel.

### 4.5 Cursor acceptance criteria
- [ ] Feels smooth at 60 fps with no input lag on the dot
- [ ] Does not render on touch devices or with reduced motion
- [ ] Typing in forms always shows the normal I-beam cursor
- [ ] No React re-renders on mouse move (check with React DevTools profiler)
- [ ] Native cursor is restored if anything fails
- [ ] No layout shift, no horizontal scrollbar caused by the cursor elements

---

## Phase 5 — Performance, Accessibility and Cross-Browser

- [ ] Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95
- [ ] Fonts: `font-display: swap`, preconnect to Google Fonts, load only the weights used
- [ ] Images: responsive `srcset`/`sizes`, modern formats where possible, hero image preloaded, `fetchpriority="high"` for the hero only
- [ ] Route-level code splitting with `React.lazy` and `Suspense`
- [ ] Animations use only `transform` and `opacity`; no layout-thrashing properties
- [ ] Respect `prefers-reduced-motion` everywhere (parallax, cursor, page transitions, reveals)
- [ ] Skip-to-content link, landmarks, logical heading order, labelled form controls
- [ ] Test in latest Chrome, Safari (iOS), Firefox, Edge
- [ ] Set proper `<title>`, meta description, Open Graph image, and a favicon set (including `apple-touch-icon`)

---

## Phase 6 — Final QA (update `QA_CHECKLIST.md`)

Add and tick these:

- [ ] All routes load with no console errors
- [ ] No horizontal scroll at 360, 390, 768, 1024, 1280, 1920 px
- [ ] Palette tokens used everywhere; no leftover hard-coded colors
- [ ] Dusk and Daylight themes both pass contrast checks (4.5:1 for body text)
- [ ] Custom cursor works on desktop and is absent on mobile and reduced-motion
- [ ] Keyboard-only walkthrough: nav, gallery, lightbox, forms, menu
- [ ] Screen reader pass on home, gallery, login, and contact
- [ ] `npm run check` passes with zero errors
- [ ] README updated (new palette, cursor system, how to switch themes)

---

## Suggested Order and Commits

| Order | Task | Example commit |
|---|---|---|
| 1 | Phase 0 audit report | `docs: add UI audit report` |
| 2 | Phase 1 bug fixes | `fix: resolve build, animation cleanup and layout bugs` |
| 3 | Phase 2 tokens and palette | `style: add sky and cloud design tokens` |
| 4 | Phase 3 section polish | `style: polish hero, nav, gallery and forms` |
| 5 | Phase 4 cursor | `feat(ui): add adaptive cloud cursor` |
| 6 | Phase 5 and 6 | `perf: improve performance and accessibility` |

---

## First Prompt to Give Codex

```
Read AERIS_UI_POLISH_PLAN.md completely. Run Phase 0 only: install, lint,
build, open every route at the listed widths, and write AUDIT_REPORT.md with
every bug, UI defect, accessibility problem and animation issue, each with a
severity and a proposed fix. Do not edit source files yet. Wait for my
approval, then start Phase 1.
```
