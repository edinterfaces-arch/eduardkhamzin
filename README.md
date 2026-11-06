# Interactive portfolio template

A neutral, editable personal website with placeholder profile information, images, projects, and external links. Built with React, Vite, Motion, native View Transitions, and Canvas 2D.

## Develop

```sh
npm ci
npm run dev
```

Edit `src/content.js` to replace the name, role, city, company, email, social link, project details, and demo map data. Replace images in `public/images/`. Metadata lives in `index.html`.

## Interactions

- A coordinated introduction, expandable build log, and replay.
- Country highlighting and tooltips on a dotted canvas world map.
- A typed project prompt, spring-following arrow, hover previews, and shared-element transition into a message.
- Project loading sequence, horizontal gallery, previous/next controls, and animated hover/focus checklists.
- Enter opens projects; Escape returns home. Native links and visible keyboard focus work on cards.
- Optional synthesized sound, off by default. Reduced-motion settings are respected.

The visitors and statistics are clearly labeled demo data. They are not real analytics. The site does not request geolocation, create visitor identifiers, connect to the reference site's services, or track visitors. External destinations use the reserved `example.com` domain.

## Validate and deploy

```sh
npm test
npx playwright install chromium
npm run dev -- --port 4173
# In another terminal:
npm run test:browser
npm run build
npm run check:deploy
npm run deploy
```

Cloudflare serves the built `dist/` directory with SPA fallback for `/projects`. Log into Wrangler in your terminal before deploying. The existing compatibility date is retained.

The existing Cloudflare Workers Builds connection also deploys changes pushed to `main`. `npm run test:browser` checks desktop, mobile, keyboard navigation, the gallery, replay, local assets, and reduced motion. Set `PORTFOLIO_URL` to run the same checks against a deployed site. Screenshots go to `../anonymous-portfolio-evidence` by default; override with `PORTFOLIO_EVIDENCE`.

The map data is generated from Natural Earth through the `world-atlas` package, using `d3-geo` and `topojson-client`. To regenerate it after changing the sample origin, run `node scripts/generate-map.mjs`. Country names and geography are public map data, not visitor locations.

Images are local PNG placeholders downloaded from Placehold.co. Fonts are locally bundled Inter and Geist Mono. Icons use Lucide. No original portraits, product screenshots, videos, branding, or contact details are included.
