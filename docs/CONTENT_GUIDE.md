# Content guide

Edit `src/data/projects.ts`. This is the single source for projects, eras and placeholder identity. All sample projects have `sample: true` and `year: null`; era dates describe the visual reference period, not invented project dates.

Each project needs a stable unique `id`, an `era` (`present`, `social`, `early`), localized `title`, `summary`, and `prompt` (used in the contemporary chat). Set `year` to an actual project year only when known. Use `sample: false` only for genuine work. Optional `problem`, `solution`, `outcome`, and `role` contain `{en, ru}` strings. Missing fields are omitted without leaving empty headings. Real dates are shown without changing their value to match an aesthetic era.

Add/remove array entries to change project counts. Two or three per era work without scroll math changes. Order within the array determines order within an era. The feed's height follows the content. Do not edit animation thresholds when changing copy.

## Media

`media` is an ordered array. All images are shown vertically; no carousel hides material. Provide intrinsic `width` and `height` and meaningful bilingual `alt` text. Store local assets under `public/` and reference paths like `/images/my-project.webp`. Prefer compressed WebP/AVIF and appropriately sized files. A missing/empty media array displays a labeled CSS illustration.

- Image: `{id, kind: 'image', src, width, height, alt}`.
- Video: `{id, kind: 'video', src, width, height, alt, poster, captions}`. Videos use controls, playsInline and preload=none. They never autoplay. Put all essential information in the surrounding text/poster so video playback remains optional. Supply captions for speech and a descriptive transcript in project copy.
- Prototype: `{id, kind: 'prototype', src, poster, width, height, alt}`. `src` is the external optional demonstration link; `poster` must be a local readable image. The visitor sees the poster inline; no embedded application or third-party tracking is loaded.

Use `metrics: [{value, label: {en, ru}}]` only for substantiated results. No metrics are invented in sample data. Optional `links: [{url, label: {en, ru}}]` render normal external links. Keep essential findings in the narrative, not exclusively at these destinations.

## Identity and ending

`profile` supplies the name, email and profile URL. Ending positioning copy is currently localized template text in `ContactSection`; replace it with accurate professional information. Update metadata in `src/app/layout.tsx` and `src/app/ru/page.tsx`, plus the social image. `NEXT_PUBLIC_SITE_URL` can override the deployed origin used in metadata. SF Pro is the native Apple system font; other platforms use their system sans serif, without redistributing Apple's font files.

## Layout checks after editing

Run typecheck, tests and build. Inspect the longest translation at 320px, scroll both directions, switch language within the edited project, and verify every image's description. Test without metrics, optional fields and media. Avoid unbroken long URLs in body text; display descriptive link labels.
