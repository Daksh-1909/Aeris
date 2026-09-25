# AERIS — Moments Above

A premium photography journal for sky, light, clouds and nature, built with React, TypeScript and Vite.

## Project structure

```text
src/
  components/       Shared interface components (header, photo card, lightbox)
  data/             Local editorial gallery records
  sections/         Page-level content sections
  services/         Data access boundary; replace with API implementation later
  types/            Shared TypeScript models
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

Photography is currently loaded from Unsplash URLs. Replace these with owned, optimized assets before launch.
