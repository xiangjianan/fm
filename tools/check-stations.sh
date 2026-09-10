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

ok=0; bad=0; warn=0; warnlist=""; badlist=""
check_url() {  # 单地址探活：播放列表 + 首分片（返回状态字符串，✓ 为通过）
  local url="$1" pl sz seg segurl seghttp sc rest proto
  local body="$TDIR/body.bin"
  read -r pl sz < <(curl -s -o "$body" -w '%{http_code} %{size_download}' --max-time 8 "$url")
  if [ "$pl" != "200" ] || [ "${sz:-0}" -lt 32 ]; then echo "✗ http:$pl size:${sz:-0}"; return; fi
  head -c 7 "$body" | grep -q '#EXTM3U' || { echo "✓"; return; }   # mp3/aac 渐进流
  [ "$QUICK" = "--quick" ] && { echo "✓"; return; }
  seg=$(grep -v '^#' "$body" | grep -v '^$' | head -1)
  seghttp=""
  rest="${url#*://}"; proto="${url%%://*}"
  case "$seg" in
    http*) segurl="${seg/http:\/\//https:\/\//}"; seghttp="$seg" ;;  # 先按 https 探，失败回退原始 http
    /*) segurl="$proto://${rest%%/*}$seg"; seghttp="" ;;
    *) segurl="${url%/*}/$seg"; seghttp="" ;;
  esac
  sc=$(curl -s -o /dev/null -w '%{http_code}' --max-time 6 -r 0-2047 "$segurl")
  if [ "$sc" != "200" ] && [ "$sc" != "206" ] && [ -n "$seghttp" ]; then
    sc=$(curl -s -o /dev/null -w '%{http_code}' --max-time 6 "$seghttp")  # xmcdn 分片主机无 TLS 且不支持 Range
  fi
  case "$sc" in
    200|206) echo "✓" ;;
    000) echo "⚠ seg:000（分片网络不可达，playlist 正常）" ;;  # 代理网络对 xmcdn 分片主机路由不稳
    *) echo "✗ segment:$sc" ;;
  esac
}
while IFS= read -r url; do
  status=$(check_url "$url")
  if [ "$status" != "✓" ]; then                       # CDN 间歇抖动：隔 2s 复测一次再判死
    sleep 2
    status=$(check_url "$url")
  fi
  case "$status" in
    ✓) ok=$((ok+1)) ;;
    ⚠*) warn=$((warn+1)); warnlist="$warnlist\n  $url" ;;
    *) bad=$((bad+1)); badlist="$badlist\n  $status  $url" ;;
  esac
  sleep 0.3
done < "$TDIR/urls.txt"

echo "存活 $ok / $TOTAL（告警 $warn）"
[ $warn -gt 0 ] && printf '告警(仅播放列表可达):%b\n' "$warnlist"
if [ $bad -gt 0 ]; then printf '失效:%b\n' "$badlist"; exit 2; fi
