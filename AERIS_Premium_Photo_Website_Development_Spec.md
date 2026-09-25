# AERIS — Moments Above
## Premium Sky, Cloud & Nature Photography Website
### Complete Phase-by-Phase Development Specification for Antigravity

---

# 0. Brand Identity

## Website Name

**AERIS**

## Official Slogan

**Moments Above.**

## Brand Concept

AERIS is a premium visual photography experience built around the beauty of:

- Sky
- Clouds
- Nature
- Light
- Landscapes
- Sunsets
- Sunrises
- Atmospheric moments

The website should feel like a **luxury digital art gallery**, not a normal photography portfolio.

The visitor should feel as if they are entering a collection of moments captured between the earth and the sky.

### Brand lockup

```text
AERIS

Moments Above.
```

Use the brand name with wide letter spacing and a refined, minimal presentation.

---

# 1. Overall Vision

Build AERIS as a cinematic, immersive photography website.

The experience should combine:

- Luxury editorial design
- Cinematic photography
- Minimal typography
- Smooth scrolling
- High-quality image transitions
- Subtle interaction
- Premium microinteractions
- Optional 3D atmosphere

The website should feel expensive because of:

1. Photography
2. Typography
3. Composition
4. Spacing
5. Motion
6. Interaction
7. Performance

Do NOT attempt to make it expensive-looking by adding random effects everywhere.

---

# 2. Core Design Philosophy

Follow these rules throughout the entire project.

### Rule 1 — Photography comes first

Every design decision should support the photographs.

### Rule 2 — Minimal interface

Avoid unnecessary buttons, cards and UI elements.

### Rule 3 — Large typography

Use large editorial typography for major sections.

### Rule 4 — Generous whitespace

Allow photographs and typography to breathe.

### Rule 5 — Cinematic motion

Animations should feel slow, smooth and intentional.

### Rule 6 — No generic gallery

Do not build a simple:

```text
[IMAGE] [IMAGE] [IMAGE]
[IMAGE] [IMAGE] [IMAGE]
```

gallery as the primary experience.

### Rule 7 — Performance matters

A beautiful website that feels slow is not a premium website.

### Rule 8 — 3D is secondary

Three.js/WebGL should enhance the photography, not dominate it.

---

# 3. Technology Stack

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- GSAP
- GSAP ScrollTrigger
- Lenis
- Three.js
- React Three Fiber
- Drei
- Lucide React

Optional:

- WebGL / GLSL shaders
- Framer Motion only where useful

Do not install unnecessary libraries.

---

# 4. Project Architecture

Use a clean component-based structure.

```text
aeris/
│
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── sky/
│   │   ├── clouds/
│   │   ├── nature/
│   │   └── featured/
│   │
│   └── textures/
│
├── src/
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── CustomCursor.tsx
│   │   ├── Hero.tsx
│   │   ├── ImageReveal.tsx
│   │   ├── GalleryImage.tsx
│   │   ├── GalleryLightbox.tsx
│   │   ├── SectionTitle.tsx
│   │   ├── PageTransition.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── Footer.tsx
│   │
│   ├── sections/
│   │   ├── IntroSection.tsx
│   │   ├── SkySection.tsx
│   │   ├── CloudsSection.tsx
│   │   ├── NatureSection.tsx
│   │   └── ClosingSection.tsx
│   │
│   ├── animations/
│   │   ├── hero.ts
│   │   ├── scroll.ts
│   │   ├── gallery.ts
│   │   └── transitions.ts
│   │
│   ├── data/
│   │   └── gallery.ts
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

Do not put the entire application into `App.tsx`.

---

# 5. Brand Color System

Use a refined monochromatic luxury palette.

```text
Deep Black:     #050505
Warm White:     #F5F3EF
Pure White:     #FFFFFF
Muted Gray:     #8A8A83
Sand:           #D8D3C8
```

Photography should provide the majority of the visual color.

Avoid:

- Neon colors
- Bright UI colors
- Excessive gradients
- Random accent colors

---

# 6. Typography

Use two complementary font families.

## Display Font

Preferred:

**Cormorant Garamond**

Alternative:

**Playfair Display**

## UI Font

Preferred:

**Inter**

Alternative:

**Manrope**

### Typography hierarchy

```text
AERIS
    ↓
