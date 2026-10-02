# AERIS --- Cinematic Day-to-Night Scroll Journey

## Purpose

Upgrade the existing AERIS homepage so the **entire main experience
feels like one continuous passage of time**:

**Sunrise → Morning → Day → Golden Hour → Sunset → Twilight → Night →
Moon**

The visitor should feel that they are physically moving through one day
in the sky as they scroll.

This is **not** a request to replace the existing AERIS design. Preserve
the current premium photography identity, navigation, gallery,
authentication/member routes, planner, atlas, chapter rail, cursor
system, reduced-effects option, and existing responsive behavior.

The new experience should become the visual storytelling layer of the
existing homepage.

------------------------------------------------------------------------

# 1. Important Existing Project Context

The repository already contains:

-   React + TypeScript + Vite
-   GSAP
-   GSAP ScrollTrigger
-   Lenis
-   Three.js
-   SunCalc
-   existing cinematic chapter system
-   existing atmosphere/cursor effects
-   responsive image system
-   Sky Clock / time-of-day treatment
-   five existing conceptual chapters:
    -   Dawn
    -   Midday
    -   Golden Hour
    -   Dusk
    -   Night

Do **not** install another animation library unless the current
implementation genuinely cannot support the required behavior.

Prefer extending existing animation utilities and components.

Before editing:

1.  Read the existing source completely enough to understand:
    -   `App.tsx`
    -   existing sections
    -   animation utilities
    -   Lenis setup
    -   chapter/theme state
    -   Sky Clock implementation
    -   cursor implementation
    -   `ui-polish.css`
    -   global CSS
    -   existing image components
2.  Search for all current ScrollTrigger, GSAP and Lenis usage.
3.  Search for all current `data-chapter`, theme and time-of-day logic.
4.  Reuse existing systems wherever possible.
5.  Do not create duplicate smooth-scroll loops or duplicate theme
    controllers.

------------------------------------------------------------------------

# 2. Desired Experience

The homepage should behave like a **cinematic timeline of one complete
day**.

At the very beginning:

### Sunrise

-   very dark pre-dawn blue
-   subtle horizon glow
-   first warm light appears
-   sun begins below/near the horizon
-   a few clouds catch the first light
-   title/intro is calm and minimal

As the user scrolls:

### Morning

-   sky becomes brighter
-   sun rises
-   warm peach/gold tones gradually transition toward clean daylight
    blue
-   clouds become more visible
-   atmosphere becomes lighter

Then:

### Day

-   bright blue sky
-   sun high in the sky
-   soft moving cloud layers
-   stronger natural illumination
-   photography becomes brighter and clearer

Then:

### Golden Hour

-   blue gradually becomes warmer
-   amber/orange light increases
-   sun moves toward the horizon
-   long soft shadows / warm photography
-   visual atmosphere becomes cinematic

Then:

### Sunset

-   sun touches and passes the horizon
-   sky transitions orange → coral → rose → violet
-   sun glow becomes wider and softer
-   clouds become silhouettes
-   page becomes progressively darker

Then:

### Twilight

-   warm colors disappear
-   deep blue/purple takes over
-   first stars appear
-   remaining horizon glow slowly fades

Finally:

### Night

-   deep navy/near-black sky
-   moon appears
-   stars become clearly visible
-   subtle moon halo
-   quiet, elegant closing section
-   final AERIS message/CTA
-   no sudden black screen

The transition must feel continuous rather than like eight unrelated
sections.

------------------------------------------------------------------------

# 3. Core Visual Concept

Create one persistent full-screen atmospheric layer behind the homepage
content.

Suggested structure:

``` text
Homepage
│
├── Fixed / sticky Sky Atmosphere
│   ├── Sky gradient
│   ├── Sun
│   ├── Sun glow
│   ├── Cloud layers
│   ├── Horizon haze
│   ├── Stars
│   ├── Moon
│   └── subtle atmospheric particles
│
└── Scroll-driven editorial content
    ├── Sunrise
    ├── Morning
    ├── Day
    ├── Golden Hour
    ├── Sunset
    ├── Twilight
    └── Night
```

