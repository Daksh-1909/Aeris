# AERIS — Improvement Plan (for VS Code + Codex)

## Progress ledger

- Phase 1: demo auth/contact honesty, inquiry migration and Edge Function, core concept copy, metadata, friendly 404 and docs are implemented; `npm.cmd run check` passes. Owned responsive photo files are still needed before removing existing Unsplash URLs.
- Phase 2: navigation links, active member route styling, URL-backed debounced search, lightbox swipe/preload, protected loading and retry states implemented; `npm.cmd run check` passes. Focused browser and assistive technology review remains.
- Phase 3 / Feature A: offline Cloud Atlas, per-photo cloud tags, field notes and four-question identifier implemented; `npm.cmd run check` passes.
- Phase 4 onward: in progress.

> **How to use this file:** Place it in the repo root. Tell Codex:
> *"Read `AERIS_IMPROVEMENT_PLAN.md` fully. Work phase by phase. Finish and verify one phase before starting the next. After every phase run `npm run check` and fix all errors."*

---

## 0. Context (read first)

**Project:** AERIS — Moments Above. A premium photography journal about sky, light, clouds and nature.

**Stack:** React, TypeScript (strict), Vite, Tailwind CSS, GSAP. Optional Supabase for auth and storage.

**Existing structure:**

```
src/
  animations/   GSAP + scroll utilities
  components/   shared UI, image components, error boundary
  data/         editorial gallery records + image URL helpers
  hooks/        gallery loading state
  sections/     home page sections
  services/     gallery access + browser-local member adapter
  types/        shared TS models
  App.tsx       page composition + top-level UI state
  index.css     global styles
```

**Existing routes:** `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/dashboard`, `/favorites`, `/collections`, `/search`, `/notifications`, `/profile/:username`, `/contact`.

**Known weaknesses (confirmed from README):**
1. Photos load from Unsplash URLs, so the site has no owned content.
2. Without Supabase, member data lives in `localStorage`, which is not secure.
3. Reset tokens are shown on screen, and email verification is a fake demo action.
4. Contact form inquiries are **not delivered** anywhere.
5. The site is a beautiful gallery, but the purpose of the member features is unclear.

---

## 1. The Core Concept (fix the "why")

Right now AERIS is "a nice photo website with login." That is not a concept. Redefine it as:

> **AERIS is a sky journal and shooting companion. It helps people understand the sky (what clouds they are looking at, why the light looks the way it does) and helps them photograph it (when to go, where to go, what to expect).**

Every page and feature should serve one of these three jobs:

| Job | Meaning |
|---|---|
| **Look** | Experience beautiful, cinematic sky photography |
| **Learn** | Understand clouds, light and weather behind each photo |
| **Go** | Plan the next shoot (golden hour, sky conditions, saved spots) |

**Task for Codex:** Rewrite the hero copy, the README intro, and the `<title>`/meta description to reflect this concept. Add a short "What is AERIS" section on the home page that states Look / Learn / Go in plain language. Remove or rename any section that does not fit one of the three jobs.

---

## 2. Phase 1: Critical Fixes (do these first)

### 2.1 Replace fake auth behavior
- **Problem:** Reset tokens shown on screen, fake email verification, `localStorage` passwords.
- **Fix:**
  - When Supabase env vars are present, use Supabase Auth only (sign up, login, password reset, email verification via real emails).
  - When Supabase is **not** configured, run in clearly labeled **"Demo Mode"**: show a visible banner ("Demo mode — data stays in this browser only"), and never store raw passwords (store a hash or skip passwords entirely in demo mode).
  - Gate any on-screen reset token behind `import.meta.env.DEV` so it can never appear in production.
- **Done when:** a production build never displays tokens, and the demo banner is visible when Supabase is off.

### 2.2 Make the contact form real
- **Problem:** Inquiries go nowhere.
- **Fix:** Store inquiries in a Supabase `inquiries` table (name, email, type, message, created_at, status) and send an email notification via a Supabase Edge Function + Resend (or similar free tier). In demo mode, show an honest message: "Demo mode — message not sent." Add basic spam protection (honeypot field + simple rate limit).
- **Done when:** submitting the form creates a DB row and a notification email with Supabase configured, and shows an honest message without it.

### 2.3 Replace Unsplash dependency
- **Problem:** Hot-linked Unsplash URLs can break, are slow, and aren't owned.
- **Fix:**
  - Move images to `public/images/` (or Supabase Storage) in 3 sizes: `480w`, `960w`, `1600w`, in WebP/AVIF.
  - Use `<picture>` + `srcset` + `sizes` and `loading="lazy"` (except the hero image, which should use `fetchpriority="high"`).
  - Add a tiny blurred placeholder (LQIP or dominant-color background) to each image to avoid layout shift.
  - Add a `credit` field to each gallery record and show photographer credit where required.
- **Done when:** no `images.unsplash.com` URLs remain in `src/`, and Lighthouse shows no layout-shift warnings from images.

