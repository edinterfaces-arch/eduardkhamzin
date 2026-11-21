# Archived: visitor autographs ("Оставить автограф")

Archived on 2026-11-21. The feature is no longer on the site; its code is kept here unchanged.

Visitors signed inside a movable box opened by "Оставить автограф", dragged it by its handle (or arrow keys) to place it, then saved. Autographs were published instantly and shown faintly behind the profile for everyone.

## What is here

- `assets/autograph.js`: the browser side (drawing box, background rendering).
- `scripts/autographs.py`: stdlib API on 127.0.0.1:8091 (`serve`, `list`, `delete ID...`, `clear`). Same-site POSTs only, at most 60 strokes / 1,200 points, newest 150 kept, global rate limits 20 per 10 minutes and 200 per day. Data lived in `/var/lib/eduard-autographs/autographs.json`.
- `deployment/eduard-autographs.service`: systemd unit (user `eduard-autographs`).
- `deployment/server/setup-autographs.sh`: server installer. Its download URLs point at the old, pre-archive paths on `main`.
- `tests/test_autographs.py`: API tests (`python3 -m unittest discover -s archive/autographs/tests -p 'test_autographs.py'`).

The last live version of the whole feature is commit `d560585` on `main`.

## Turning it off on the server

The site stops showing the button as soon as the new `index.html` is deployed. To also stop the backend (from the Mac):

```sh
ssh root@147.45.156.6
systemctl disable --now eduard-autographs.service
```

Then remove the `location = /api/autographs { ... }` block (and `connect-src 'self';` from the CSP) in the live nginx config, run `nginx -t`, and `systemctl reload nginx`. The installer saved the pre-feature config as `/root/nginx-eduardkhamzin-before-autographs.conf`. Saved autographs stay in `/var/lib/eduard-autographs/` until you delete that directory.

## Restoring

`git revert` the archiving commit, or move the files back to their original paths and re-add the markup, styles, `<script src="/assets/autograph.js">`, nginx location and `connect-src 'self'` from commit `d560585`.
