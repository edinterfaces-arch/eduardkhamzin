#!/bin/sh
set -eu
cd "$(dirname "$0")"
npx --yes wrangler@4 deploy
