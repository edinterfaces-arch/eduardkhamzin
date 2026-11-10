#!/bin/bash
# One-time server setup for automatic AI token updates. Run as root with the
# laptop's public key in PUBKEY; deployment/mac/setup-ai-tokens.sh does this over SSH.
#
# Creates the `tokenpush` user whose only SSH key may run receive-ai-tokens.py,
# installs the updated stats scripts and systemd units, and deploys the page
# template from main (the live counters are re-rendered from the server cache).
set -euo pipefail

RAW=https://raw.githubusercontent.com/edinterfaces-arch/eduardkhamzin/main
LIB=/usr/local/lib/eduard-site
DATA=/var/lib/eduard-ai-tokens
SITE=/var/www/eduardkhamzin.ru

: "${PUBKEY:?PUBKEY is not set}"
case "$PUBKEY" in
  ssh-ed25519\ *) ;;
  *) echo "PUBKEY is not an ed25519 public key" >&2; exit 1 ;;
esac

fetch() {  # fetch URL DEST MODE: download to a temp file, then move into place
  local tmp
  tmp=$(mktemp "$2.XXXXXX")
  curl -fsSL "$1" -o "$tmp"
  chmod "$3" "$tmp"
  mv "$tmp" "$2"
}

echo "- Installing stats scripts"
install -d "$LIB"
fetch "$RAW/scripts/update-social-stats.py" "$LIB/update-social-stats.py" 755
fetch "$RAW/scripts/receive-ai-tokens.py" "$LIB/receive-ai-tokens.py" 755

echo "- Creating the upload-only user"
id -u tokenpush >/dev/null 2>&1 || useradd --system --home-dir "$DATA" --create-home --shell /bin/sh tokenpush
usermod -p '*' tokenpush  # no password login; key only
chown tokenpush:tokenpush "$DATA"
chmod 755 "$DATA"
install -d -m 700 -o tokenpush -g tokenpush "$DATA/.ssh"
printf 'restrict,command="/usr/bin/python3 %s/receive-ai-tokens.py --out %s/tokens.json" %s\n' \
  "$LIB" "$DATA" "$PUBKEY" > "$DATA/.ssh/authorized_keys"
chown tokenpush:tokenpush "$DATA/.ssh/authorized_keys"
chmod 600 "$DATA/.ssh/authorized_keys"
if sshd -T 2>/dev/null | grep -qiE '^(allowusers|allowgroups) '; then
  echo "  WARNING: sshd has AllowUsers/AllowGroups set; add tokenpush there or uploads will be refused." >&2
fi

echo "- Installing systemd units"
for unit in eduard-social-stats.service eduard-ai-tokens-render.service eduard-ai-tokens-render.path; do
  fetch "$RAW/deployment/$unit" "/etc/systemd/system/$unit" 644
done
systemctl daemon-reload
systemctl enable --now eduard-ai-tokens-render.path

echo "- Deploying the page template"
[ -f /root/index-before-ai-tokens.html ] || cp "$SITE/index.html" /root/index-before-ai-tokens.html
fetch "$RAW/index.html" "$SITE/index.html" 644
chown www-data:www-data "$SITE/index.html"
systemctl start eduard-ai-tokens-render.service  # restore live counters from cache

echo "Server ready. Old page backed up to /root/index-before-ai-tokens.html"