Huge editorial headings
    ↓
Section headings
    ↓
Supporting text
    ↓
Metadata
```

Use uppercase text selectively.

Use letter spacing intentionally.

---

# 7. Brand Lockup

Primary:

```text
AERIS
Moments Above.
```

Hero:

```text
AERIS

ABOVE
EVERYTHING
```

Footer:

```text
AERIS
Moments Above.
```

The slogan should remain subtle and elegant.

Do not make the slogan larger than the main photography or hero title.

---

# 8. PHASE 1 — Foundation Setup

## Objective

Create the technical foundation before building visual sections.

### Step 1

Initialize:

```text
React + TypeScript + Vite
```

### Step 2

Configure:

```text
Tailwind CSS
```

### Step 3

Install:

```text
GSAP
Lenis
Three.js
@react-three/fiber
@react-three/drei
Lucide React
```

### Step 4

Create the project structure described above.

### Step 5

Configure global CSS.

### Step 6

Add fonts.

### Step 7

Create CSS variables for the AERIS color system.

### Step 8

Create the base responsive layout.

### Step 9

Initialize Lenis.

### Step 10

Verify:

- Development server works
- Production build works
- No console errors

Do not start advanced animation until this phase is stable.

---

# 9. PHASE 2 — Global Experience

## Objective

Create the global behavior shared by the whole website.

### Step 1 — Smooth scrolling

Initialize Lenis.

Scrolling should feel:

- Smooth
- Natural
- Slightly cinematic

Do not make it excessively slow.

### Step 2 — Global animation setup

Create reusable GSAP utilities.

### Step 3 — Reduced motion

Detect:

```text
prefers-reduced-motion
```

If enabled:

- Reduce parallax
- Disable heavy transitions
- Keep content visible

### Step 4 — Global responsiveness

Define breakpoints for:

- Mobile
- Tablet
- Desktop
- Large desktop

### Step 5 — Global selection and scrollbar styling

Keep them subtle.

---

# 10. PHASE 3 — Loading Experience

## Objective

Create a minimal premium entrance.

Display:

```text
AERIS

Moments Above.
```

Then:

```text
LOADING
```

Use a very subtle progress/line animation.

### Important

The loader must disappear quickly.

Never use a fake long loading sequence.

### Exit animation

```text
loader
   ↓
fade
   ↓
hero image appears
   ↓
hero typography enters
```

---

# 11. PHASE 4 — Navigation

## Objective

Create an elegant minimal navigation system.

Desktop:

```text
AERIS                              MENU
```

Alternative:

```text
AERIS                       SKY  CLOUDS  NATURE
```

Recommended behavior:

- Transparent over hero
- Slightly visible on scroll
- Smooth appearance
- Fixed position
- Minimal height

### Navigation items

```text
Home
Sky
Clouds
Nature
Gallery
About
```

Do not make the navigation visually heavy.

---

# 12. PHASE 5 — Custom Cursor

## Objective

Create a premium desktop-only cursor.

Default:

```text
small circular cursor
```

Image hover:

```text
VIEW
```

Button hover:

```text
→
```

Navigation hover:

```text
subtle magnetic movement
```

### Behavior

Use interpolation for smooth movement.

Do not attach expensive calculations to every mouse event unnecessarily.

### Mobile

Disable custom cursor completely.

Use the normal touch interaction.

---

# 13. PHASE 6 — HERO EXPERIENCE

## Objective

Build the strongest visual section of AERIS.

The hero should immediately communicate:

**AERIS — Moments Above.**

### Layout

```text
┌──────────────────────────────────────────────┐
│ AERIS                                  MENU │
│                                              │
│                                              │
│                    ABOVE                     │
│                  EVERYTHING                  │
│                                              │
│                 Moments Above.               │
│                                              │
│                   ↓ EXPLORE                  │
└──────────────────────────────────────────────┘
```

### Hero image

Use the strongest available photograph.

Requirements:

- Full viewport
- High resolution
- `object-cover`
- Cinematic crop
- Subtle dark overlay
- Very subtle grain

### Hero text

Main:

```text
ABOVE
EVERYTHING
```

Supporting:

```text
Moments Above.
```

Optional supporting line:

```text
A collection of moments
captured between earth and sky.
```

CTA:

```text
EXPLORE
```

---

# 14. PHASE 7 — Hero Animation

## Initial sequence

Animate in this order:

### 1

Hero image appears.

### 2

Image slowly transitions from:

```text
scale(1.08)
```

to:

```text
scale(1)
```

### 3

AERIS navigation appears.

### 4

Main heading fades and moves upward.

### 5

Slogan appears.

### 6

Explore indicator appears.

Keep the complete entrance around 1–2 seconds.

Do not make the visitor wait.

---

# 15. PHASE 8 — Hero Scroll Experience

As the user scrolls:

```text
Hero image
    ↓
