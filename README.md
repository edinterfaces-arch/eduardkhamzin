# eduardkhamzin.ru

A minimal static page with a name, role, profile links and publication counters:

```text
Эдуард Хамзин
AI powered Senior Product Designer
Telegram
```

System font and no external browser resources. A small local script controls the accessible top-right theme switch, follows the system theme by default, and saves a manual selection in local storage. GitHub/Dribbble/Behance counters are refreshed server-side daily at 09:00 Asia/Yekaterinburg, with a last-successful-value cache. Dribbble counts come from its publicly visible feed; the scope is recorded in HTML data attributes and approximate view totals are rounded to hundreds and shown as full numbers. Edit the root `index.html`; the earlier portfolio source is inactive and not included in the build.

Open `index.html` directly, or run:

```sh
npm run build
npm run preview
```

The build copies only this standalone page and security headers to `out/`. Timeweb Cloud serves the same HTML using Nginx. See [deployment notes](deployment/README.md).

The Codex current-streak figure is supplied manually in the `.codex-stats` section of `index.html`; they are independent of the automatic social-counter refresh.

GitHub contributions are summed from the public contribution calendar from September 1, 2026 onward (including subsequent years). They may differ from signed-in/private totals. Both the social fragment and the marked GitHub number are updated atomically. Codex streak remains manually supplied: the public ChatGPT profile does not expose that number. Source failures retain each last successful value.
