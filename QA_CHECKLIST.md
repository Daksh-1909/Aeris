# AERIS QA checklist

## Before each phase is complete

- [ ] Run `npm run check` and resolve all failures.
- [ ] Start the development server with `npm run dev` and confirm the page opens without browser console errors.
- [ ] Review the page at a small phone width (320–375 px), a large phone width (390–430 px), tablet (768 px), laptop (1366 px), and desktop (1920 px). Check for clipped text, horizontal page overflow, and image layout shifts.
- [ ] Navigate with a keyboard: open and close the mobile menu, follow section links, operate collection filters and photo cards, and confirm focus rings remain visible.
- [ ] Open a photograph, move between photos with arrow keys and controls, close with Escape, and confirm focus returns to the opener.
- [ ] Scroll through each section and confirm reveals, parallax, the desktop cloud gallery, and the mobile vertical cloud gallery work. Repeat with reduced motion enabled.
- [ ] Confirm the hero image loads eagerly, later images load as they enter view, and image failures preserve their frames with a fallback.
- [ ] Confirm gallery records load local 480/960/1600 WebP variants, `srcset` selects an appropriate width, and there are no runtime `images.unsplash.com` requests. Treat current Unsplash copies as demo assets until replaced with verified owned/licensed photographs and credits.
- [ ] Check empty gallery and failed gallery request states, then confirm the hero, filters, collection, and footer still work.
- [ ] Repeat core navigation and gallery checks after changes to confirm previous phases remain intact.

## Environment notes

The browser/device checks require a browser with responsive emulation and developer tools. If those are unavailable, record which checks were skipped; a successful build alone does not verify visual behavior or browser console output.

## Member feature scope

- Member routes and account state currently run as a browser-local demo. Do not use real credentials or sensitive data; email delivery, server-side sessions, database access controls, and production account recovery require a configured backend provider.
- Check local create/sign-in/sign-out, dashboard, favorites, collection CRUD, search, profile, notification, and contact demo routes.
- Confirm Demo Mode is visibly labeled, recovery/verification do not claim to send email, and contact submission says “Demo mode — message not sent.”
- With Supabase configured, deploy both migrations and `submit-inquiry`; verify a submission is stored, email notification status is honest, and a normal authenticated user cannot query inquiries.

## Cloud Atlas

- Open `/atlas` offline and confirm all ten cloud guide entries are available.
- Open a cloud type, check altitude, weather signal, photography tip and matching tagged gallery images.
- Complete each field in the cloud identifier; confirm the suggestion links to a guide with at least one tagged gallery photograph.
- Open a gallery lightbox and follow its cloud type tag into the Atlas.

## Shoot Planner

- Search for Mumbai, select a result, and check the displayed timezone and local sunrise/sunset. For 2 Oct 2026, compare sunrise and sunset to a trusted table.
- Deny geolocation and confirm city search still works.
- With a signed-in account, save a spot, reload, toggle a reminder and remove it. Confirm signed-out users can see times but are asked to sign in to save.
- Test a high-latitude date/location and confirm missing sun or moon rise/set events show a readable empty value instead of crashing.

## Sky Clock and Daily Sky

- Reload at dawn/day/evening/night and confirm the matching accent appears without a theme flash; use Auto, Day and Night overrides and reload to confirm persistence.
- Enable reduced motion and confirm sky transitions stop. Check both light and dark system appearance.
- Reload on the same local date and confirm Daily Sky keeps the same featured photograph; inspect the seven previous-date entries and open each.

## Photo requests and admin inbox

- Open a lightbox, use its detail link, and confirm `/photo/:id` shows image, location, time/light, cloud tag, credit and camera-data status.
- Submit print and licensing requests with a test Supabase environment; confirm the right photo ID/title, purpose and size/usage arrive in the database and inbox.
- Test invalid email, blank message and honeypot; confirm no inquiry is created.
- Sign in with a normal account and verify direct `inquiries` reads/updates are denied by RLS. Sign in with an admin and filter/update statuses.
- Share a detail URL and inspect its title, description and Open Graph image after client render.

## Search and onboarding

- Search by text and combine cloud type, time of day, season, mood/color and location filters. Remove individual chips, refresh, and use browser back/forward to confirm URL state.
- Register a new account and finish each onboarding step; repeat with every skip path. Confirm the optional home city appears as the Planner's initial search.

## Latest implementation check (2026-10-02)

- `npm.cmd run check` passed: ESLint, strict TypeScript, and Vite production build.
- Source search found no `images.unsplash.com` hot-links in `src/`; 11 demo photographs are present as three local WebP widths each.
- Manual browser/device checks, Lighthouse, screen-reader review, and live Supabase/RLS verification remain outstanding. The main entry is 393.29 kB minified; Supabase and the optional atmosphere effect build as separate chunks.

## UI polish plan pass (2026-10-02)

- [ ] Visit all auth/member routes, `/atlas`, `/planner`, `/photo/:id`, `/welcome`, `/admin/inquiries`, and an unknown route; record console/network failures and confirm each page has a useful heading.
- [ ] Use a real responsive browser at 360, 390, 768, 1024, 1280, 1536, and 1920 CSS px. The available headless Chrome session clamps small window requests to a wider CSS viewport, so it cannot check phone widths accurately.
- [ ] Switch Dusk, Daylight, and Auto; verify the first paint, text contrast, forms, image captions and controls throughout home and member routes.
- [ ] Keyboard-test the skip link, route heading focus, desktop cursor fallback, mobile menu focus trap/Escape/scroll lock, lightbox, and forms. Repeat with reduced motion.
- [ ] Confirm the SVG favicon and 180×180 Apple touch icon render clearly at their target sizes.
- [ ] `npm.cmd run check` passes with no chunk-size advisory. The 393.29 kB main entry and separate Supabase/atmosphere chunks still need a Lighthouse run to measure real loading impact.
- [ ] Lighthouse, screen-reader audit, cross-browser run and live Supabase/RLS verification remain outstanding.

## Phase 4–6 local smoke pass (2026-09-26)

- `npm run check` passed: ESLint, strict TypeScript, and production build.
- Headless Chrome loaded the home, auth, dashboard, favorites, collections, search, profile, contact, and notifications routes. Registration and collection creation worked; gallery favorite toggle and lightbox zoom/Escape worked.
- Responsive document overflow was not detected at 320, 375, 768, 1024, 1440, and 1920 CSS pixels. No uncaught browser exceptions or console errors were observed in this pass.
- Lighthouse scores and a WCAG audit were not run. Remote photo delivery, email delivery, and multi-user behavior need a real production backend and deployment environment.
- Follow-up visual fix: replaced the desktop cloud gallery's pinned GSAP track with a native horizontal scroller and explicit previous/next controls. Verified multiple cards remain positioned in the viewport instead of leaving a single left-aligned image and a blank right side.
