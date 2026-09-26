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

The gallery is served by the Vite frontend. Member features currently use a local browser adapter in `src/services/memberStore.ts`; there is no remote API, database, email sender, or cross-device account service configured. Passwords are stored as PBKDF2 hashes in browser storage for this local demo, never as plaintext. Use a managed auth provider such as Supabase Auth and a server-side database before accepting real users or private data.

## Member experience routes

- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`
- `/dashboard`, `/favorites`, `/collections`, `/search`, `/notifications`
- `/profile/:username`, `/contact`

Member profiles, favorites, viewed history, notifications, and collections persist in this browser's local storage. Reset tokens are shown on screen for local testing; verification is a demo action. Contact inquiries are not delivered. The browser storage is not a secure substitute for server-side authorization.

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

Photography is currently loaded from Unsplash URLs. Replace these with owned, optimized assets before launch.
