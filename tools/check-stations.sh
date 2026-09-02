#!/bin/bash
# 电台流探活：从 index.html 提取所有流地址，逐个验证播放列表与首个分片可达性
# 用法: bash tools/check-stations.sh [--quick]
#   --quick 只验证播放列表，不抓分片
# 兼容 macOS 自带 bash 3.2（未使用 mapfile）
set -uo pipefail
HTML="src/data/stations.ts"
QUICK="${1:-}"
TDIR=$(mktemp -d); trap 'rm -rf "$TDIR"' EXIT

grep -oE 'https?://[^"'"'"' )]+\.(m3u8|mp3|aac)' "$HTML" | sort -u > "$TDIR/urls.txt"
TOTAL=$(wc -l < "$TDIR/urls.txt" | tr -d ' ')
[ "$TOTAL" -gt 0 ] || { echo "✗ 未在 $HTML 中找到流地址"; exit 1; }
echo "共 $TOTAL 个流地址，开始探活..."

ok=0; bad=0; badlist=""
while IFS= read -r url; do
  status="✓"
  body="$TDIR/body.bin"
  read -r pl sz < <(curl -s -o "$body" -w '%{http_code} %{size_download}' --max-time 8 "$url")
  if [ "$pl" != "200" ] || [ "${sz:-0}" -lt 32 ]; then
    status="✗ http:$pl size:${sz:-0}"
  elif head -c 7 "$body" | grep -q '#EXTM3U'; then
    if [ "$QUICK" != "--quick" ]; then
      seg=$(grep -v '^#' "$body" | grep -v '^$' | head -1)
      case "$seg" in
        http*) segurl="${seg/http:\/\//https:\/\//}" ;;   # http 分片按 https 探测（对应浏览器自动升级）
        *) segurl="${url%/*}/$seg" ;;
      esac
      sc=$(curl -s -o /dev/null -w '%{http_code}' --max-time 6 -r 0-2047 "$segurl")
      case "$sc" in 200|206) ;; *) status="✗ segment:$sc" ;; esac
    fi
  fi
  if [ "$status" = "✓" ]; then ok=$((ok+1)); else bad=$((bad+1)); badlist="$badlist\n  $status  $url"; fi
  sleep 0.3
done < "$TDIR/urls.txt"

echo "存活 $ok / $TOTAL"
if [ $bad -gt 0 ]; then printf '失效:%b\n' "$badlist"; exit 2; fi
