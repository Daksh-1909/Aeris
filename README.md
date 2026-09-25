# AERIS — Moments Above

A premium photography journal for sky, light, clouds and nature, built with React, TypeScript and Vite.

## Project structure

```text
src/
  animations/       Reusable GSAP and scroll utilities
  components/       Shared interface and image components
  data/             Editorial gallery records and image URL helpers
  hooks/            Shared gallery loading state
  sections/         Page-level content sections
  services/         Gallery data access boundary
  types/            Shared TypeScript models and handlers
  App.tsx           Page composition and top-level UI state
  index.css         Global styles and responsive visual system
```

## Frontend and backend boundary

The current project is a frontend-only Vite app; no server or API exists yet. Gallery content is accessed through `src/services/galleryService.ts`, which currently returns local records from `src/data/gallery.ts`. This keeps UI components independent from the storage choice and provides a clear place to connect a backend when its requirements are known.

## Development

```sh
npm install
npm run dev
```

Production build: `npm run build`
Quality check (lint and production build): `npm run check`

Use [QA_CHECKLIST.md](./QA_CHECKLIST.md) for desktop, mobile, keyboard, animation, and image checks.

TypeScript is configured in strict mode; `npm run build` runs the type check before bundling.

Photography is currently loaded from Unsplash URLs. Replace these with owned, optimized assets before launch.
