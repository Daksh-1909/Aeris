# AERIS UI polish audit

## Scope and limits

Static review completed on 2026-10-02. `npm.cmd run check` passes (ESLint, strict TypeScript, production build). `npm install` was not run because dependencies are already present and there are no dependency changes. Browser console, route-by-route rendering, responsive viewport, Lighthouse, screen-reader, and live backend checks could not be performed in this environment; findings below distinguish static observations from checks still requiring a browser.

## Findings

| ID | Severity | Route / file | Problem | Proposed fix |
|---|---|---|---|---|
| UI-01 | Medium | `src/components/CustomCursor.tsx` | Pointer movement calls React state setters for cursor visibility on every move. This adds unnecessary renders and does not implement the requested independent dot and lagging halo. | Drive cursor position directly with GSAP quick setters; update React state only when cursor mode changes. Restore native I-beam behavior on editable controls and guard runtime setup. |
| UI-02 | Medium | `src/index.css` | `body { overflow-x: hidden }` masks horizontal overflow instead of fixing its source. | Remove the global mask after checking the sections at narrow widths; constrain the actual overflowing elements. |
| UI-03 | Medium | `src/index.css`, `src/components/member.css`, `src/features/cloud-atlas/cloudAtlas.css` | A large number of colors are hard-coded, so the requested Dusk/Daylight tokens and consistent theme mapping are not yet present. | Introduce semantic palette/type/spacing/motion tokens, wire Tailwind colors, and migrate styles in focused passes. |
| UI-04 | Medium | `src/components/ErrorBoundary.tsx` | The recovery control resets the boundary state rather than reloading the app as specified; error UI also embeds layout/color styles inline. | Use tokenized classes and provide a true reload action plus a separate home link. |
| UI-05 | Low | `src/components/CustomCursor.tsx`, `src/components/Header.tsx` | The cursor does not restore the native cursor over inputs/selects/contenteditable; mobile menu Escape is implemented, but focus trapping and body scroll lock are not evident. | Add editable-target behavior to the cursor and complete/focus-test the mobile menu interactions. |
| UI-06 | Low | `src/features/cloud-atlas/cloudAtlas.css`, `src/components/member.css`, `src/components/MemberShell.tsx`, `src/components/ErrorBoundary.tsx` | Several full-height layouts use `100vh`, which can clip beneath mobile browser UI. | Prefer `100dvh` with a `100vh` fallback and include safe-area padding where content reaches screen edges. |
| UI-07 | Low | Image-bearing routes | Some images lack intrinsic width/height and/or an error fallback (`DailySky`, `PhotoDetailPage`, cloud-atlas studies, member photo tiles). | Add meaningful dimensions or aspect ratios and consistent image fallback behavior. |
| UI-08 | Low | Global interaction styles | Existing focus styling is present, but the palette, button/input states, route transitions, and consistent motion tokens are incomplete. | Consolidate interaction styles into tokens and add reduced-motion-safe state transitions as routes are polished. |
| UI-09 | Low | Build | Production build succeeds, but Vite reports the main JavaScript chunk is 603.54 kB minified. | Inspect bundle composition and split heavy dependencies/features without changing behavior. |

## Existing strengths verified statically

- Routes are composed through `MemberShell` and `MemberExperience`, including a friendly unknown-route response and a visible Demo Mode banner.
- App-level and image-level GSAP effects have cleanup paths; scroll utility teardown removes Lenis/ticker listeners and ScrollTriggers.
- The hero has descriptive alt text, explicit dimensions, eager loading, high fetch priority, and an error state. Shared gallery images have dimensions, lazy loading, descriptive alt text, and a fallback.
- Cloud, planner, photo detail, onboarding, and admin views are lazy-loaded from the member route layer.
- The custom cursor checks for fine pointer and reduced motion before enabling.

## Browser follow-up required

Visit the requested routes plus `/atlas`, `/planner`, `/photo/:id`, `/welcome`, and `/admin/inquiries` at 360, 390, 768, 1024, 1280, 1536, and 1920 px. Record console/network errors, keyboard/focus behavior, contrast, reduced-motion behavior, image loading/layout shift, and actual overflow before marking visual QA complete.
