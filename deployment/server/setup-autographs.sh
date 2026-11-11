#!/bin/bash
# Server setup for visitor autographs. Run as root on the server, e.g. from the Mac:
#   curl -fsSL https://raw.githubusercontent.com/edinterfaces-arch/eduardkhamzin/main/deployment/server/setup-autographs.sh | ssh root@147.45.156.6 bash -s
# Safe to re-run. Installs the API service, the nginx route and the updated page.
set -euo pipefail

RAW=https://raw.githubusercontent.com/edinterfaces-arch/eduardkhamzin/main
LIB=/usr/local/lib/eduard-site
SITE=/var/www/eduardkhamzin.ru
CONF=/etc/nginx/sites-available/eduardkhamzin.ru

fetch() {  # fetch URL DEST MODE: download to a temp file, then move into place
  local tmp
  tmp=$(mktemp "$2.XXXXXX")
  curl -fsSL "$1" -o "$tmp"
  chmod "$3" "$tmp"
  mv "$tmp" "$2"
}

echo "- Installing the autographs service"
install -d "$LIB"
fetch "$RAW/scripts/autographs.py" "$LIB/autographs.py" 755
id -u eduard-autographs >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin eduard-autographs
fetch "$RAW/deployment/eduard-autographs.service" /etc/systemd/system/eduard-autographs.service 644
systemctl daemon-reload
systemctl enable eduard-autographs.service
systemctl restart eduard-autographs.service
sleep 1
curl -fsS http://127.0.0.1:8091/api/autographs >/dev/null || { echo "Autographs service did not start" >&2; exit 1; }

echo "- Updating nginx"
[ -f /root/nginx-eduardkhamzin-before-autographs.conf ] || cp "$CONF" /root/nginx-eduardkhamzin-before-autographs.conf
cp "$CONF" "$CONF.previous"
fetch "$RAW/deployment/eduardkhamzin.ru.conf" "$CONF" 644
if ! nginx -t 2>/dev/null; then
  mv "$CONF.previous" "$CONF"
  echo "New nginx config failed its check; the old one is back in place." >&2
  exit 1
fi
rm -f "$CONF.previous"
systemctl reload nginx

echo "- Deploying the page"
install -d "$SITE/assets"
fetch "$RAW/assets/autograph.js" "$SITE/assets/autograph.js" 644
[ -f /root/index-before-autographs.html ] || cp "$SITE/index.html" /root/index-before-autographs.html
fetch "$RAW/index.html" "$SITE/index.html" 644
chown www-data:www-data "$SITE/index.html"
systemctl start eduard-ai-tokens-render.service  # restore live counters from cache

echo "Autographs are live. Manage them with:"
echo "  sudo -u eduard-autographs python3 $LIB/autographs.py --data /var/lib/eduard-autographs/autographs.json list"
