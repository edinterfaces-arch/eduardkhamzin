#!/bin/sh
# One-time Mac setup for the site's "Codex + Claude" token row. Run with:
#   sh -c "$(curl -fsSL https://raw.githubusercontent.com/edinterfaces-arch/eduardkhamzin/main/deployment/mac/setup-ai-tokens.sh)"
# (not `curl | sh`, so the password prompt and child commands keep the terminal as stdin)
# Safe to re-run. Asks for the server's root password once (server setup only);
# afterwards the Mac uploads with a key that can do nothing but send two numbers.
set -eu

RAW=https://raw.githubusercontent.com/edinterfaces-arch/eduardkhamzin/main/deployment
SERVER=147.45.156.6
DIR="$HOME/.eduard-ai-tokens"
LABEL=ru.eduardkhamzin.ai-tokens
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

NODE=$(command -v node) || { echo "Node.js is not installed. Install it from nodejs.org, then run this again."; exit 1; }
mkdir -p "$DIR"

echo "1/5 Installing ccusage..."
npm install --prefix "$DIR" --no-audit --no-fund --silent ccusage@latest
curl -fsSL "$RAW/mac/push-ai-tokens.sh" | sed "s|__NODE_DIR__|$(dirname "$NODE")|" > "$DIR/push-ai-tokens.sh"
chmod 755 "$DIR/push-ai-tokens.sh"

echo "2/5 Counting your tokens..."
"$DIR/push-ai-tokens.sh" --print

echo "3/5 Setting up the server (type your server root password if asked)..."
[ -f "$DIR/id_ed25519" ] || ssh-keygen -q -t ed25519 -N "" -C ai-tokens-upload -f "$DIR/id_ed25519"
curl -fsSL "$RAW/server/setup-ai-tokens.sh" | ssh "root@$SERVER" "PUBKEY='$(cat "$DIR/id_ed25519.pub")' bash -s"

echo "4/5 Sending the first numbers..."
"$DIR/push-ai-tokens.sh"

echo "5/5 Scheduling updates every 3 hours..."
mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/sh</string><string>$DIR/push-ai-tokens.sh</string></array>
  <key>StartInterval</key><integer>10800</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$DIR/push.log</string>
  <key>StandardErrorPath</key><string>$DIR/push.log</string>
</dict>
</plist>
EOF
launchctl bootout "gui/$(id -u)" "$PLIST" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Done. Your token row now updates every 3 hours while this Mac is on."
echo "Log: $DIR/push.log"
