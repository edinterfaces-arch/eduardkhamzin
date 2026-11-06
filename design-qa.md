# Anonymized portfolio design QA

final result: passed

## Brief and accepted differences

Recreate the reference portfolio's restrained layout and interactive behavior, replacing personal information, portraits, project media, contact destinations, and location with placeholders. The map origin and visitor activity are illustrative; demo badges make that distinction explicit. Project previews are neutral local PNG placeholders as requested. Previous/next gallery buttons and an optional sound toggle are small functional additions.

## Evidence

Source visual truth: `../anonymous-portfolio-evidence/source-desktop.png` and `source-mobile.png`. Source gallery state: `../audit-eduardoalba/04-project-focus.png`.

Final browser-rendered implementation: `../anonymous-portfolio-evidence/verified-desktop.png`, `verified-mobile.png`, `verified-project-focus.png`, and `verified-mobile-projects.png`.

Full-view comparison: `../anonymous-portfolio-evidence/verified-comparison-desktop.png` and `verified-comparison-mobile.png`. Focused typography, spacing, map, and prompt comparison: `verified-comparison-focused.png`. All images were opened and reviewed together with their matching source.

Desktop viewport: 1512 × 861 CSS px, device scale factor 2; source and implementation captures 3024 × 1722 pixels. Desktop comparisons normalize both to the same size. The focused comparison crops the matching 492 CSS px content column.

Mobile viewport: 390 × 844 CSS px. The native source emulator region is cropped from its screenshot and normalized to 390 × 844. The headless implementation capture is 780 × 1688 at device scale factor 2, normalized to 390 × 844. DevTools chrome is excluded from comparison.

States: settled homepage; map tooltip; visitor panel; expanded build log; replay; project response; focused project destination; horizontal gallery movement; reduced motion; direct `/projects` route.

Native browser captures became frozen or blank; those captures were rejected. The user explicitly approved switching to headless Playwright. Final accepted evidence comes from Playwright.

## Comparison history

1. Initial comparison found a longer placeholder introduction wrapping to three desktop lines and pushing the map/prompt down. Fixed by shortening neutral copy to two lines.
2. Initial map was too faint and sparse. Increased dot density from 1,755 to 2,220 and increased dot/arc contrast. The geographic dataset and neutral origin intentionally differ from the reference.
3. Mobile summary and a separate demo caption added excess height. Shortened the summary, moved the demo badge beside its heading, and reduced the map's upper spacing. Final paired mobile and desktop comparisons show the intended compact reading rhythm.
4. A suspected mobile caption overflow was checked with DOM measurements: each caption's scroll width equals its 323 px content width. Page width equals the 390 px viewport. No overflow fix was required.

## Required fidelity surfaces

- Fonts/typography: native SF Pro through the Apple system-font stack, with a system sans-serif fallback on other platforms; 15 px main text with 1.65 line height; 13 px supporting text; compact monospaced labels. The hierarchy, weight, and wrapping remain close to the reference with the requested content replacements.
- Spacing/layout: 492 px desktop content column, 24 px mobile gutters, small square portrait, generous introductory spacing, large dotted map, rounded prompt, horizontal project rail. Earlier extra height was corrected. Normal document scrolling keeps the footer reachable on mobile.
- Colors/tokens: off-white `#fafaf9`, foreground `#18181b`, muted `#71717a`, subtle `#8a8a92`, borders `#e4e4e7`, teal action color. Restrained borders and shadows match the visual hierarchy.
- Images/assets: all personal and project pictures are replaced by local neutral PNG placeholders. Country geography comes from Natural Earth/world-atlas. Icons come from Lucide. The map is an actual interactive Canvas rendering.
- Copy/content: name, role, city, employer, email, social destination, project names/descriptions, metadata, portrait, and project imagery are neutral placeholders. External destinations use `example.com`. Demo activity does not represent real visitors.

## Interaction and runtime verification

Three Playwright scenarios pass: desktop full flow; mobile reflow and gallery; reduced motion and direct navigation. Verified the introductory reveal, counts, build disclosure, visitor disclosure, country tooltip, Enter navigation, project response, focused checklist/destination, next-gallery control, Escape return, replay, mobile tap navigation, native placeholder link attributes, and email destination.

No application page errors. Browser resource checks found no external runtime resources. Mobile document width is 390 px with a 390 px viewport; all three captions fit their card widths. Privacy tests check reserved link destinations, neutral metadata/source content, local PNG assets, and absence of visitor tracking APIs. The production build and Cloudflare packaging dry run pass.

## Design hook triage

The gradient-text hook matched the original-style animated loading shimmer. Retained intentionally as temporary progress feedback and narrowly suppressed for `src/styles.css` in `.impeccable/config.json`. No decorative gradient headings were introduced. No unresolved design-hook finding remains.

## Residual limits

Demo presence is illustrative rather than a realtime backend. Placeholder images replace product videos. A full screen-reader audit and a physical-device test were not performed; no full accessibility-compliance claim is made.

## Implementation checklist

- [x] Anonymize content, metadata, media, links, and location.
- [x] Recreate main transitions and interactions.
- [x] Verify paired desktop/mobile visuals.
- [x] Verify keyboard, touch, reduced motion, privacy, and runtime behavior.
- [x] Build and validate Cloudflare deployment packaging.
- [x] Keep original identifying screenshots outside tracked site source.


## Font and paragraph alignment update

The user requested SF Pro and corrected alignment for the introductory paragraph. Removed bundled Inter and Geist Mono, switched all page typography and map labels to the native SF Pro system stack, moved spaces outside animated word wrappers, and kept the company link and its period together.

Baseline: `../anonymous-portfolio-evidence/font-update/before-desktop.png` and `before-mobile.png`. Updated captures: `after-desktop.png` and `after-mobile.png` in the same folder. Paired comparisons: `comparison-desktop.png`, `comparison-mobile.png`, and the focused `comparison-paragraph.png`. Desktop captures are 3024 × 1722 pixels at 1512 × 861 CSS px; mobile captures are 780 × 1688 at 390 × 844 CSS px. Comparisons normalize both sides identically. These comparisons were opened and inspected.

The browser's platform-font inspection confirms `.SF NS` / `.SFNS-Regular`, a native system font rather than a downloaded custom face. Every paragraph line starts at zero indentation on desktop and mobile. Paragraph scroll width equals its content width: 492 px desktop and 342 px mobile. Text, link destination, colors, image placeholders, and the surrounding layout remain consistent with the brief. The company name and punctuation stay together. Word entrance animation remains intact with normal wrapping whitespace.

All three privacy checks, all three browser scenarios, and the production build pass. No new actionable design findings. No new design-hook suppressions were added.

final result: passed
