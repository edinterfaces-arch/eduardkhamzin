# eduardkhamzin.ru

The website is the standalone root `index.html`. It has no external resources, JavaScript, framework, analytics or web fonts.

Target: Timeweb Cloud server `147.45.156.6`, SSH user `root`.

Serve `index.html` from `/var/www/eduardkhamzin.ru/` using the included Nginx configuration. Enable it only after inspecting existing virtual hosts, and run `nginx -t` before reloading.

REG.RU DNS remains on ns1.reg.ru / ns2.reg.ru. Set the `@` A record to `147.45.156.6`. If www is desired, set its A record to the same IP. Check for conflicting A/AAAA records first; preserve mail/TXT records.

Issue a Let's Encrypt certificate after the domain resolves to the server, using the existing certificate tooling or Certbot's Nginx integration. Verify HTTPS and automatic renewal.

## Live configuration

DNS A records for `@` and `www` point to `147.45.156.6`. Let's Encrypt covers both names. HTTP redirects to `https://eduardkhamzin.ru/` except ACME challenges, and HTTPS `www.eduardkhamzin.ru` redirects to the same canonical host. Renewal is scheduled by `certbot.timer`; a deploy hook reloads Nginx.

Amnezia already owns TCP/UDP 443. Its containers and configurations were left intact. Nginx listens on 8443 for TLS SNI routing: this domain goes to the loopback HTTPS site on 8444, and every other TLS name passes through to Amnezia on loopback 443. A dedicated IPv4 NAT rule routes new external TCP 443 connections to this dispatcher. UDP 443 remains untouched. Existing connections are not interrupted.

`eduard-site-https.service` restores this route at startup after Docker/Nginx. Its script uses a dedicated `EDUARD_SITE_HTTPS` chain. To revert ONLY website TLS routing and restore direct external TCP 443 access to Amnezia:

```sh
systemctl disable --now eduard-site-https.service
```

This stops website HTTPS routing; the static page and certificates remain on disk. Source configurations and the service/script are included in this directory.

## Public portfolio counters

`eduard-social-stats.timer` refreshes public profile statistics daily at 09:00 Asia/Yekaterinburg. It runs `eduard-social-stats.service` as www-data with a restricted filesystem. The Python script has no external dependencies. It fetches each source once per run, caches the last successful result in `/var/lib/eduard-social-stats/stats.json`, and atomically replaces only the marked statistics fragment in the site's HTML. Statistics require no browser-side requests, tracking or third-party resources. A separate local theme script controls the appearance switch.

Behance: exact profile-level Project Views and Appreciations from the public `/khamzin/info` page, scoped to profile analytics links to avoid mixing in collaborators or team statistics.

Dribbble: sum of the 15 shots currently exposed in the public profile feed. The number of public works and feed scope are stored as HTML data attributes. Rounded source view counts produce an approximate total, displayed as a full number rounded to hundreds. Login-only pagination is not used. Source failures retain previous values and their original timestamps; the service logs the error rather than replacing counters with zero.

```sh
systemctl start eduard-social-stats.service
systemctl list-timers eduard-social-stats.timer
journalctl -u eduard-social-stats.service
```

After changing the source template, deploy the HTML with both `social-stats` comment markers intact. The updater only writes between those markers. Edit visual styles in `index.html`, and counter parsing/rendering in `scripts/update-social-stats.py`. The repository's `data/social-stats.json` is a deployment snapshot; the live server cache is authoritative between deployments.

Parser/cache tests:

```sh
python3 -m unittest discover -s tests -p 'test_social_stats.py'
```

GitHub contributions are summed from the public contribution calendar from September 1, 2026 onward (including subsequent years). They may differ from signed-in/private totals. Both the social fragment and the marked GitHub number are updated atomically. Source failures retain each last successful value.

## AI token counter (Codex + Claude)

The only counter whose source is not public: Codex and Claude Code keep usage logs on the owner's Mac. `deployment/mac/setup-ai-tokens.sh` (run once on the Mac) installs `ccusage` into `~/.eduard-ai-tokens`, creates an upload key, runs `deployment/server/setup-ai-tokens.sh` on the server over the root login, and schedules `push-ai-tokens.sh` with launchd every 3 hours. Each run sends `{"codex": N, "claude": N}` (`ccusage codex|claude daily --json` → `totals.totalTokens`).

On the server, the `tokenpush` user's only key is restricted (`restrict,command=...`) to `receive-ai-tokens.py`, which validates the two integers and atomically writes `/var/lib/eduard-ai-tokens/tokens.json`. `eduard-ai-tokens-render.path` re-renders the page between the `ai-tokens` markers on every upload; the daily stats run renders it too. A missing or invalid upload never changes the row. Totals are cumulative from the Mac's local logs, so they only update while the Mac is on, and pruning old logs lowers them.

```sh
tail ~/.eduard-ai-tokens/push.log                      # on the Mac
~/.eduard-ai-tokens/push-ai-tokens.sh --print          # on the Mac: show totals without sending
systemctl status eduard-ai-tokens-render.path          # on the server
```

To stop: on the Mac, `launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/ru.eduardkhamzin.ai-tokens.plist`; on the server, delete `/var/lib/eduard-ai-tokens/.ssh/authorized_keys`.

## Visitor autographs

Visitors sign inside a movable box opened by "Оставить автограф" (`assets/autograph.js`): drag it by its handle (or arrow keys) to place the autograph, then save. Autographs are published instantly and shown faintly behind the profile for everyone. Points are integer CSS pixels from the viewport centre, so drawings stay in place around the centred profile; on smaller screens, far-out drawings fall off the edge. Ink follows the theme colour.

`scripts/autographs.py serve` (systemd `eduard-autographs.service`, user `eduard-autographs`) listens on 127.0.0.1:8091; nginx proxies only `= /api/autographs` to it. It accepts same-site POSTs (Origin check) of at most 60 strokes / 1,200 points, keeps the newest 150, and stores them in `/var/lib/eduard-autographs/autographs.json`. Because the SNI router hides visitor IPs, rate limits are global: 20 per 10 minutes, 200 per day. It logs nothing about visitors. If the API is unreachable (e.g. workers.dev), the button stays hidden.

Install or update (from the Mac):

```sh
curl -fsSL https://raw.githubusercontent.com/edinterfaces-arch/eduardkhamzin/main/deployment/server/setup-autographs.sh | ssh root@147.45.156.6 bash -s
```

Remove unwanted autographs (from the Mac: connect, list, delete by ID, log out; times are UTC):

```sh
ssh root@147.45.156.6
sudo -u eduard-autographs python3 /usr/local/lib/eduard-site/autographs.py --data /var/lib/eduard-autographs/autographs.json list
sudo -u eduard-autographs python3 /usr/local/lib/eduard-site/autographs.py --data /var/lib/eduard-autographs/autographs.json delete ID
exit
```
