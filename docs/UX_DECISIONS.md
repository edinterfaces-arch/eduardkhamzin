# UX decisions

## Architecture proposal

A static-exported Next.js / React / TypeScript application, Tailwind utilities and custom era styles. One semantic document contains every project. A sticky, decorative device accompanies the readable platform feed on desktop; on mobile the feed becomes the interface. Devices never contain the only copy of a case study. SF Pro is selected through the Apple system font stack.

## A — Multiple projects

**Challenge:** real case studies do not fit fixed phone screens. A continuous feed offers native scrolling and variable content lengths but cannot preserve literal hardware proportions. A pinned presentation can preserve the phone, but requires artificial scroll distances, moving text and fragile long-content handling. **Choose hybrid:** native feed plus sticky illustrative phone. Reusable post renderers support any number of projects; all media is inline. No nested scroll, hidden slides or required case-study pages. Risk: the preview may compete with the case study; keep it secondary and noninteractive.

## B — Era transitions

**Challenge:** device aspect ratios differ dramatically. A continuous geometric morph is memorable but distorts screens/text and requires layout work. A shared-axis crossfade uses overlapping device silhouettes, opacity and small transforms while keeping each recognizable. **Choose crossfade at section boundaries**, with a short year bridge in normal flow. The Duo independently opens on a CSS 3D hinge. No 3D engine. Mobile transitions use normal section boundaries and platform colors, avoiding miniature hardware. Risk: overlapping shells at midpoint; keep transition distance short and inspect at half progress.

## C — Reverse scrolling

A triggered timeline is easy to author but requires direction bookkeeping and can desynchronize after fast scrolls. Position-derived progress has no playback history and is reversible. **Choose deterministic scroll geometry**, batched in one requestAnimationFrame with cached section offsets. Intersection/current-section state only changes when the semantic section changes. ResizeObserver recomputes geometry; no content is conditionally mounted by scroll. Browser restoration and fragment URLs keep position after refresh. No scroll snapping or smooth-scroll replacement. Risk: late media resizing; reserve intrinsic aspect ratios.

## D — Pacing

Fixed viewport-height scenes guarantee timing but introduce empty scroll and clip long copy. Natural content height adapts to copy and translation but gives less cinematic control. **Choose natural height**, roughly one to two screens per sample project, no enforced minimum per project. Headline project gets a larger visual; subsequent projects still include problem, approach and outcome. Era bridges use a modest amount of space, never several screens. A persistent era/year indicator communicates progress. Risk: real long copy increases total length; edit editorially rather than hiding details.

## E — Desktop and mobile

A scaled phone on mobile preserves literal hardware but makes text too small. An edge-to-edge platform feed loses hardware but preserves reading. **Choose full-width mobile feed (B)**, without hardware even at boundaries. Desktop hardware is illustrative, not the sole content viewport. Short desktop windows shrink the stage; tablet layouts switch to mobile presentation. Use safe-area padding, stable small viewport sizing and content-driven height. Risk: breakpoint/resize changes; content never depends on device position.

## F — Authenticity

Literal clients include nonfunctional controls, tiny type and inaccessible textures. Generic cards lose recognition. **Choose adapted historical vocabulary:** ChatGPT conversational turns; Twitter thread lines and blue accents; Telegram channel posts and wallpaper; Tumblr dark blue masthead and serif titles; VK blue beveled chrome and early-iOS materials. No fake like, send, back or navigation buttons. Identity/avatar/handle are explicitly placeholders. Body text remains >=16px. Platform names are references, not affiliation claims.

## Localization

Use separate platform wrappers, one shared localized project model. Before a switch, save the nearest project/era anchor and fractional offset through it; after React commits, restore that offset within its new dimensions. Do not reset to top. Update document language and URL query. Initial /ru/ is statically rendered for JS-free Russian access; a regular alternative-language link remains available. Risk: large translation-length changes; relative project position is approximate, not word-exact.

## Animation technology

CSS scroll timelines are appealing but browser support and multi-section coordination need fallbacks. GSAP ScrollTrigger excels at elaborate pinned timelines, unnecessary here. Motion is already installed, but a few deterministic transforms do not need a runtime motion dependency. Use one passive native scroll listener, rAF and direct transform/opacity writes on decorative devices. No text transformations, springs or easing lag tied to reading. Reduced motion keeps static shells and immediate section changes. Purpose: explanation and spatial continuity, occasional narrative movement.

## Decisions for the designer

Real case studies, dates, role, identity, outcomes, availability and links remain placeholders. Confirm whether the hybrid companion-phone layout is preferred over literal in-phone case studies; the latter is deliberately rejected for readability. Confirm nostalgic intensity and approved product media before public professional use. These do not block the sample implementation.

## Research

- https://nextjs.org/docs/app/guides/static-exports — pre-rendered static export, compatible with existing Cloudflare assets hosting.
- https://motion.dev/docs/react-use-scroll — MotionValue scroll composition considered; unnecessary for the selected limited animation surface.
- https://www.apple.com/iphone-duo/ — foldable and side-by-side reference inspected. Our CSS model is an illustrative interpretation, not a dimensionally accurate hardware replica.
