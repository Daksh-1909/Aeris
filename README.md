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

The site starts in Dusk, Daylight, or Auto (follows the operating-system appearance setting); choose the color theme in the home header. The separate Sky Clock control continues to set its time-of-day treatment. Fine-pointer desktop users get the decorative cloud-light cursor; it stays off for touch and reduced-motion preferences. The AERIS cloud-at-dawn favicon is `public/favicon.svg`, with a matching `public/apple-touch-icon.png` for iOS home-screen links.

## Cinematic chapter journey

The home page follows five scroll chapters: **Dawn**, **Midday**, **Golden Hour**, **Dusk**, and **Night**. One master GSAP timeline maps homepage scroll progress from pre-dawn through sunrise, morning, day, afternoon, golden hour, sunset, twilight, and night. It continuously shifts the sky gradient, sun arc and glow, cloud highlights, horizon haze, star field, and moon; the chapter rail stays at its five accessible stops. The scroll timeline and the user controlled Sky Clock are independent: the Clock continues to set its header indicator and theme preference, while the homepage atmosphere follows scroll. The desktop cursor adds a chapter-colored light trail and ambient spotlight; both are disabled on touch and reduced motion. Use **Reduce effects** in the footer to turn off Lenis, cursor effects, drifting clouds, and image parallax; the choice is saved in this browser. In development, add `?skyDebug=1` to show current timeline progress. The timeline and chapter mapping live in `src/components/SkyTimeline.tsx` and presentation styles live in `src/components/skyTimeline.css` and `src/ui-polish.css`.
