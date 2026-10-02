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
- `/welcome` (first-signup setup; skippable)
- `/photo/:id` (shareable detail and print/licensing inquiry)
- `/admin/inquiries` (Supabase admin role required; enforced by RLS)
- `/atlas`, `/atlas/:type` (offline cloud field guide and identifier)
- `/planner` (local sun/moon times, city search, geolocation, saved shoot spots)
- Sky Clock theme controls and a deterministic Daily Sky feature appear on the home page.

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

Gallery photography is served from local responsive WebP files in `public/images/`, with 480, 960, and 1600 pixel variants and `srcset` selection. These are self-hosted Unsplash demo copies, not AERIS-owned photographs; replace them with studio-owned or separately licensed photographs and verified photographer credits before launch.