The atmosphere should remain visually connected while content changes
above it.

Do not rebuild the entire background every time the chapter changes.

------------------------------------------------------------------------

# 4. Scroll Timeline

Use a normalized timeline:

``` text
0.00 — Pre-Dawn
0.08 — Sunrise begins
0.20 — Morning
0.38 — Day
0.55 — Afternoon
0.68 — Golden Hour
0.78 — Sunset
0.87 — Twilight
1.00 — Night
```

These values are conceptual. Tune them after testing the real page
height.

Use a single master ScrollTrigger/timeline where practical.

The scroll position should drive all atmospheric properties.

Do not create many competing ScrollTriggers that fight over the same CSS
properties.

------------------------------------------------------------------------

# 5. Sun Movement

Create a reusable `SkySun` component if one does not already exist.

The sun should move according to scroll progress.

Conceptual path:

``` text
        ☀
       / \
      /   \
     /     \
----/-------\----
 horizon
```

More specifically:

-   start below/near the horizon
-   rise toward upper-middle viewport
-   reach its highest point during daytime
-   slowly descend
-   reach the horizon at sunset
-   fade away after sunset

The sun should not simply move vertically.

Use a smooth curved arc.

Recommended implementation:

-   CSS transform for position
-   GSAP interpolation
-   optional SVG path / MotionPath only if already available and
    justified
-   no expensive per-frame React state updates

Suggested values:

``` text
Sun X:
sunrise      18%
morning      30%
day          50%
afternoon    68%
golden       82%
sunset       90%

Sun Y:
sunrise      82%
morning      55%
day          22%
afternoon    30%
golden       58%
sunset       82%
night        100% / hidden
```

Treat these as starting points, not rigid values.

------------------------------------------------------------------------

# 6. Sun Appearance

The sun should have multiple layers:

``` text
Sun Core
Sun Inner Glow
Sun Outer Glow
Atmospheric Halo
```

Use CSS radial gradients where possible.

The glow should become:

-   stronger around sunrise
-   clean/bright during day
-   larger and warmer during golden hour
-   very wide and soft at sunset
-   invisible after twilight

Avoid a cheap-looking neon circle.

The sun should feel atmospheric and slightly diffused.

------------------------------------------------------------------------

# 7. Sky Color Transition

Use CSS custom properties so the entire visual system can transition
smoothly.

Suggested variables:

``` css
--sky-top
--sky-middle
--sky-bottom
--horizon-glow
--sun-color
--sun-glow
--cloud-light
--cloud-shadow
--star-opacity
--moon-opacity
--foreground
--muted-foreground
```

Interpolate these values using GSAP.

Do not switch colors abruptly at chapter boundaries.

Example conceptual palette:

### Pre-Dawn

``` text
#07111F
#13243B
#3B4960
```

### Sunrise

``` text
#182A45
#C77E67
#F1B77E
```

### Day

``` text
#6FAED1
#A9D5E8
#DDEEF3
```

### Golden Hour

``` text
#587C9B
#D99561
#F2B56F
```

### Sunset

``` text
#4A3654
#B75F5D
#E58A62
```

### Twilight

``` text
#241E43
#34376B
#111A35
```

### Night

``` text
#030712
#071329
#0B1832
```

The photography should still provide most of the visual color.

------------------------------------------------------------------------

# 8. Clouds

Use existing cloud/atmosphere components if available.

Create 2--4 lightweight cloud layers.

Each layer should have:

-   different opacity
-   different scale
-   different horizontal movement
-   slight parallax
-   different blur
-   different vertical position

Cloud movement should be extremely subtle.

Do not make clouds move like a weather animation.

They should feel almost imperceptibly alive.

During sunset:

-   cloud highlights become warm
-   cloud bodies become darker
-   silhouettes increase

During night:

-   clouds become very subtle
-   optionally retain a few dark atmospheric silhouettes

------------------------------------------------------------------------

# 9. Stars

Create or reuse a lightweight star field.

