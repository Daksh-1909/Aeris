# AERIS — Read the Sky

AERIS is an editorial sky journal for looking at sky photography, learning about light and weather, and planning a time to photograph the sky. The homepage follows one scroll-driven scene from sunrise through noon and sunset into midnight, then continues into the photo journal and supporting tools.

## Get started

Requirements: Node.js 20 or later and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. The development page includes a **Scrub sky** slider for previewing the journey. Build and check the project with:

```sh
npm run check
```

`npm run check` runs ESLint and a strict TypeScript plus Vite production build. Use `npm run preview` after `npm run build` to serve the production output locally.

## Homepage

The journey in `src/sky-journey/SkyJourney.tsx` uses one normalized progress value to update the sky palette, orb, cloud layers, ground scene, six headline beats, stars, nebula, and aurora. The sun and moon are CSS layers at the same position. Grass, the foreground tree, playing children, dawn birds, the bench, and night visitors are built from local scene assets. The night stars are drawn on a canvas; that canvas pauses when it is offscreen or the document is hidden.

The homepage continues through the “What’s above” handoff, editorial photo and sky sections, a closing call to action, gallery collections, and the footer. Section composition is in `src/App.tsx`; shared sky colors and their time-of-day interpolation are in `src/sky/timeline.ts`.

Desktop scrolling uses Lenis and GSAP ScrollTrigger. Narrow viewports use native scrolling. System reduced-motion preference and the footer’s **Reduce effects** control disable motion effects. The app remains usable with the keyboard; decorative sky layers are hidden from assistive technology.

## Routes and data

The site includes the homepage, photo journal, gallery, cloud atlas (`/atlas`), shoot planner (`/planner`), sign-in and registration, member collections, favorites, profiles, and contact flows. Demo mode stores member data in this browser and clearly reports that contact messages are not sent. Configure Supabase with the project’s environment variables and follow [BACKEND_SETUP.md](./BACKEND_SETUP.md) before enabling cloud accounts or accepting real inquiries.

Editorial photos and image URL helpers live in `src/data/` and `public/images/`. The bundled gallery photos are demo copies; replace them with studio-owned or properly licensed work and verified photographer credits before a public launch.

## Assets and credits

- Moon surface map: [NASA Scientific Visualization Studio, CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/). The site credit is in the footer.
- Cloud sprites, sky-scene SVGs, and the 128 px grain tile: `public/3d/`.
- Gallery photos: `public/images/`.
- Fonts: self-hosted Cormorant Garamond and Inter webfonts, licensed under the SIL Open Font License in `public/fonts/`.

## Quality checks and screenshots

The Phase 10 QA script tests all six brief widths (360, 390, 768, 1024, 1440, and 1920 px) in Chrome, Edge, and WebKit. It checks page errors, visible headline bounds, document overflow, the header’s position relative to the demo notice, reduced motion, keyboard skip-link access, and the moon credit. Screenshots go to the ignored `shots/` directory.

```sh
npm run qa:phase10
```

Start the Vite dev server on `http://127.0.0.1:5173/` before running the script. Install Playwright browsers once if needed:

```sh
npx playwright install chromium webkit
```

For a quick production pass, run `npm run build`, then `npm run preview`. The phase QA commands are `npm run qa:layers`, `npm run qa:contrast`, and `npm run qa:perf`. Start the Vite development server on port 5173 before running the first two; they save screenshots under the ignored `shots/` directory. `qa:contrast` also checks that both local fonts load and that no Google Fonts request occurs.