### 2.4 Error and empty states
- Every route needs a **loading state**, an **empty state** (e.g., "No favorites yet — tap the heart on any photo") and an **error state** with a retry button.
- Add a proper **404 page** with a link home.
- Make sure the existing error boundary shows a friendly message, not a stack trace.

---

## 3. Phase 2: User Experience Improvements

### 3.1 Navigation and clarity
- Add a persistent top nav: **Gallery · Cloud Atlas · Planner · Collections**, plus a profile/login button. Highlight the active route.
- Add breadcrumbs or a clear back button on photo detail views.
- On mobile, use a bottom or slide-in menu with 44px minimum touch targets.

### 3.2 Photo viewing experience
- Build a **full-screen lightbox** with: keyboard arrows, Esc to close, swipe on mobile, pinch/zoom, and focus trapping.
- Preload the next and previous images.
- Show an **info panel** per photo: title, location, time of day, camera settings, cloud type (feeds the new features below), and a "Save to collection" button.
- Deep-link every photo (`/photo/:id`) so it can be shared, and set Open Graph tags for social previews.

### 3.3 Search and filtering
- Filters: time of day, cloud type, season, mood/color, location. Show active filters as removable chips.
- Debounce the search input (250 ms) and persist filters in the URL query string so refresh/back/share keeps them.

### 3.4 Onboarding
- After the first signup, show a 3-step welcome: pick interests (golden hour, storms, night sky, clouds), set an optional home location (used by the Planner), and follow a starter collection. Allow skipping.

### 3.5 Performance
- Code-split routes with `React.lazy` + `Suspense`.
- Initialize GSAP/ScrollTrigger only where needed and **kill triggers on unmount** to prevent leaks.
- Respect `prefers-reduced-motion`: disable parallax and heavy scroll animation, and use simple fades.
- Target Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 on mobile.

### 3.6 Accessibility (non-negotiable)
- Meaningful `alt` text on every image (describe the sky, not just "photo").
- Visible focus rings, correct heading order, semantic landmarks (`header`, `nav`, `main`, `footer`).
- Colour contrast ≥ 4.5:1 for body text, including text over images (add a subtle gradient scrim).
- All interactive elements keyboard-reachable; modals trap focus and restore it on close.

---

## 4. Phase 3: New Meaningful Features

Each feature below has a clear purpose, scope, data model and acceptance criteria. Build them in this order.

---

### Feature A — Cloud Atlas (Learn)

**Why it matters:** Turns the gallery from "pretty pictures" into something educational. People can finally identify the clouds they see.

**What to build:**
- New route `/atlas` listing the main cloud types (cumulus, stratus, cirrus, cumulonimbus, altocumulus, stratocumulus, nimbostratus, lenticular, mammatus, etc.).
- Each cloud type page (`/atlas/:type`) shows: a plain-language description, typical altitude, what weather it usually signals, best photography tips, and **all gallery photos tagged with that cloud type**.
- Add a **"What cloud is this?" mini quiz/identifier**: 3–4 simple questions (height in sky, shape, color, weather) that suggest the likely cloud type.
- On every photo, show the cloud type as a clickable tag that jumps to the Atlas.

**Data model (add to `src/types` and `src/data`):**
```ts
type CloudType = 'cumulus' | 'stratus' | 'cirrus' | 'cumulonimbus' | 'altocumulus' | 'stratocumulus' | 'nimbostratus' | 'lenticular' | 'mammatus' | 'clear';

interface CloudInfo {
  type: CloudType;
  name: string;
  altitude: 'low' | 'mid' | 'high';
  description: string;
  weatherSignal: string;
  photoTip: string;
}
// Add to each gallery record:
// cloudType?: CloudType;
```

**Acceptance criteria:** every gallery photo has a `cloudType`; the Atlas works offline (static data); the identifier returns a result with at least one matching photo.

---

### Feature B — Golden Hour & Shoot Planner (Go)

**Why it matters:** This is real utility. Photographers constantly need to know when the light will be good.

**What to build:**
- New route `/planner`. User allows geolocation **or** types a city (store in profile, optional).
- Using the **`suncalc`** npm package (no API key, calculated locally), show today's: sunrise, sunset, golden hour start/end, blue hour, solar noon, and moon phase/rise/set.
- Show a simple visual **day timeline** (a horizontal bar with colored zones for night / blue hour / golden hour / day).
- Let users **save shoot spots** (name, lat/lng, notes) and see golden hour times for each saved spot.
- Add a "Remind me" toggle that creates an in-app notification 1 hour before golden hour for a saved spot (use the existing notifications system; real push is out of scope).
- Handle denied geolocation gracefully (manual city entry fallback; never block the page).

**Data model:**
```ts
interface ShootSpot {
  id: string;
  userId: string;
  name: string;
  lat: number;
  lng: number;
  notes?: string;
  createdAt: string;
}
```

**Supabase:** add a `shoot_spots` table with RLS (users can only read/write their own rows). Local adapter fallback in demo mode.

