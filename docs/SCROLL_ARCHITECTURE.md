# In-screen scroll architecture

## One document, inside the devices
`DeviceScreen` contains the actual project DOM inside `.device-screen > .screen-content`. There is no adjacent feed or duplicate preview. The three era sections stack on one central axis. On desktop each phone is sticky within its own measured track.

Let H be phone height, C content height and S screen viewport height. Track height is `H + max(0, C - S)`. Screen translation is `-clamp(scrollY - trackTop + stickyTop, 0, C - S)`. This makes each page-scroll pixel move one content pixel. When the last line reaches the bottom of the screen, the phone begins leaving the viewport naturally. Earlier content returns identically when scrolling back.

`useNarrative` owns one passive scroll listener and a requestAnimationFrame scheduler. Measurements are separate from per-frame transforms. ResizeObserver watches content height. All track heights update before subsequent track positions are measured. No wheel/touch event is intercepted and the screen uses overflow:clip, not overflow:auto or scrollTop.

## Responsive behavior
At widths up to 900px, hardware disappears, the phone is nonsticky, screen height becomes automatic and content transforms are removed. Every case study uses normal document flow. Resizing recomputes the desktop travel if necessary. Short desktop windows use shorter hardware, preserving readable type.

## Language, links and recovery
`documentPosition()` maps a project inside a translated screen to its logical outer-page position. Language switching records the current project/fraction, remeasures translated content, and restores the same position. Keyboard focus and direct project hash links use the same mapping. Scoped session storage retains only scrollY on pagehide for WebKit reload recovery. No tracking or identity data is stored.

## Motion and fallbacks
The foldable cover opens during approach and is fully open before its sticky reading interval. Reduced-motion mode removes that decorative movement. Direct screen translation remains necessary to read, equivalent to native scrolling. No-JS and print styles unclip the entire content, turn off stickiness and remove decorative hardware. All text remains in exported HTML.

## Verification
Browser tests assert all nine articles are descendants of actual device screens, only one copy exists, content stays horizontally within the screen, project sections enter the visible screen while scrolling, and reversal reproduces identical transforms. Additional checks cover localization, reload, resize, mobile, no-JS, keyboard, reduced motion, text scaling and contrast in Chromium/WebKit.
