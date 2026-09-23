#!/usr/bin/env bash
# HA Share 管理面板构建脚本
# 依赖：vendor/ 下已内置 esbuild 二进制与 lit node_modules（离线可用，无需 node）
# 产物：../ha_share/www/panel.js
set -euo pipefail
cd "$(dirname "$0")"

OUT="../ha_share/www/panel.js"

./vendor/bin/esbuild src/panel.js \
  --bundle \
  --format=esm \
  --minify \
  --target=es2020 \
  --outfile="$OUT"

echo "built $OUT ($(wc -c < "$OUT" | tr -d ' ') bytes)"
