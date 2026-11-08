# eduardkhamzin.ru

A single static page with exactly three visible lines:

```text
Эдуард Хамзин
AI powered Senior Product Designer
2001-2026
```

System font, no external resources or JavaScript. Edit the root `index.html`; the earlier portfolio source is inactive and not included in the build.

Open `index.html` directly, or run:

```sh
npm run build
npm run preview
```

The build copies only this standalone page and security headers to `out/`. Timeweb Cloud serves the same HTML using Nginx. See [deployment notes](deployment/README.md).
