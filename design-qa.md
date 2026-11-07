# Three-era portfolio — QA

## Result
Local production build passed on 2026-11-07. Nine clearly labeled sample projects, three eras, five localized platform treatments and a device-independent ending. The two-era prototype remains at `/prototype/`.

## Automated evidence
- Strict TypeScript check passed.
- 3 content tests passed: neutral sample data; variable-length content with two images, absent optional fields and absent metrics across five interfaces; optional video/prototype markup.
- 16 Playwright scenarios passed (8 each in Chromium and WebKit). Forward/reverse scroll, fast jumps, deterministic transition midpoint, resize, reload restoration, project-relative EN/RU switching, 320/390/768px widths, no horizontal/nested scrolling, keyboard skip access, reduced motion, four-project prototype, static no-JS EN/RU pages, automated accessibility scans and touch viewport behavior.
- axe WCAG 2 A/AA and 2.1 AA scan: zero violations in English and Russian in both browser engines. This is an automated result, not a formal certification.
- Chromium synthetic touch scroll reversed the reading position; WebKit touch tapping and viewport resizing passed.
- Production export and Wrangler dry-run passed. All static assets total approximately 984KB on disk before transport compression; no large raster device mockups or animation library.
- Static-export hydration scripts have exact CSP hashes. No arbitrary inline script permission, external tracking, geolocation or social APIs.

## Visual inspection
Captured and inspected desktop introduction, open Duo, iPhone 11/Twitter, iPhone 4S/Tumblr and mobile Telegram/VK. Desktop: 1440×1000; mobile: 390×844. Evidence lives in the workspace sibling folder `../anonymous-portfolio-evidence/three-eras/` and is intentionally outside the source repository.

The layout is a deliberate hybrid: hardware supplies era context alongside readable case studies, never as the only content viewport. On mobile the phone hardware disappears. SF Pro uses the native Apple system font. Placeholder illustrations are labeled and use local CSS, with no fictitious professional metrics or project dates.

## Issues found and fixed
- Sticky language control remains reachable during reading.
- Transition logic accounts for the prototype's shorter era list.
- Language position uses the smallest containing semantic anchor, rather than the parent era.
- WebKit reload restoration uses a scoped session-only position fallback.
- Device-caption and Telegram-header contrast increased after axe findings.
- Security hashes regenerated after each export. Production preview must restart after a rebuild so it loads the new hashes.

## Limits
Physical Safari address-bar behavior, VoiceOver listening and sustained frame rates on low-powered phones remain real-device checks. Automated WebKit and viewport changes do not certify them. Native browser scroll remains unmodified. All content is accessible without the device animation.

See `docs/OPEN_QUESTIONS.md` for creative choices and real content still needed.
