# eduardkhamzin.ru

A minimal static page with a name, role, profile links and publication counters:

```text
Эдуард Хамзин
AI powered Senior Product Designer
Telegram
```

System font, no external browser resources or JavaScript. Dribbble/Behance counters are refreshed server-side every six hours, with a last-successful-value cache. Dribbble counts come from its publicly visible feed; the scope is recorded in HTML data attributes and rounded views are marked approximate. Edit the root `index.html`; the earlier portfolio source is inactive and not included in the build.

Open `index.html` directly, or run:

```sh
npm run build
npm run preview
```

The build copies only this standalone page and security headers to `out/`. Timeweb Cloud serves the same HTML using Nginx. See [deployment notes](deployment/README.md).
