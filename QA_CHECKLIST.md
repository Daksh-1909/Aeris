# AERIS QA checklist

## Before each phase is complete

- [ ] Run `npm run check` and resolve all failures.
- [ ] Start the development server with `npm run dev` and confirm the page opens without browser console errors.
- [ ] Review the page at a small phone width (320–375 px), a large phone width (390–430 px), tablet (768 px), laptop (1366 px), and desktop (1920 px). Check for clipped text, horizontal page overflow, and image layout shifts.
- [ ] Navigate with a keyboard: open and close the mobile menu, follow section links, operate collection filters and photo cards, and confirm focus rings remain visible.
- [ ] Open a photograph, move between photos with arrow keys and controls, close with Escape, and confirm focus returns to the opener.
- [ ] Scroll through each section and confirm reveals, parallax, the desktop cloud gallery, and the mobile vertical cloud gallery work. Repeat with reduced motion enabled.
- [ ] Confirm the hero image loads eagerly, later images load as they enter view, and image failures preserve their frames with a fallback.
- [ ] Check empty gallery and failed gallery request states, then confirm the hero, filters, collection, and footer still work.
- [ ] Repeat core navigation and gallery checks after changes to confirm previous phases remain intact.

## Environment notes

The browser/device checks require a browser with responsive emulation and developer tools. If those are unavailable, record which checks were skipped; a successful build alone does not verify visual behavior or browser console output.

## Member feature scope

- Member routes and account state currently run as a browser-local demo. Do not use real credentials or sensitive data; email delivery, server-side sessions, database access controls, and production account recovery require a configured backend provider.
- Check local create/sign-in/sign-out, password reset token, dashboard, favorites, collection CRUD, search, profile, notification, and contact demo routes.
- Reset tokens are intentionally displayed only for local testing; contact form submissions are not delivered.

## Phase 46 local smoke pass (2026-09-26)

- `npm run check` passed: ESLint, strict TypeScript, and production build.
- Headless Chrome loaded the home, auth, dashboard, favorites, collections, search, profile, contact, and notifications routes. Registration and collection creation worked; gallery favorite toggle and lightbox zoom/Escape worked.
- Responsive document overflow was not detected at 320, 375, 768, 1024, 1440, and 1920 CSS pixels. No uncaught browser exceptions or console errors were observed in this pass.
- Lighthouse scores and a WCAG audit were not run. Remote photo delivery, email delivery, and multi-user behavior need a real production backend and deployment environment.
- Follow-up visual fix: replaced the desktop cloud gallery's pinned GSAP track with a native horizontal scroller and explicit previous/next controls. Verified multiple cards remain positioned in the viewport instead of leaving a single left-aligned image and a blank right side.
