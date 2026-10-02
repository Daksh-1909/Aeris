# AERIS — Read the Sky

AERIS is a sky journal and shooting companion. It helps people look at sky photography, learn what clouds and light can tell them, and plan to go make photographs of their own. The three jobs are **Look** (experience the gallery), **Learn** (understand the sky), and **Go** (plan a shoot).

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

The gallery is served by the Vite frontend. When Supabase is not configured, member features run in clearly labeled Demo Mode and stay in this browser. Demo Mode uses derived password hashes, but it is not a secure account system; recovery, verification, and inquiry delivery are unavailable. Set the Supabase URL and publishable key to enable Supabase Auth plus remote member storage. The database, inquiry Edge Function and setup steps are in [BACKEND_SETUP.md](./BACKEND_SETUP.md). Do not use local demo accounts for real users or sensitive data.

## Member experience routes

- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/dashboard`, `/favorites`, `/collections`, `/search`, `/notifications`
- `/profile/:username`, `/contact`
- `/atlas`, `/atlas/:type` (offline cloud field guide and identifier)
- `/planner` (planned next feature)

Member profiles, favorites, viewed history, notifications, and collections persist in this browser's local storage in Demo Mode. Contact submissions show an honest “message not sent” status in Demo Mode. Configure the trusted inquiry backend before collecting real requests.

## Source organization

```text
src/
  components/       Shared interface, route experience, and error boundary
  services/         Gallery access and browser-local member data adapter
  data/             Editorial photo records
  sections/         Home page editorial sections
  types/            Shared gallery types
```

## Development

```sh
npm install
npm run dev
```

Production build: `npm run build`
Quality check (lint and production build): `npm run check`

Use [QA_CHECKLIST.md](./QA_CHECKLIST.md) for desktop, mobile, keyboard, animation, and image checks.

TypeScript is configured in strict mode; `npm run build` runs the type check before bundling.

Gallery photography currently uses remote Unsplash image URLs. The repository does not contain owned replacements yet; supply licensed/owned source images before migrating the responsive gallery to local AVIF/WebP assets.