slight zoom out
    ↓
content moves upward
    ↓
overlay changes
    ↓
next section appears
```

Use:

- GSAP ScrollTrigger
- Transform
- Opacity
- Clip-path where appropriate

Avoid layout-triggering properties.

The effect should feel like the visitor is moving through the photograph.

---

# 16. PHASE 9 — INTRODUCTION

## Objective

Introduce the philosophy of AERIS.

Suggested content:

```text
MOMENTS IN THE SKY

Every cloud carries a different story.
Every light exists only once.
```

Then:

```text
AERIS is a collection of moments
found above us and around us.
```

### Layout

Use:

- Large whitespace
- One strong photograph
- Large typography
- Small supporting text

### Animation

- Text reveals line-by-line
- Image uses mask reveal
- Very subtle parallax

---

# 17. PHASE 10 — SKY SECTION

## Heading

```text
SKY
```

Supporting line:

```text
A changing canvas above us.
```

Create an editorial photography layout.

Example:

```text
                         SKY

                  01
                 DAWN

        ┌────────────────────────┐
        │                        │
        │        PHOTO           │
        │                        │
        └────────────────────────┘

       The first light of another day.

        [small image]       [image]
```

Avoid standard cards.

Use asymmetric layouts.

---

# 18. PHASE 11 — Sky Image System

Create a reusable image component.

Example:

```tsx
<GalleryImage
  image="/images/sky/dawn.jpg"
  title="Dawn"
  category="Sky"
/>
```

Each image should support:

- Reveal
- Hover
- Parallax
- Caption
- Metadata
- Lightbox

---

# 19. PHASE 12 — Image Reveal System

Create:

```text
<ImageReveal />
```

Animation:

```text
image hidden
     ↓
mask opens
     ↓
image scales 1.05 → 1
     ↓
optional blur → sharp
```

Props:

```ts
image
alt
direction
duration
delay
parallax
```

Keep this reusable across all sections.

---

# 20. PHASE 13 — CLOUDS SECTION

## Objective

Make Clouds the most atmospheric section.

Heading:

```text
CLOUDS
```

Supporting text:

```text
Somewhere between
earth and infinity.
```

Use one huge immersive photograph.

Then introduce a horizontal gallery.

---

# 21. PHASE 14 — Horizontal Cloud Gallery

Desktop:

```text
←      IMAGE      IMAGE      IMAGE      IMAGE      →
```

Use vertical scrolling to control horizontal movement.

Technology:

```text
GSAP ScrollTrigger
```

Behavior:

- Gallery enters
- Horizontal movement begins
- Images move smoothly
- Center image becomes dominant
- Side images remain partially visible
- Horizontal movement ends naturally
- Normal vertical scrolling resumes

Do not trap the visitor.

---

# 22. PHASE 15 — CLOUD IMAGE INTERACTIONS

On hover:

- Slight scale
- Cursor changes to VIEW
- Caption appears
- Optional subtle overlay

Avoid aggressive effects.

The photograph should remain clear.

---

# 23. PHASE 16 — NATURE SECTION

## Objective

Create a visual contrast with the sky and cloud sections.

Heading:

```text
NATURE
```

Supporting line:

```text
Where the sky
meets the earth.
```

Use:

- Mountains
- Trees
- Water
- Fields
- Landscapes
- Sunlight
- Natural textures

---

# 24. PHASE 17 — Nature Layout

Suggested composition:

```text
                 NATURE

        ┌────────────────────────┐
        │                        │
        │       LARGE IMAGE      │
        │                        │
        └────────────────────────┘

      [small image]      [image]

             EARTH / SKY
