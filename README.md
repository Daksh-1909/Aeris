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
  sky/              Shared sky palette and scroll timeline
  sky-journey/       Journey scenes, sticky stage, and Three.js layers
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

Fine-pointer desktop users get the decorative cloud-light cursor; it stays off for touch and reduced-motion preferences. The AERIS cloud-at-dawn favicon is `public/favicon.svg`, with a matching `public/apple-touch-icon.png` for iOS home-screen links.

## Sky Journey V2

The homepage opens on Sunrise and scrolls through four scenes: Sunrise (05:48), Noon (12:10), Sunset (17:52), and Night (22:30). One sticky stage follows normalized scroll progress from `0` to `1`; the accessible time rail links to each scene. Text is DOM content and moves only vertically as it fades. The rest of the homepage continues on a deep night background.

The shared palette and sun keyframes are in [`src/sky/timeline.ts`](./src/sky/timeline.ts). `sample(progress)` clamps progress to `0..1` and smoothly interpolates the sky, text, cloud brightness, stars, and sun path. Scene copy, fade ranges, and rail stop positions are in [`src/sky-journey/scenes.ts`](./src/sky-journey/scenes.ts). During development, `/?p=0.42` freezes the journey at a point; edit `skyKeyframes` and `sunKeyframes` to tune colors and sun position.

The stage first paints a CSS sky, then lazily loads the Three.js canvas. The canvas is decorative and `aria-hidden`; scene headings, copy, rail buttons, and links remain HTML. A static CSS presentation is used when WebGL is unavailable, Reduce effects is enabled, or the operating system requests reduced motion.

### Rendering quality

| Tier | DPR cap | Stars (tiny / medium / bright) | Clouds across 3 layers |
| --- | ---: | ---: | ---: |
| High | 2 | 2500 / 500 / 40 | 6 / 6 / 7 |
| Medium | 1.5 | 1600 / 380 / 20 | 5 / 5 / 5 |
| Low | 1.25 | 960 / 224 / 16 | 3 / 3 / 4 |
| Static | — | — | No WebGL canvas |

The initial tier uses viewport width and hardware memory/core hints. If frame intervals or render time remain above 22 ms over a 45-frame sample, the renderer steps down a tier; it does not automatically step back up. Rendering pauses while the document is hidden. Reduced-motion and Reduce effects modes disable the WebGL presentation; shooting stars are disabled there as well.

### Assets and screenshots

Cloud sprites are `public/3d/clouds/cloud_1.webp` through `cloud_4.webp`. The moon uses `public/3d/moon_color_2k.webp` and `public/3d/moon_bump_2k.webp`; the optional 4K color map is `public/3d/moon_color_4k.webp`. No 8000×4000 moon texture is shipped. The footer credits the moon map to NASA Scientific Visualization Studio (CGI Moon Kit). Local responsive gallery WebP assets are in `public/images/`; they are demo copies and need verified licensing/photographer credits before launch.

Run `npm run check` for lint, TypeScript, and production build. With the Vite server running, use `node scripts/journey-shots.mjs` to save reference images under the ignored `shots/` folder. The script captures the eight timeline points at 1920×1080 and 390×844, checks sunrise and sunset at 360, 390, 768, 1024, 1440, and 1920 px, and exercises continuation, reduced-motion, Reduce effects, rail navigation, and reverse scrolling. The screenshots are browser-environment evidence; verify WebGL visuals on a device/browser that provides WebGL2 before release.