**Acceptance criteria:** correct times for a known location verified against a trusted source; works with no login (spots saving requires login); timezone shown correctly; no crash when location is denied.

---

### Feature C — Sky Clock (adaptive experience) + Daily Sky (Look)

**Why it matters:** It ties the website's identity to its subject, because the site itself reflects the sky.

**What to build:**
- **Sky Clock theme:** the site's accent colors and hero overlay gently shift based on the visitor's local time of day (dawn, day, golden hour, dusk, night), using CSS variables defined in `index.css`. Reuse `suncalc` logic from Feature B when a location is known, otherwise fall back to fixed hour ranges.
- A small header indicator ("Golden hour now" / "Night sky") that links to the Planner.
- **Daily Sky:** one featured photo per day on the home page, chosen deterministically from the gallery (e.g., hash of the date), with its story/caption. Include a "Previous days" archive of the last 7.
- Add a manual override toggle (Auto / Day / Night) so users stay in control, and respect `prefers-reduced-motion` and `prefers-color-scheme`.

**Acceptance criteria:** no flash of wrong theme on load; text contrast stays ≥ 4.5:1 in every sky state; the same photo shows for the same date on every visit.

---

### Feature D — Print & Licensing Requests (turn the site into a working studio)

**Why it matters:** It gives the project a real purpose beyond browsing. A photographer can receive actual requests, and a visitor can ask for a specific photo.

**What to build:**
- On each photo's detail page, add **"Request a print"** and **"License this photo"** buttons that open a short form pre-filled with that photo's ID and title.
- Fields: name, email, purpose (print / personal / commercial), size or usage, message.
- Submissions go through the same pipeline as the fixed contact form (Section 2.2), stored in `inquiries` with `photo_id` and `type`.
- Add a simple protected **`/admin/inquiries`** page (admin role only) to list, filter by status (new / replied / closed) and mark inquiries.
- Add admin-only role via Supabase (`profiles.role = 'admin'`), enforced with **RLS**, not just a UI check.

**Acceptance criteria:** a request from a photo page arrives in the admin list with the right photo attached; non-admins cannot read inquiries (verify by testing with a normal account); form validates email and shows success/failure honestly.

---

## 5. Security and Data Rules

- Never trust client-side checks for admin or ownership. Use Supabase **Row Level Security** on every table: `profiles`, `favorites`, `collections`, `history`, `notifications`, `shoot_spots`, `inquiries`.
- Never commit `.env`. Keep `.env.example` updated with every new variable.
- Only expose the Supabase **publishable/anon** key to the browser. No service keys in the frontend.
- Sanitize and validate all form input (use `zod` for schemas).
- Add basic rate limiting on inquiry submission.
- Update `BACKEND_SETUP.md` with every new table, policy and Edge Function.

---

## 6. Code Quality Rules for Codex

- Keep TypeScript **strict**; no `any` unless justified with a comment.
- Keep the existing folder boundaries. Data access goes in `services/`, not inside components.
- New features get their own folder under `src/features/<name>/` (components, hooks, types) and register routes in one place.
- Small, reusable components; no file over ~300 lines.
- After each phase run:
  ```bash
  npm run check
  ```
  and fix every lint/type/build error before continuing.
- Update `QA_CHECKLIST.md` with test steps for each new feature.
- Update `README.md` with the new concept, features, routes and setup steps.
- Make small, descriptive commits per task (e.g., `feat(planner): add golden hour timeline`).

---

## 7. Suggested Order of Work

| Phase | Tasks | Result |
|---|---|---|
| 1 | Sections 2.1 to 2.4 | Honest, secure, shippable foundation |
| 2 | Sections 3.1 to 3.6 | Smooth, accessible, fast UX |
| 3 | Feature A (Cloud Atlas) | Educational depth |
| 4 | Feature B (Planner) | Real daily utility |
| 5 | Feature C (Sky Clock + Daily Sky) | Identity and delight |
| 6 | Feature D (Print and Licensing) | Real-world purpose |
| 7 | Final QA, Lighthouse, README update | Launch ready |

---

## 8. Final Definition of Done

- [ ] No Unsplash hot-links; all images owned, responsive, lazy-loaded
- [ ] No fake auth in production; demo mode is clearly labeled
- [ ] Contact and print/license requests are actually delivered and stored
- [ ] Cloud Atlas, Planner, Sky Clock + Daily Sky, and Print/License all working
- [ ] RLS enabled and tested on every Supabase table
- [ ] Lighthouse mobile: Performance ≥ 90, Accessibility ≥ 95
- [ ] Keyboard-only and screen-reader pass on main flows
- [ ] `npm run check` passes with zero errors
- [ ] README and `BACKEND_SETUP.md` updated and accurate

---

## 9. First Prompt to Give Codex

```
Read AERIS_IMPROVEMENT_PLAN.md completely. First, audit the current codebase
against Sections 1 to 3 and list what already exists and what is missing.
Do not change any code yet. Then propose a task list for Phase 1 and wait
for my approval before editing files.
```