Stars should be:

``` text
hidden at daytime
↓
almost invisible at late sunset
↓
slowly appear during twilight
↓
fully visible at night
```

Use opacity controlled by the master scroll progress.

Avoid thousands of DOM nodes.

Preferred options:

1.  existing atmosphere canvas
2.  CSS radial-gradient/star texture
3.  lightweight canvas
4.  Three.js only if the existing project already uses it for this
    purpose

Do not introduce a heavy WebGL scene just to render simple stars.

Add subtle twinkle only if performance remains excellent.

------------------------------------------------------------------------

# 10. Moon

Create a reusable `SkyMoon` component.

The moon should enter during late twilight.

It should:

-   fade in
-   rise gently
-   have a soft halo
-   remain visually understated
-   become the primary celestial object at night

Suggested moon position:

``` text
Twilight:
x ≈ 72%
y ≈ 70%

Night:
x ≈ 78%
y ≈ 28%
```

The moon should not look like a flat emoji or basic white circle.

Use:

-   textured/gradient surface
-   subtle shadow
-   atmospheric halo
-   optional very subtle phase shading

If an existing moon implementation exists, improve it instead of
creating another.

------------------------------------------------------------------------

# 11. Horizon

The horizon is important because it connects sunrise and sunset.

Create a persistent horizon layer with:

-   soft haze
-   subtle atmospheric depth
-   changing warm/cool tint
-   optional distant landscape silhouette

At sunrise:

``` text
dark horizon + thin warm glow
```

At day:

``` text
bright clean horizon
```

At sunset:

``` text
strong warm horizon glow
```

At night:

``` text
deep silhouette + faint blue haze
```

Keep this elegant and photographic.

------------------------------------------------------------------------

# 12. Photography Integration

The atmospheric timeline must work with AERIS photography.

Do not place all photographs behind the animation.

Instead, make the photos feel like visual memories captured during
different times of the day.

Recommended mapping:

``` text
SUNRISE
→ sunrise / dawn photographs

MORNING
→ bright cloud photographs

DAY
→ blue-sky / cloud studies

GOLDEN HOUR
→ warm landscape / cloud photographs

SUNSET
→ sunset photography

TWILIGHT
→ blue-hour photographs

NIGHT
→ moon / night-sky / dark nature photography
```

Existing gallery data should be reused.

Do not create fake image URLs.

Do not replace existing local WebP images unless necessary.

------------------------------------------------------------------------

# 13. Chapter System Change

The existing five conceptual chapters:

``` text
Dawn
Midday
Golden Hour
Dusk
Night
```

should remain meaningful, but the visual atmosphere should become more
continuous.

You may internally use:

``` text
Pre-Dawn
Sunrise
Morning
Day
Golden Hour
Sunset
Twilight
Night
```

while keeping the existing chapter rail if it is already part of the
site's navigation.

Do not create an unnecessary second navigation system.

If the existing chapter rail supports only five labels, map the detailed
timeline to those five major chapters:

``` text
Dawn        = Pre-Dawn + Sunrise + Morning
Midday      = Morning + Day + Afternoon
Golden Hour = Golden Hour + Sunset
Dusk        = Sunset + Twilight
Night       = Night
```

This gives a richer visual journey without breaking existing navigation.

------------------------------------------------------------------------

# 14. Content Behavior

Content should also respond to the time of day.

Example:

### Sunrise

Large heading:

``` text
Where the day begins.
```

### Day

``` text
Under an endless blue.
```

### Golden Hour

``` text
Light, before it leaves.
```

### Sunset

``` text
Every ending carries color.
```

### Night

``` text
When the sky becomes infinite.
```

These are visual-direction examples. Preserve existing AERIS copy where
it is already better.

Do not replace meaningful existing content unnecessarily.

Text transitions should use:

-   opacity
-   y movement
-   clip/mask reveals
-   subtle blur where appropriate

Avoid excessive text animation.

------------------------------------------------------------------------

# 15. Scroll Feel

The scroll should feel cinematic.

Use the existing Lenis implementation.

