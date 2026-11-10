#!/bin/sh
# Counts Codex + Claude Code tokens with ccusage and sends the totals to the site
# server. Installed to ~/.eduard-ai-tokens by setup-ai-tokens.sh; launchd runs it
# every 3 hours. `--print` shows the totals without sending them.
set -eu

DIR="$HOME/.eduard-ai-tokens"
SERVER=147.45.156.6
export PATH="__NODE_DIR__:/usr/bin:/bin"

total() {
  "$DIR/node_modules/.bin/ccusage" "$1" daily --json | node -e '
    let s = "";
    process.stdin.on("data", (d) => (s += d)).on("end", () => {
      let n;
      try { n = JSON.parse(s).totals.totalTokens; } catch {}
      if (!Number.isSafeInteger(n) || n < 0) {
        console.error("ccusage returned no token total for " + process.argv[1]);
        process.exit(1);
      }
      console.log(n);
    });' "$1"
}

CODEX=$(total codex)
CLAUDE=$(total claude)
PAYLOAD=$(printf '{"codex":%s,"claude":%s}' "$CODEX" "$CLAUDE")

if [ "${1:-}" = --print ]; then
  echo "Codex: $CODEX tokens, Claude Code: $CLAUDE tokens"
  exit 0
fi

printf '%s\n' "$PAYLOAD" | ssh -i "$DIR/id_ed25519" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=accept-new \
  -o ConnectTimeout=20 "tokenpush@$SERVER"
echo "$(date '+%Y-%m-%d %H:%M:%S') sent $PAYLOAD"