```

Use large photography and asymmetric positioning.

---

# 25. PHASE 18 — GALLERY DATA SYSTEM

Create:

```text
src/data/gallery.ts
```

Example:

```ts
export const gallery = [
  {
    id: 1,
    category: "sky",
    title: "Dawn",
    image: "/images/sky/dawn.jpg",
    description: "The first light of another day.",
    metadata: "06:12 AM"
  },
  {
    id: 2,
    category: "clouds",
    title: "Drifting",
    image: "/images/clouds/drifting.jpg",
    description: "Somewhere between earth and infinity.",
    metadata: "Cloud Study"
  }
];
```

All gallery components should use this data.

Do not hard-code individual gallery layouts unnecessarily.

---

# 26. PHASE 19 — FULLSCREEN LIGHTBOX

Clicking an image should open an immersive viewer.

Layout:

```text
┌─────────────────────────────────────────────┐
│                                         ×   │
│                                             │
│                                             │
│                 LARGE IMAGE                 │
│                                             │
│                                             │
│       ←                             →       │
│                                             │
│  SKY / 01 / DAWN                            │
└─────────────────────────────────────────────┘
```

Features:

- Fullscreen image
- Previous
- Next
- Escape
- Keyboard navigation
- Image title
- Category
- Metadata
- Smooth open
- Smooth close

The viewer must feel like part of AERIS.

---

# 27. PHASE 20 — CINEMATIC TRANSITIONS

Create premium image/page transitions.

Possible sequence:

```text
Current image
      ↓
slight scale
      ↓
blur
      ↓
dark overlay
      ↓
new image
      ↓
sharp focus
```

Use these transitions only for major navigation or gallery changes.

Do not make every click trigger a dramatic transition.

---

# 28. PHASE 21 — FILM GRAIN

Add extremely subtle film grain.

Requirements:

- Very low opacity
- Fixed layer
- `pointer-events: none`
- No readability problems
- No significant performance impact

The grain should be barely noticeable.

---

# 29. PHASE 22 — MICROINTERACTIONS

Implement subtle interactions.

## Explore button

Arrow shifts slightly.

## Navigation

Opacity / underline transition.

## Images

Slight zoom.

## Cursor

Smoothly changes size.

## Gallery arrows

Small movement on hover.

Do not over-animate.

---

# 30. PHASE 23 — OPTIONAL THREE.JS ATMOSPHERE

Only add after the main website is already polished.

Possible elements:

- Tiny floating particles
- Atmospheric depth
- Very subtle cloud particles
- Slow camera movement
- Layered depth

The 3D experience should remain subtle.

Do NOT turn AERIS into a 3D game.

Photography remains the primary visual.

---

# 31. PHASE 24 — OPTIONAL WEBGL TRANSITION

If performance allows, create one signature image transition.

Example:

```text
IMAGE A
   ↓
liquid distortion
   ↓
soft blur
   ↓
IMAGE B
```

Use a shader for selected transitions only.

Provide a fallback for:

- Mobile
- Low-power devices
- WebGL unsupported browsers

---

# 32. PHASE 25 — CLOSING EXPERIENCE

Near the end of the page:

```text
MORE THAN A PHOTO

A collection of moments
that existed only once.
```

Then show a large final photograph.

CTA:

```text
EXPLORE AGAIN
```

or:

```text
ENTER THE GALLERY
```

---

# 33. PHASE 26 — FOOTER

Keep the footer minimal.

```text
AERIS

Moments Above.

Instagram
Gallery
About

© 2026
```

No huge footer grids.

---

# 34. PHASE 27 — MOBILE EXPERIENCE

Mobile must be designed intentionally.

Do not simply shrink the desktop version.

### Disable on mobile where appropriate

- Custom cursor
- Heavy WebGL
- Excessive parallax
- Complex horizontal scrolling

### Mobile layout

```text
IMAGE