Ensure Lenis and GSAP ScrollTrigger remain synchronized.

The user should be able to:

-   slowly scroll and observe the transition
-   quickly scroll and still get a stable visual state
-   reverse scroll naturally
-   stop at any point and see a coherent sky

Important:

**Every scroll position must produce a valid visual state.**

There must be no dependency on the user reaching a specific trigger
point in order to make the background correct.

------------------------------------------------------------------------

# 16. Signature Transition

At major moments, use the existing AERIS expanding-frame transition
where appropriate.

Do not use a hard page wipe for every time-of-day change.

Instead:

### Sunrise → Day

Use light expansion / brighter atmosphere.

### Day → Golden Hour

Use warm color wash + image transition.

### Golden Hour → Sunset

Use large cinematic sun/horizon transition.

### Sunset → Night

Use the strongest transition:

``` text
warm sky
↓
sun sinks
↓
horizon glow fades
↓
violet twilight
↓
stars appear
↓
moon rises
↓
night
```

This should feel like one cinematic shot.

------------------------------------------------------------------------

# 17. Fixed Atmosphere Architecture

Prefer:

``` text
<SkyTimeline>
  <SkyGradient />
  <Horizon />
  <Sun />
  <CloudLayers />
  <Stars />
  <Moon />
</SkyTimeline>
```

Mount this once at the homepage level.

Use:

``` css
position: fixed;
inset: 0;
pointer-events: none;
z-index: appropriate-background-layer;
```

Do not place it above readable content.

Respect the existing stacking context.

------------------------------------------------------------------------

# 18. Suggested Files

Only create files if equivalent functionality does not already exist.

Potential structure:

``` text
src/
├── components/
│   └── sky/
│       ├── SkyTimeline.tsx
│       ├── SkySun.tsx
│       ├── SkyMoon.tsx
│       ├── SkyStars.tsx
│       ├── SkyClouds.tsx
│       └── SkyHorizon.tsx
│
├── animations/
│   └── skyTimeline.ts
│
└── data/
    └── skyTimeline.ts
```

If the current architecture already has suitable components, extend
those instead.

------------------------------------------------------------------------

# 19. Animation Implementation Rules

Use GSAP for animation.

Prefer one master progress value:

``` ts
const progress = self.progress;
```

Then derive:

``` text
sun position
sky colors
sun opacity
sun glow
cloud opacity
cloud tint
star opacity
moon opacity
moon position
horizon glow
content state
```

from that progress.

Avoid:

``` text
React setState on every scroll frame
```

Use refs and GSAP setters for high-frequency animation.

Do not cause React re-renders on every scroll tick.

------------------------------------------------------------------------

# 20. Performance

This effect must feel premium, not heavy.

Requirements:

-   target 60 FPS on a normal modern laptop
-   no continuous expensive React renders
-   no unnecessary canvas loops
-   pause off-screen animation where possible
-   pause animations when tab is hidden
-   respect existing Reduce Effects setting
-   respect `prefers-reduced-motion`
-   keep image loading lazy except critical hero assets
-   avoid layout-triggering properties during animation
-   prefer `transform` and `opacity`
-   use CSS variables for visual interpolation
-   use `will-change` only on actively animated layers

Do not create hundreds/thousands of DOM elements for particles.

------------------------------------------------------------------------

# 21. Reduced Motion

When:

``` css
@media (prefers-reduced-motion: reduce)
```

or the site's existing "Reduce effects" setting is enabled:

-   disable Lenis if the existing setting already does this
-   disable parallax
-   disable animated cloud movement
-   disable star twinkle
-   disable smooth sun movement
-   show stable time-of-day visuals
-   keep the page fully usable
-   preserve content order

The final night state must not depend on animation.

------------------------------------------------------------------------

# 22. Mobile Behavior

The experience must work on:

``` text
360px
390px
430px
768px
1024px
1440px
1920px
```

On mobile:

