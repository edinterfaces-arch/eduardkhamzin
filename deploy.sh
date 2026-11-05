#!/bin/sh
set -eu
cd "$(dirname "$0")"
mkdir -p public
cp index.html public/index.html
npx --yes wrangler@4 deploy
