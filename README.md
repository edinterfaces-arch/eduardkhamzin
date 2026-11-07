# Three eras. One designer.

A bilingual, scroll-led product design portfolio: contemporary conversation → social feed → early internet → a device-free closing. All identity, projects, illustrations and outcomes are explicitly sample content.

## Run locally

Use Node.js 22+ and npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. `/ru/` is the statically rendered Russian version. `/prototype/` is the small two-era, two-project-per-era architecture prototype.

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Production preview is http://localhost:4174 and serves the generated security headers. Restart preview after rebuilding because headers contain exact inline-script hashes.

Browser tests:

```sh
npx playwright install chromium webkit
npm run test:browser
```

Set `PORTFOLIO_URL` to test another deployment.

## Stack and structure

Next.js App Router, React, strict TypeScript, Tailwind CSS and custom era styles. Static export to `out/`; no application server, third-party data calls or animation framework required. SF Pro on Apple devices through the native system font stack.

- `src/data/projects.ts`: typed localized projects, profile and era metadata.
- `src/components/PortfolioExperience.tsx`: semantic narrative, localization and contact.
- `src/components/ProjectRenderer.tsx`: shared case-study/media renderer with platform-specific wrappers.
- `src/components/Devices.tsx`: decorative CSS hardware.
- `src/lib/useNarrative.ts`: one scroll source, reversible geometry and reload restoration.
- `src/app/globals.css`: responsive platform treatments, hardware, accessibility and print styling.
- `scripts/secure-export.mjs`: exact CSP hashes for Next's static hydration scripts.

Every case study is in HTML and readable without JavaScript. There are no required clicks, hidden carousels or nested scrolling. Desktop device previews sit beside the full case-study feed; mobile uses a readable full-width interpretation.

## Deployment

The existing Cloudflare Worker `eduardkhamzin` serves `out/`. Pushes to the connected GitHub `main` branch trigger Workers Builds. `npm run deploy` is available with local Wrangler credentials; `npm run check:deploy` validates the upload. The static export needs no Next server adapter. Configure `NEXT_PUBLIC_SITE_URL` when changing the public origin. The old Vite implementation is preserved in Git history at `af4c78c`.

## Design and authoring

- [UX alternatives and decisions](docs/UX_DECISIONS.md)
- [Scroll architecture](docs/SCROLL_ARCHITECTURE.md)
- [Content guide](docs/CONTENT_GUIDE.md)
- [Open questions and limitations](docs/OPEN_QUESTIONS.md)
- [QA evidence](design-qa.md)

Platform names and recognizable visual patterns are historical references; this is not an affiliated client or an actual social account. No analytics, geolocation or external platform APIs. Session storage holds only a temporary reading position for reload recovery.
