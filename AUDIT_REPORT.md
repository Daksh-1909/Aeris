# AERIS UI polish audit

## Scope and limits

Static review completed on 2026-10-02. `npm.cmd run check` passes (ESLint, strict TypeScript, production build). After moving Supabase out of the main chunk, the entry chunk is 393.29 kB minified; Supabase is a separate 214.33 kB chunk, and the conditional atmosphere effect is a separate 464.59 kB chunk. Headless Chrome was available for desktop spot checks at an 882 CSS-pixel viewport; images loaded on the home page and the Dusk/Daylight lower-page layout was inspected. This headless setup clamps small window sizes to a wider CSS viewport, so it cannot validate 360/390 px layouts. Browser console inspection, complete route-by-route review, Lighthouse, screen-reader, and live backend checks remain open.

## Findings

| ID | Severity | Route / file | Problem found | Proposed fix | Status |
|---|---|---|---|---|---|
| UI-01 | Medium | `src/components/CustomCursor.tsx` | Pointer movement used React state updates and a single ring. | Two GSAP-positioned dot/halo elements; mode-only state changes; editable cursor restoration. | Implemented; interactive profiler check remains. |
| UI-02 | Medium | `src/index.css` | Global `overflow-x: hidden` masked horizontal overflow. | Removed the global mask and bounded the cloud scroller and hero copy. | Implemented; narrow viewport review remains. |
| UI-03 | Medium | Global and feature styles | Colors were hard-coded, without a consistent theme system. | Added palette/type/spacing/motion tokens, Tailwind mapping and a Dusk/Daylight/Auto selector; migrated common colors. | Partial: specialized color literals remain and need a full contrast pass. |
| UI-04 | Medium | `src/components/ErrorBoundary.tsx` | Recovery reset the boundary instead of reloading. | Token-ready error layout with a real reload action and home link. | Implemented. |
| UI-05 | Low | Cursor and mobile navigation | Cursor did not restore I-beam behavior; mobile menu had no focus trap or body scroll lock. | Delegated cursor modes, input cursor restoration, focus trap, Escape close, scroll lock and focus return. | Implemented; keyboard walkthrough remains. |
| UI-06 | Low | Full-height layouts | Some full-height layouts could clip under mobile browser UI. | Added `100dvh` overrides and safe-area spacing. | Implemented; device review remains. |
| UI-07 | Low | Image-bearing routes | Some images lacked dimensions or failure handling. | Added dimensions and a shared bundled sky-gradient fallback where missing. | Implemented; deliberate failure-state review remains. |
| UI-08 | Low | Global interaction styles | Focus, input/button states, route transitions, and motion consistency were incomplete. | Added skip links, route heading focus, reduced-motion-safe page transitions, and consistent control sizing/states. | Partial; assistive-technology and palette review remain. |
| UI-09 | Low | Build | The original 607.87 kB main JavaScript chunk exceeded Vite's advisory threshold. | Separated Supabase client loading from the home entry and kept the optional atmosphere effect in a conditional lazy chunk. | Implemented: main entry is now 393.29 kB; manual performance/Lighthouse review remains. |

## Existing strengths verified statically

- Routes are composed through `MemberShell` and `MemberExperience`, including a friendly unknown-route response and a visible Demo Mode banner.
- App-level and image-level GSAP effects have cleanup paths; scroll utility teardown removes Lenis/ticker listeners and ScrollTriggers.
- The hero has descriptive alt text, explicit dimensions, eager loading, high fetch priority, and an error state. Shared gallery images have dimensions, lazy loading, descriptive alt text, and a fallback.
- Cloud, planner, photo detail, onboarding, and admin views are lazy-loaded from the member route layer.
- The custom cursor checks for fine pointer and reduced motion before enabling.

## Browser follow-up required

Visit the requested routes plus `/atlas`, `/planner`, `/photo/:id`, `/welcome`, and `/admin/inquiries` at 360, 390, 768, 1024, 1280, 1536, and 1920 px. Record console/network errors, keyboard/focus behavior, contrast, reduced-motion behavior, image loading/layout shift, and actual overflow before marking visual QA complete.
