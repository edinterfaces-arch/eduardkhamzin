# Scroll architecture

## Document first

`PortfolioExperience` renders introduction → present → social → early → ending. Every project is an article in DOM order. No text is mounted, hidden or translated in response to scroll. There are no scroll-snapping regions, nested scroll panes, timed gates or mandatory clicks.

Desktop uses a two-column grid. The left column is a sticky, aria-hidden decorative device stage. The right is a full-resolution platform feed. Below 901px the stage disappears and the feed uses the available width. Short desktop screens scale the illustrative hardware, never the readable document.

## One scroll source

`useNarrative` owns the only scroll listener. It is passive and schedules at most one requestAnimationFrame. Section offsets are measured on setup, resize and ResizeObserver changes. Frames read browser scrollY and write only opacity/transform/visibility on decorative elements. React state updates only when the active era changes, not on every pixel. No wheel or touch event is prevented.

The reading focus is `scrollY + 0.44 * innerHeight`. Around an era boundary the outgoing and incoming device shells crossfade through a 200px band. At the exact boundary both have opacity 0.5. Scale moves between 0.96 and 1, translation within 28px. The last shell fades toward the ending. The Duo's right panel rotates around its hinge from -168deg to 0deg over the first 65% of one viewport of scrolling (minimum 200px). These are direct mappings, without easing lag or queued playback. Returning to the same scroll position reproduces the same state.

## Localization and restoration

The language action finds the smallest semantic anchor containing a point 25% down the viewport (normally a project), then records its fractional position. A layout effect restores that fraction in the translated layout. In inter-project space the era itself is the anchor. CSS scroll anchoring is disabled so it cannot compete with explicit restoration. The query string records language; /ru/ also provides statically rendered Russian content without JS.

Native reload restoration works in Chromium. A pagehide handler saves only scrollY in sessionStorage, scoped to path/query, and restores it on reload for WebKit. Storage errors are ignored. Fragment URLs take precedence. No cross-session history or analytics is collected. Browser resizing remeasures all boundaries; content remains natural flow.

## Reduced motion and fallbacks

Reduced motion switches static device shells immediately and leaves the Duo open. No animated text. CSS-disabled/JS-disabled reading order contains every project. A noscript rule removes decorative hardware and hides the nonfunctional JS selector; the footer links to the alternative static language route. Semantic project text is in the exported HTML, not a canvas.

## Prototype

`/prototype/` uses the same components with two eras and two projects per era. It tests the core scroll architecture independently of the nine-project story. It is marked noindex. The complete page accepts arbitrary project counts; the prototype selection is only an explicit development fixture.

## Checks

`npm run test:browser` covers forward/reverse/fast scrolling, a stopped midpoint, resize, refresh, localization, 320/390/768 widths, reduced motion, keyboard skip access, and no-JS content in Chromium and WebKit. WebKit uses Option-Tab to include links, consistent with its macOS navigation convention. Browser automation is not a substitute for real-device Safari address-bar testing.
