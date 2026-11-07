# UX decisions — corrected in-screen architecture

The user clarified that all work must appear **inside the phone screens**, never in a separate adjacent feed. This requirement replaces the earlier companion-device recommendation.

## A — Multiple projects
A very tall phone frame would show all content but lose its recognizable silhouette. A sticky phone with scroll-linked screen content preserves both silhouette and continuous reading. **Use a sticky phone:** every project is rendered once, inside its screen. The outer document supplies exactly the required scroll travel. There is no nested scrolling region. Variable-length copy and any project count work through measured content height.

## B — Era transitions
The outgoing phone completes its feed and leaves through native page scrolling. The next era heading introduces the next phone on the same central axis. This preserves actual text geometry and avoids morphing or crossfading essential content. A decorative Duo cover opens before reading begins. A continuous hardware morph remains a possible future refinement, but must not hide any work.

## C — Reverse scrolling
Screen translation equals the negative clamped difference between page scroll and the start of the phone's sticky interval. It has no playback history. Reverse scroll, fast jumps and reloads derive the same visible content from the same position. ResizeObserver recomputes content travel after layout changes.

## D — Pacing
Track height is phone height plus content height minus screen height. Each pixel of page scroll advances the feed by one pixel. There is no extra empty scroll to play an animation. The final project footer remains visible before the phone leaves.

## E — Desktop and mobile
Desktop displays real project content inside centered hardware: unfolded Duo, iPhone 11, and iPhone 4S. The Duo places conversation/case-study copy on the left half and media on the right half of its actual screen. Both other devices contain a vertical feed. Mobile removes hardware and clipping, showing the exact same project DOM in ordinary document flow. This keeps text readable without duplicate content.

## F — Authenticity
Retain device silhouettes, notch/home button, status bars, and localized platform chrome. Scale the hardware presentation to readable desktop dimensions rather than forcing original physical pixel sizes. No fake social buttons. Platform aesthetics are historical references, not affiliated clients.

## Localization and accessibility
Preserve a project's fractional reading position using its logical position within the outer document. Recalculate all track heights before restoring it. Keyboard focus on an offscreen in-screen link moves the outer page to that link. No-JS and print modes unclip the complete document. Reduced motion removes the decorative fold; the direct reading scroll remains essential navigation.

## Technology
Next.js static export, React, TypeScript, Tailwind/custom CSS. One passive scroll listener and requestAnimationFrame update only screen transforms and the decorative cover. No GSAP or WebGL needed. SF Pro uses the native Apple system font stack.

## Remaining creative inputs
Real identity, projects, dates, outcomes and media remain placeholders. The in-screen layout is now an explicit requirement, not an open question.

## Research
- https://nextjs.org/docs/app/guides/static-exports
- https://motion.dev/docs/react-use-scroll
- https://www.apple.com/iphone-duo/ — device is a stylized CSS interpretation, not an engineering-accurate replica.