-   simplify cloud layers
-   reduce particles
-   reduce glow complexity
-   keep sun and moon visible
-   do not use expensive pinned effects if they hurt scrolling
-   preserve natural touch scrolling
-   keep text readable
-   prevent horizontal overflow
-   keep the timeline coherent

Do not make mobile a completely different website.

------------------------------------------------------------------------

# 23. Existing Sky Clock Integration

AERIS already has a Sky Clock/time-of-day concept.

Do not create two systems that disagree.

Decide on a clean architecture:

### Scroll mode

The homepage visual timeline is controlled by scroll.

### Sky Clock mode

If the existing control allows a user to select a time-of-day theme, it
should remain functional.

If necessary, introduce an internal mode:

``` ts
type SkyMode = "scroll" | "clock";
```

Do not break existing user-facing behavior.

If the user manually selects a theme, the existing theme behavior should
still work.

If the page is in the cinematic scroll experience, scroll progress
should drive the atmosphere.

Document the relationship clearly in code.

------------------------------------------------------------------------

# 24. Accessibility

The atmospheric layers are decorative.

Use:

``` html
aria-hidden="true"
```

where appropriate.

Do not put important information only inside the animated sky.

All important content must remain available as normal DOM text.

Keyboard navigation must continue working.

Chapter rail must remain accessible.

Do not require mouse movement.

------------------------------------------------------------------------

# 25. Debug Mode

During development, add an easy temporary debug option.

For example:

``` ts
const SKY_DEBUG = false;
```

When enabled, show:

``` text
Sky Progress: 0.62
Phase: Golden Hour
Sun: 68%
Moon: 0%
Stars: 0%
```

This can be removed or disabled before final production.

Do not expose debug UI in production.

------------------------------------------------------------------------

# 26. Testing Requirements

After implementation run:

``` bash
npm run check
```

Then run:

``` bash
npm run dev
```

Test:

### Desktop

-   Chrome
-   Edge
-   Firefox

### Mobile

-   Chrome Android
-   Safari iOS if available

Test:

-   scroll down
-   scroll up
-   fast scroll
-   slow scroll
-   touch scroll
-   resize during scroll
-   route navigation
-   reload at top
-   reload at a deep URL
-   reduced motion
-   Reduce effects
-   keyboard navigation

------------------------------------------------------------------------

# 27. Visual QA Checklist

At minimum verify:

### Sunrise

-   [ ] sun visible
-   [ ] horizon glow visible
-   [ ] sky is dark but readable
-   [ ] no abrupt color jump

### Day

-   [ ] sun high
-   [ ] blue sky
-   [ ] clouds visible
-   [ ] text remains readable

### Golden Hour

-   [ ] warm tones increase gradually
-   [ ] sun moves toward horizon
-   [ ] photographs feel warmer

### Sunset

-   [ ] sun reaches horizon
-   [ ] orange/coral/violet transition
-   [ ] clouds become silhouettes
-   [ ] no sudden flash

### Twilight

-   [ ] stars begin appearing
-   [ ] warm tones disappear
-   [ ] blue/violet atmosphere dominates

### Night

-   [ ] moon visible
-   [ ] stars visible
-   [ ] subtle moon halo
-   [ ] closing content readable
-   [ ] no pure-black abrupt transition

------------------------------------------------------------------------

# 28. Important Things NOT To Do

Do NOT:

-   rebuild AERIS from scratch
-   replace the current homepage unnecessarily
-   remove authentication/member routes
-   remove Planner
-   remove Atlas
-   remove existing gallery
-   remove the cursor
-   remove existing chapter rail
-   add a second smooth-scroll library
-   add Framer Motion just for this effect
-   add a huge WebGL scene unnecessarily
-   use a video as the entire background
-   use a giant pre-rendered animation that prevents normal scrolling
-   create fake photography
-   add excessive particles
-   create neon-looking sun/moon graphics
-   make every section full-screen if that harms content
-   break the existing Reduce Effects setting
-   break mobile
-   use React state for every scroll frame
-   leave console errors
-   ignore TypeScript errors
-   finish without running `npm run check`

------------------------------------------------------------------------

# 29. Desired Final Feeling