SKY

TEXT

IMAGE

IMAGE

CLOUDS

IMAGE

NATURE
```

Use vertical galleries where necessary.

Maintain the same brand feeling.

---

# 35. PHASE 28 — Responsive Typography

Use responsive typography.

Hero should remain dramatic but never overflow.

Use techniques such as:

```css
clamp()
```

for large headings.

Test:

- Small phones
- Large phones
- Tablets
- Laptops
- Desktop monitors
- Large displays

---

# 36. PHASE 29 — Accessibility

Implement:

- Semantic HTML
- Correct heading hierarchy
- Image alt text
- Keyboard navigation
- Focus states
- Accessible buttons
- Escape key for lightbox
- Reduced motion

All visual interactions must have functional alternatives.

---

# 37. PHASE 30 — IMAGE OPTIMIZATION

Photography will be the largest performance factor.

Use:

- AVIF where supported
- WebP fallback
- Responsive image sizes
- Lazy loading
- Correct dimensions
- Compressed assets

Suggested variants:

```text
thumbnail
medium
large
hero
```

Hero:

```text
loading="eager"
fetchpriority="high"
```

Other images:

```text
loading="lazy"
decoding="async"
```

---

# 38. PHASE 31 — PERFORMANCE OPTIMIZATION

Target:

- Smooth scrolling
- Stable animations
- Minimal layout shifts
- Fast initial load
- No unnecessary JavaScript
- GPU-friendly animations

Prefer:

```text
transform
opacity
clip-path
```

Avoid constantly animating:

```text
width
height
top
left
margin
```

Use browser performance tools to identify bottlenecks.

---

# 39. PHASE 32 — Error Handling

If an image fails:

- Keep layout intact
- Display a subtle fallback
- Avoid broken-image icons dominating the page

If gallery data is empty:

```text
No moments available.
```

No page should completely break because one photograph is unavailable.

---

# 40. PHASE 33 — Code Quality

Requirements:

- TypeScript
- Reusable components
- Reusable animation utilities
- Data-driven gallery
- Clean naming
- Small focused components
- No unnecessary duplication
- No giant components

Use GSAP context and proper cleanup.

Prevent memory leaks.

---

# 41. PHASE 34 — TESTING AFTER EACH PHASE

After completing EVERY phase:

### 1. Run development server.

### 2. Check browser console.

There should be no new errors.

### 3. Check desktop.

### 4. Check mobile.

### 5. Check navigation.

### 6. Check animations.

### 7. Check image loading.

### 8. Check previous functionality.

Do not continue if the current phase is broken.

---

# 42. PHASE 35 — FINAL VISUAL POLISH

Perform a complete visual review.

Check:

### Typography

- Font pairing
- Font sizes
- Letter spacing
- Line height

### Layout

- Whitespace
- Alignment
- Image crops
- Section spacing

### Motion

- Animation speed
- Scroll smoothness
- Transition timing
- Parallax intensity

### Interaction

- Cursor
- Buttons
- Navigation
- Gallery
- Lightbox

Remove any animation that feels unnecessary.

---

# 43. FINAL AERIS HOMEPAGE STRUCTURE

The final homepage should approximately follow:

```text
┌─────────────────────────────────────────────┐
│                                             │
│ AERIS                                 MENU │
│                                             │
│                                             │
│              ABOVE                          │
│            EVERYTHING                       │
│                                             │
│             Moments Above.                 │
│                                             │
│                ↓ EXPLORE                   │
│                                             │
└─────────────────────────────────────────────┘

                    ↓

             MOMENTS IN THE SKY

        Every cloud carries a different story.
        Every light exists only once.

                 [PHOTO]

                    ↓

                     SKY

              [ LARGE PHOTO ]

                  DAWN

         [PHOTO]        [PHOTO]

                    ↓

                   CLOUDS

      Somewhere between earth and infinity.

       ← [PHOTO] [PHOTO] [PHOTO] →

                    ↓

                   NATURE

              [ LARGE PHOTO ]

                EARTH / SKY

             [PHOTO] [PHOTO]

                    ↓

             MORE THAN A PHOTO

          A collection of moments
            that existed only once.

                 [EXPLORE]

                    ↓

                   AERIS
               Moments Above.
