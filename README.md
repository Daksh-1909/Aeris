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
- Cloud photo sources and gallery photo credits: [CREDITS.md](./CREDITS.md). Gallery photos remain demo copies; see [docs/photo-todo.md](./docs/photo-todo.md) for replacements needed before launch.
- Fonts: self-hosted Cormorant Garamond and Inter webfonts, licensed under the SIL Open Font License in `public/fonts/`.

## Quality checks and screenshots

The scene stack follows the values in `src/sky-journey/journey.css`: sky 0, stars 1, nebula 2, orb glow 3, orb 4, far/mid/near clouds 5/6/7, birds 8, back ground 10, children 12, bench 13, front ground 14, tree 15, beats 30, header 40, rail 45, grain 50. Scene plane bounds fill the sticky stage. The desktop beat zone starts at 6% × 13%, is 44% wide and at most 33% high; tablet is 7% × 11%, 86% × 30%; mobile is 6% × 10%, 88% × 30%. Orb anchors, ground horizon and foreground placement vary by those same desktop/tablet/mobile breakpoints.

Run the automated suite against a local server or any deployed site. Set `AERIS_BASE_URL` to select the target. `qa:phase10` checks six widths in Chrome, Edge and WebKit, keyboard skip-link access, reduced motion and scene text fit. `qa:accessibility` checks the no-JavaScript fallback, reduced-motion story, keyboard access, photo alternatives, mobile targets and six core routes. `qa:layers` checks seven viewports (including the 1366 × 640 short laptop), layer order and text/scene collisions at 25 progress samples. `qa:contrast` measures text against captured pixels at desktop and mobile sizes. `qa:perf` builds and serves the production app, records a 10 second mobile scroll at 4× CPU slowdown and runs Lighthouse mobile.

```sh
npm run qa:phase10
```

Start the Vite dev server on `http://127.0.0.1:5173/` before running the visual scripts. Install Playwright browsers once if needed:

```sh
npx playwright install chromium webkit
```

The frame-time budget is a 95th percentile at or below 24 ms with CPU slowdown set to 4×; Lighthouse mobile performance must be 90 or more, LCP at most 2.2 s and CLS at most 0.02. The budgets are asserted by `qa:perf` against the production build. The visual scripts save evidence under the ignored `shots/` directory. `qa:contrast` also checks that both local fonts load and that no Google Fonts request occurs.

See [docs/release-qa.md](./docs/release-qa.md) for the M12 production-preview results and the live/device checks that still need a deployment and physical hardware.