The final homepage should feel like:

> **You are not scrolling through sections. You are watching one day
> pass across the sky.**

The visitor should gradually experience:

``` text
darkness
   ↓
first light
   ↓
sunrise
   ↓
morning
   ↓
bright day
   ↓
warm afternoon
   ↓
golden hour
   ↓
sunset
   ↓
twilight
   ↓
stars
   ↓
moon
   ↓
night
```

The transitions should be slow, elegant and photographic.

The effect should feel premium because of **timing, composition, light
and restraint**, not because of excessive effects.

------------------------------------------------------------------------

# 30. Implementation Order

Implement in this order.

## Phase 1 --- Audit

Before changing source files:

1.  inspect current homepage
2.  inspect existing chapter system
3.  inspect Lenis
4.  inspect GSAP
5.  inspect atmosphere canvas
6.  inspect Sky Clock
7.  inspect existing cursor
8.  inspect existing reduced-effects setting
9.  identify reusable components
10. write a short audit if needed

Do not duplicate existing functionality.

## Phase 2 --- Master Sky Timeline

Create the central scroll-progress system.

Make sure:

``` text
0 → 1
```

is stable and synchronized with Lenis/ScrollTrigger.

## Phase 3 --- Sun

Implement:

-   sun arc
-   glow
-   sunrise
-   daytime position
-   sunset
-   fade-out

## Phase 4 --- Sky

Implement smooth gradient interpolation.

## Phase 5 --- Clouds

Connect existing atmosphere/cloud layers to the timeline.

## Phase 6 --- Sunset

Build the most cinematic transition:

``` text
day → golden → sunset → twilight
```

## Phase 7 --- Stars + Moon

Implement twilight star reveal and moon rise.

## Phase 8 --- Content Synchronization

Synchronize existing chapter/content reveals with the timeline.

## Phase 9 --- Mobile + Reduced Motion

Tune all responsive and accessibility behavior.

## Phase 10 --- QA

Run:

``` bash
npm run check
```

Fix every error.

Then manually inspect the complete scroll journey.

------------------------------------------------------------------------

# 31. Acceptance Criteria

The implementation is complete only when all are true:

-   [ ] homepage starts around sunrise/pre-dawn
-   [ ] sun visibly rises as the user scrolls
-   [ ] daytime becomes bright naturally
-   [ ] golden hour appears gradually
-   [ ] sun reaches the horizon
-   [ ] sunset colors transition smoothly
-   [ ] twilight appears
-   [ ] stars gradually appear
-   [ ] moon rises
-   [ ] final state is night
-   [ ] scrolling backward reverses the experience naturally
-   [ ] no abrupt background jumps
-   [ ] existing AERIS content remains intact
-   [ ] existing chapter navigation still works
-   [ ] existing Sky Clock behavior is not broken
-   [ ] existing cursor behavior is not broken
-   [ ] Reduce Effects still works
-   [ ] reduced-motion works
-   [ ] mobile works
-   [ ] no horizontal overflow
-   [ ] no console errors
-   [ ] `npm run check` passes
-   [ ] no unnecessary dependency was added
-   [ ] no fake image assets were introduced
-   [ ] animation remains smooth on a normal laptop

------------------------------------------------------------------------

# 32. Final Instruction to Codex

Read this entire file before making changes.

Then inspect the current AERIS implementation and determine which parts
of the existing cinematic chapter system can be reused.

Do not blindly follow the suggested filenames if equivalent components
already exist.

Implement the experience incrementally.

After each major phase:

1.  run `npm run check`
2.  fix TypeScript/lint/build issues
3.  inspect the result in the browser
4.  test scrolling forward and backward
5.  check for visual glitches
6.  continue only after the current phase is stable

The final result should preserve the identity of AERIS while
transforming the homepage into a **continuous sunrise-to-night cinematic
sky journey**.

**Core requirement:**

> Scroll from sunrise → day → golden hour → sunset → twilight → moonlit
> night, with the entire atmosphere, photography, typography and
> celestial elements transitioning together as one coherent experience.