```

---

# 44. Recommended Development Timeline

Do not rush directly into advanced effects.

### Phase Group A — Foundation

```text
Phase 1  Foundation
Phase 2  Global Experience
Phase 3  Loading
```

### Phase Group B — Core Website

```text
Phase 4  Navigation
Phase 5  Cursor
Phase 6  Hero
Phase 7  Hero Animation
Phase 8  Hero Scroll
Phase 9  Introduction
```

### Phase Group C — Photography Experience

```text
Phase 10  Sky
Phase 11  Sky Image System
Phase 12  Image Reveal
Phase 13  Clouds
Phase 14  Horizontal Gallery
Phase 15  Cloud Interactions
Phase 16  Nature
Phase 17  Nature Layout
```

### Phase Group D — Gallery

```text
Phase 18  Gallery Data
Phase 19  Lightbox
Phase 20  Cinematic Transitions
Phase 21  Film Grain
Phase 22  Microinteractions
```

### Phase Group E — Advanced Experience

```text
Phase 23  Three.js Atmosphere
Phase 24  WebGL Transition
Phase 25  Closing Experience
Phase 26  Footer
```

### Phase Group F — Production

```text
Phase 27  Mobile
Phase 28  Responsive Typography
Phase 29  Accessibility
Phase 30  Image Optimization
Phase 31  Performance
Phase 32  Error Handling
Phase 33  Code Quality
Phase 34  Testing
Phase 35  Final Polish
```

---

# 45. Final Quality Checklist

Before declaring AERIS complete:

## Brand

- [ ] AERIS appears consistently
- [ ] Slogan is `Moments Above.`
- [ ] Branding is minimal
- [ ] Typography feels premium

## Hero

- [ ] Full-screen photography
- [ ] Cinematic animation
- [ ] Strong typography
- [ ] Explore interaction
- [ ] Smooth scroll transition

## Photography

- [ ] Sky section
- [ ] Clouds section
- [ ] Nature section
- [ ] Asymmetric layouts
- [ ] Image reveals
- [ ] Image hover interactions
- [ ] Fullscreen viewer

## Motion

- [ ] Lenis
- [ ] GSAP
- [ ] ScrollTrigger
- [ ] Parallax
- [ ] Cinematic transitions
- [ ] Reduced-motion support

## Advanced

- [ ] Custom cursor
- [ ] Film grain
- [ ] Optional Three.js atmosphere
- [ ] Optional WebGL transition

## Mobile

- [ ] Responsive
- [ ] Touch friendly
- [ ] No broken horizontal scrolling
- [ ] Heavy effects reduced
- [ ] Typography fits correctly

## Technical

- [ ] TypeScript
- [ ] Clean component architecture
- [ ] Optimized images
- [ ] Lazy loading
- [ ] No console errors
- [ ] Production build works
- [ ] Good performance

---

# 46. Most Important Design Rule

AERIS must still look beautiful when advanced effects are disabled.

The priority is:

```text
PHOTOGRAPHY
      ↓
TYPOGRAPHY
      ↓
LAYOUT
      ↓
SPACING
      ↓
MOTION
      ↓
INTERACTION
      ↓
3D / WEBGL
```

Never reverse this order.

Do not use advanced technology simply because it is available.

Every effect must improve the experience.

---

# 47. Final Instruction to Antigravity

Build AERIS **phase by phase**.

Do not generate the entire project as one giant implementation.

For every phase:

1. Implement only that phase.
2. Run the project.
3. Test the phase.
4. Fix errors.
5. Check desktop.
6. Check mobile.
7. Confirm the previous phases still work.
8. Then continue.

The final product should feel like a **premium cinematic photography gallery and digital art experience**.

It should not look like:

- A template
- A generic portfolio
- A Bootstrap gallery
- A simple masonry gallery
- A UI demo
- A collection of random animation effects

It should feel like:

```text
AERIS

Moments Above.
```

A quiet, cinematic journey through the sky, clouds and nature.
