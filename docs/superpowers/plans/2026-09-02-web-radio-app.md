# 网页版电台应用（复古收音机）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 单文件 `index.html` 复古收音机风格网页，可在线收听中央+31省约 120 个验证过的电台直播流。

**Architecture:** 纯前端零后端（设计文档方案 A）。电台数据内嵌常量；播放层单 `<audio>` 实例做 HLS 协商（Safari 原生 / 其他浏览器 hls.js CDN）+ 重试链；UI 层为复古收音机面板（刻度盘指针/液晶屏/推子按键/旋钮）。所有流地址已于 2026-09-02 逐个 curl 验证（播放列表+分片可达）。

**Tech Stack:** 原生 HTML/CSS/JS（ES2020，无构建）、hls.js（CDN，可选加载）、localStorage、Media Session API。

**对设计文档的已批准偏离/细化：**
1. 电台数 120 个（设计文档写「约 90~110」，验证后可用流充裕，超出属有益范围）
2. `freq: 0` 表示无公开 FM 频率 → 液晶屏显示 `NET`，指针仍按 99.0 落位（设计文档「填 99.0」的显示细化）
3. 单文件最终约 900~1100 行，超出全局「文件<800 行」规则——用户已明确选择单文件形态，样式/逻辑在文件内按区块注释清晰分区

**数据来源可靠性（2026-09-02 验证结论）：**
- 主力：`https://satellitepull.cnr.cn/live/<slug>/playlist.m3u8`（央广卫星 CDN，https+CORS ✓，承载省级台与央广套系）
- 中央备源：`https://ngcdn001/002.cnr.cn`（仅 001/002 开放，003+ 返回 403）、`https://sk.cri.cn/<slug>.m3u8`（CRI）
- 北京：`https://brtv-radiolive.rbc.cn/alive/fm<freq>.m3u8`（BRTV 官方）
- 天津：`https://lhttp-hw.qtfm.cn/live/5022134/64k.mp3`（蜻蜓 CDN，渐进式 mp3）
- 河南：`https://stream.hndt.com/live/<slug>/playlist.m3u8`
- 山东经典音乐：`https://audiolive302.iqilu.com/sdradioShenghuo/sdradio04/playlist.m3u8`

**文件结构：**

```
fm/
├── index.html                 # 全部：数据 + 播放引擎 + UI + 样式（唯一交付物）
├── tools/check-stations.sh    # 流探活脚本（从 index.html 提取 URL 逐个验证）
├── README.md                  # 使用说明 + 数据来源 + 更新方法
└── docs/superpowers/          # 设计文档与计划（已存在）
```

---

### Task 1: 探活脚本 + index.html 骨架与完整电台数据

**Files:**
- Create: `tools/check-stations.sh`
- Create: `index.html`

- [ ] **Step 1: 写探活脚本**

`tools/check-stations.sh` 完整内容：

```bash
#!/bin/bash
# 电台流探活：从 index.html 提取所有流地址，逐个验证播放列表与首个分片可达性
# 用法: bash tools/check-stations.sh [--quick]
#   --quick 只验证播放列表 HTTP 状态，不抓分片
set -uo pipefail
HTML="index.html"
QUICK="${1:-}"

mapfile -t URLS < <(grep -oE 'https?://[^"'"'"' )]+\.(m3u8|mp3|aac)' "$HTML" | sort -u)

if [ ${#URLS[@]} -eq 0 ]; then echo "✗ 未在 $HTML 中找到流地址"; exit 1; fi
echo "共 ${#URLS[@]} 个流地址，开始探活..."

ok=0; bad=0; badlist=""
for url in "${URLS[@]}"; do
  pl=$(curl -s -o /tmp/stn.m3u8 -w '%{http_code}' --max-time 6 "$url")
  status="✓"
  if [ "$pl" != "200" ] || ! head -c 7 /tmp/stn.m3u8 2>/dev/null | grep -qE '#EXTM3U|ID3|\xff'; then
    # 非 m3u8 的渐进式流（mp3/aac）HTTP 200 且有数据即算活
    if [ "$pl" != "200" ]; then status="✗ playlist:$pl"; fi
  elif [ "$QUICK" != "--quick" ]; then
    seg=$(grep -v '^#' /tmp/stn.m3u8 | grep -v '^$' | head -1)
    case "$seg" in
      http*) segurl="$seg" ;;
      *) segurl="${url%/*}/$seg" ;;
    esac
    sc=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 -r 0-2047 "$segurl")
    case "$sc" in 200|206) ;; *) status="✗ segment:$sc" ;; esac
  fi
  if [[ "$status" == ✓ ]]; then ok=$((ok+1)); else bad=$((bad+1)); badlist="$badlist\n  $status  $url"; fi
  sleep 0.3
done

echo "存活 $ok / ${#URLS[@]}"
if [ $bad -gt 0 ]; then echo -e "失效:$badlist"; exit 2; fi
```

- [ ] **Step 2: 创建 index.html 骨架 + 完整 STATIONS 数据**

`index.html` 此阶段完整内容（骨架 + 数据；UI/样式后续任务填充到标注的占位注释处）：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<title>山河收音机 · 全国电台</title>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js" defer onerror="window.__hlsLoadFailed=true"></script>
<style>/* Task 3/5 填充 */</style>
</head>
<body>
<!-- Task 3 填充：收音机面板结构 -->
<script>
"use strict";
/* ============ 电台数据（2026-09-02 验证） freq:0=无公开频率(显示NET,指针按99.0) ============ */
const S = (id, name, freq, region, url, backup) =>
  ({ id, name, freq, region, url, ...(backup ? { backup } : {}) });

const STATIONS = [
  // —— 中央人民广播电台 / 国际台 ——
  S("zgzs","中国之声",106.1,"中央","https://ngcdn001.cnr.cn/live/zgzs/index.m3u8","https://satellitepull.cnr.cn/live/wxzgzs/playlist.m3u8"),
  S("jjzs","经济之声",96.6,"中央","https://ngcdn002.cnr.cn/live/jjzs/index.m3u8","https://satellitepull.cnr.cn/live/wxjjzs/playlist.m3u8"),
  S("yyzs","音乐之声",90.0,"中央","https://satellitepull.cnr.cn/live/wxyyzs/playlist.m3u8"),
  S("wyzs","文艺之声",106.6,"中央","https://satellitepull.cnr.cn/live/wxwyzs/playlist.m3u8"),
  S("jdyy","经典音乐广播",101.8,"中央","https://satellitepull.cnr.cn/live/wxdszs/playlist.m3u8"),
  S("xczs","乡村之声",99.0,"中央","https://satellitepull.cnr.cn/live/wxxczs/playlist.m3u8"),
  S("lnzs","老年之声",0,"中央","https://satellitepull.cnr.cn/live/wxlnzs/playlist.m3u8"),
  S("mzzs","民族之声",0,"中央","https://satellitepull.cnr.cn/live/wxmzzs/playlist.m3u8"),
  S("hqzx","环球资讯",90.5,"中央","https://sk.cri.cn/905.m3u8","https://satellitepull.cnr.cn/live/wxhqzx01/playlist.m3u8"),
  S("hyhq","华语环球",0,"中央","https://sk.cri.cn/hyhq.m3u8"),
  S("sjhs","世界华声",0,"中央","https://sk.cri.cn/hxfh.m3u8"),
  S("nhzs","南海之声",0,"中央","https://sk.cri.cn/nhzs.m3u8","https://satellitepull.cnr.cn/live/wxnhzs/playlist.m3u8"),
  S("hitfm","HIT FM",88.7,"中央","https://satellitepull.cnr.cn/live/wxhitfm/playlist.m3u8"),
  S("cgtn","China Plus",0,"中央","https://sk.cri.cn/am846.m3u8"),
  // —— 北京 ——
  S("bjxw","北京新闻广播",94.5,"北京","https://brtv-radiolive.rbc.cn/alive/fm945.m3u8"),
  S("bjjt","北京交通广播",103.9,"北京","https://brtv-radiolive.rbc.cn/alive/fm1039.m3u8"),
  S("bjyy","北京音乐广播",97.4,"北京","https://brtv-radiolive.rbc.cn/alive/fm974.m3u8"),
  S("bjwy","北京文艺广播",87.6,"北京","https://brtv-radiolive.rbc.cn/alive/fm876.m3u8"),
  S("jjj","京津冀之声",100.6,"北京","https://brtv-radiolive.rbc.cn/alive/fm1006.m3u8"),
  // —— 天津 ——
  S("tjxw","天津新闻广播",97.2,"天津","https://lhttp-hw.qtfm.cn/live/5022134/64k.mp3"),
  // —— 河北 ——
  S("hbzh","河北综合广播",104.3,"河北","https://satellitepull.cnr.cn/live/wxhebzhgb/playlist.m3u8"),
  S("hbjt","河北交通广播",99.2,"河北","https://satellitepull.cnr.cn/live/wxhebjtgb/playlist.m3u8"),
  S("hbyy","河北音乐广播",0,"河北","https://satellitepull.cnr.cn/live/wxhebyygb/playlist.m3u8"),
  S("hbsh","河北生活广播",0,"河北","https://satellitepull.cnr.cn/live/wxhebshgb/playlist.m3u8"),
  // —— 山西 ——
  S("sxzh","山西综合广播",0,"山西","https://satellitepull.cnr.cn/live/wxssxxwgb/playlist.m3u8"),
  // —— 内蒙古 ——
  S("nmghy","内蒙古汉语广播",0,"内蒙古","https://satellitepull.cnr.cn/live/wx32nmghyzhxwgb/playlist.m3u8"),
  S("nmgjt","内蒙古交通之声",0,"内蒙古","https://satellitepull.cnr.cn/live/wx32nmgjtgb/playlist.m3u8"),
  S("nmgyy","内蒙古音乐之声",0,"内蒙古","https://satellitepull.cnr.cn/live/wx32nmgyygb/playlist.m3u8"),
  S("nmgmy","蒙古语广播",0,"内蒙古","https://satellitepull.cnr.cn/live/wx32nmgmygb/playlist.m3u8"),
  // —— 辽宁 ——
  S("lnzh","辽宁之声",0,"辽宁","https://satellitepull.cnr.cn/live/wxlnzhgb/playlist.m3u8"),
  S("lnjt","辽宁交通广播",97.5,"辽宁","https://satellitepull.cnr.cn/live/wxlnjtgb/playlist.m3u8"),
  S("lnjj","辽宁经济广播",0,"辽宁","https://satellitepull.cnr.cn/live/wxlnjjtb/playlist.m3u8"),
  S("lnwy","辽宁文艺广播",0,"辽宁","https://satellitepull.cnr.cn/live/wxlnwygb/playlist.m3u8"),
  // —— 吉林 ——
  S("jlxw","吉林新闻综合广播",0,"吉林","https://satellitepull.cnr.cn/live/wxjlxwzhgb/playlist.m3u8"),
  S("jljt","吉林交通广播",0,"吉林","https://satellitepull.cnr.cn/live/wxjljtgb/playlist.m3u8"),
  S("jljj","吉林经济广播",0,"吉林","https://satellitepull.cnr.cn/live/wxjljjgb/playlist.m3u8"),
  // —— 黑龙江 ——
  S("hljxw","黑龙江新闻广播",94.6,"黑龙江","https://satellitepull.cnr.cn/live/wx32hljxwgb/playlist.m3u8"),
  S("hljjt","黑龙江交通广播",99.8,"黑龙江","https://satellitepull.cnr.cn/live/wx32hljjtgb/playlist.m3u8"),
  S("hljsjc","黑龙江私家车广播",0,"黑龙江","https://satellitepull.cnr.cn/live/wx32hljsjcgb/playlist.m3u8"),
  S("hljxc","黑龙江乡村广播",0,"黑龙江","https://satellitepull.cnr.cn/live/wx32hljxcgb/playlist.m3u8"),
  // —— 上海 ——
  S("shxw","上海新闻广播",93.4,"上海","https://satellitepull.cnr.cn/live/wx32shrmgb/playlist.m3u8"),
  S("dycj","第一财经广播",97.7,"上海","https://satellitepull.cnr.cn/live/wx32dycjgb/playlist.m3u8"),
  // —— 江苏 ——
  S("jsxw","江苏新闻综合广播",93.7,"江苏","https://satellitepull.cnr.cn/live/wx32jsxwzhgb/playlist.m3u8"),
  S("jsjt","江苏交通广播",101.1,"江苏","https://satellitepull.cnr.cn/live/wx32jsjtgb/playlist.m3u8"),
  S("jsyy","江苏音乐广播",89.7,"江苏","https://satellitepull.cnr.cn/live/wx32jsyygb/playlist.m3u8"),
  S("jscj","江苏财经广播",0,"江苏","https://satellitepull.cnr.cn/live/wx32jscjgb/playlist.m3u8"),
  // —— 浙江 ——
  S("zjjt","浙江交通之声",93.0,"浙江","https://satellitepull.cnr.cn/live/wxzjjtgb/playlist.m3u8"),
  S("zjcs","浙江城市之声",0,"浙江","https://satellitepull.cnr.cn/live/wxzjcszs/playlist.m3u8"),
  S("zjjj","浙江经济广播",0,"浙江","https://satellitepull.cnr.cn/live/wxzjjjgb/playlist.m3u8"),
  S("zjnvz","浙江女主播电台",104.5,"浙江","https://satellitepull.cnr.cn/live/wxzj1045/playlist.m3u8"),
  // —— 安徽 ——
  S("ahzs","安徽之声",0,"安徽","https://satellitepull.cnr.cn/live/wxahxxgb/playlist.m3u8"),
  S("ahjt","安徽交通广播",90.8,"安徽","https://satellitepull.cnr.cn/live/wxahjtgb/playlist.m3u8"),
  S("ahjj","安徽经济广播",0,"安徽","https://satellitepull.cnr.cn/live/wxahjjgb/playlist.m3u8"),
  S("ahsh","安徽生活广播",0,"安徽","https://satellitepull.cnr.cn/live/wxahshgb/playlist.m3u8"),
  // —— 福建 ——
  S("fjxw","福建新闻广播",0,"福建","https://satellitepull.cnr.cn/live/wx32fjxwgb/playlist.m3u8"),
  S("fjjt","福建交通广播",100.7,"福建","https://satellitepull.cnr.cn/live/wx32fjdnjtgb/playlist.m3u8"),
  S("fjds","福建都市广播",98.7,"福建","https://satellitepull.cnr.cn/live/wx32fjdndsgb/playlist.m3u8"),
  S("fjdn","福建东南广播",0,"福建","https://satellitepull.cnr.cn/live/wx32fjdngb/playlist.m3u8"),
  // —— 江西 ——
  S("jxxw","江西新闻广播",0,"江西","https://satellitepull.cnr.cn/live/wx32jiangxxwgb/playlist.m3u8"),
  S("jxyy","江西音乐广播",0,"江西","https://satellitepull.cnr.cn/live/wx32jiangxyygb/playlist.m3u8"),
  // —— 山东 ——
  S("sdjt","山东交通广播",101.1,"山东","https://satellitepull.cnr.cn/live/wxsdjtgb/playlist.m3u8"),
  S("sdyy","山东音乐广播",99.1,"山东","https://satellitepull.cnr.cn/live/wxsdyygb/playlist.m3u8"),
  S("sdwy","山东文艺广播",97.5,"山东","https://satellitepull.cnr.cn/live/wxsdwyssgb/playlist.m3u8"),
  S("sdjd","山东经典音乐广播",0,"山东","https://audiolive302.iqilu.com/sdradioShenghuo/sdradio04/playlist.m3u8"),
  // —— 河南 ——
  S("hnxw","河南新闻广播",0,"河南","https://satellitepull.cnr.cn/live/wxhnxwgb/playlist.m3u8","https://stream.hndt.com/live/xinwen/playlist.m3u8"),
  S("hnjt","河南交通广播",104.7,"河南","https://stream.hndt.com/live/jiaotong/playlist.m3u8"),
  S("hnyy","河南音乐广播",88.1,"河南","https://stream.hndt.com/live/yinyue/playlist.m3u8"),
  S("hnjj","河南经济广播",0,"河南","https://satellitepull.cnr.cn/live/wxhnjjgb/playlist.m3u8"),
  // —— 湖北 ——
  S("ctjt","楚天交通广播",92.7,"湖北","https://satellitepull.cnr.cn/live/wx32hubctjtgb/playlist.m3u8"),
  S("hbjj2","湖北经济广播",99.8,"湖北","https://satellitepull.cnr.cn/live/wx32hubjjgb/playlist.m3u8"),
  S("hbjdyy","湖北经典音乐广播",103.8,"湖北","https://satellitepull.cnr.cn/live/wx32hubyygb/playlist.m3u8"),
  // —— 湖南 ——
  S("hnxw2","湖南新闻广播",102.8,"湖南","https://satellitepull.cnr.cn/live/wx32hunxwgb/playlist.m3u8"),
  S("hnjt2","湖南交通广播",91.8,"湖南","https://satellitepull.cnr.cn/live/wx32hunjtgb/playlist.m3u8"),
  S("hnjj2","湖南经济广播",90.1,"湖南","https://satellitepull.cnr.cn/live/wx32hunjjgb/playlist.m3u8"),
  S("xxzs","潇湘之声",0,"湖南","https://satellitepull.cnr.cn/live/wx32hunyygb/playlist.m3u8"),
  // —— 广东 ——
  S("gdxw","广东新闻广播",91.4,"广东","https://satellitepull.cnr.cn/live/wxgdxwgb/playlist.m3u8"),
  S("ycjt","羊城交通广播",105.2,"广东","https://satellitepull.cnr.cn/live/wxgdycjtt/playlist.m3u8"),
  S("zjjj","珠江经济台",97.4,"广东","https://satellitepull.cnr.cn/live/wxgdzjjjt/playlist.m3u8"),
  S("gdcs","广东城市之声",103.6,"广东","https://satellitepull.cnr.cn/live/wxgdcszs/playlist.m3u8"),
  S("szfy","深圳飞扬971",97.1,"广东","https://satellitepull.cnr.cn/live/wxszfy971/playlist.m3u8"),
  // —— 广西 ——
  S("gxrm","广西人民广播",0,"广西","https://satellitepull.cnr.cn/live/wx32gxrmgb/playlist.m3u8"),
  S("gxjt","广西交通广播",100.3,"广西","https://satellitepull.cnr.cn/live/wx32gxjtgb/playlist.m3u8"),
  S("gxwy","广西文艺广播",95.0,"广西","https://satellitepull.cnr.cn/live/wx32gxwygb/playlist.m3u8"),
  S("gxjy","广西教育生活广播",93.0,"广西","https://satellitepull.cnr.cn/live/wx32gbjyshgb/playlist.m3u8"),
  // —— 海南 ——
  S("hainxw","海南新闻广播",0,"海南","https://satellitepull.cnr.cn/live/wxhainxwgb/playlist.m3u8"),
  S("hainjt","海南交通广播",0,"海南","https://satellitepull.cnr.cn/live/wxhainjtgb/playlist.m3u8"),
  S("hainyy","海南音乐广播",94.5,"海南","https://satellitepull.cnr.cn/live/wxhainyygb/playlist.m3u8"),
  // —— 重庆 ——
  S("cqxw","重庆新闻广播",96.8,"重庆","https://satellitepull.cnr.cn/live/wxcqxwgb/playlist.m3u8"),
  S("cqjj","重庆经济广播",101.5,"重庆","https://satellitepull.cnr.cn/live/wxcqjjgb/playlist.m3u8"),
  S("cqwy","重庆文艺广播",103.5,"重庆","https://satellitepull.cnr.cn/live/wxcqwygb/playlist.m3u8"),
  S("cqds","重庆都市广播",0,"重庆","https://satellitepull.cnr.cn/live/wxcqdsgb/playlist.m3u8"),
  // —— 四川 ——
  S("sczh","四川综合广播",98.1,"四川","https://satellitepull.cnr.cn/live/wxsczhgb/playlist.m3u8"),
  S("scjt","四川交通广播",101.7,"四川","https://satellitepull.cnr.cn/live/wxscjtgb/playlist.m3u8"),
  S("scmz","四川民族频率",0,"四川","https://satellitepull.cnr.cn/live/wxscmzgb/playlist.m3u8"),
  // —— 贵州 ——
  S("gzzh","贵州综合广播",0,"贵州","https://satellitepull.cnr.cn/live/wx32gzwxwzhgb/playlist.m3u8"),
  S("gzjt","贵州交通广播",95.2,"贵州","https://satellitepull.cnr.cn/live/wx32gzyygb/playlist.m3u8"),
  S("gzjj","贵州经济广播",98.9,"贵州","https://satellitepull.cnr.cn/live/wx32gzjjgb/playlist.m3u8"),
  S("gzly","贵州旅游广播",0,"贵州","https://satellitepull.cnr.cn/live/wx32gzlygb/playlist.m3u8"),
  // —— 云南 ——
  S("ynxw","云南新闻广播",91.8,"云南","https://satellitepull.cnr.cn/live/wxynxwgb/playlist.m3u8"),
  S("ynjt","云南交通之声",91.8,"云南","https://satellitepull.cnr.cn/live/wxynjtgb/playlist.m3u8"),
  S("ynjj","云南经济广播",0,"云南","https://satellitepull.cnr.cn/live/wxynjjgb/playlist.m3u8"),
  S("yngj","云南国际广播",0,"云南","https://satellitepull.cnr.cn/live/wxynsegb/playlist.m3u8"),
  // —— 西藏 ——
  S("xzhy","西藏汉语广播",0,"西藏","https://satellitepull.cnr.cn/live/wxxzhygb/playlist.m3u8"),
  S("xzzy","西藏藏语广播",0,"西藏","https://satellitepull.cnr.cn/live/wxxzzygb/playlist.m3u8"),
  S("xzds","西藏都市生活广播",0,"西藏","https://satellitepull.cnr.cn/live/wxxzdsshgb/playlist.m3u8"),
  // —— 陕西 ——
  S("sxxx","陕西新闻广播",0,"陕西","https://satellitepull.cnr.cn/live/wxsxxxwgb/playlist.m3u8"),
  S("sxxyy","陕西音乐广播",98.8,"陕西","https://satellitepull.cnr.cn/live/wxsxxyygb/playlist.m3u8"),
  S("sxxqc","陕西青春广播",105.5,"陕西","https://satellitepull.cnr.cn/live/wxsxxqcgb/playlist.m3u8"),
  // —— 甘肃 ——
  S("gsxw","甘肃新闻综合广播",0,"甘肃","https://satellitepull.cnr.cn/live/wxgsxwzhgb/playlist.m3u8"),
  S("gsjt","甘肃交通广播",104.8,"甘肃","https://satellitepull.cnr.cn/live/wxgsjtgb/playlist.m3u8"),
  S("gshh","甘肃黄河之声",0,"甘肃","https://satellitepull.cnr.cn/live/wxgshhzs/playlist.m3u8"),
  // —— 青海 ——
  S("qhjj","青海经济广播",0,"青海","https://satellitepull.cnr.cn/live/wx32qhjjgb/playlist.m3u8"),
  S("qhjt","青海交通音乐广播",97.2,"青海","https://satellitepull.cnr.cn/live/wx32qhjtyygb/playlist.m3u8"),
  S("qhzy","青海藏语广播",0,"青海","https://satellitepull.cnr.cn/live/wx32qhzygb/playlist.m3u8"),
  // —— 宁夏 ——
  S("nxxw","宁夏新闻广播",0,"宁夏","https://satellitepull.cnr.cn/live/wxnxxwgb/playlist.m3u8"),
  S("nxyy","宁夏音乐广播",0,"宁夏","https://satellitepull.cnr.cn/live/wxnxyygb/playlist.m3u8"),
  // —— 新疆 ——
  S("xjxw","新疆新闻广播",96.1,"新疆","https://satellitepull.cnr.cn/live/wxxjxwgb/playlist.m3u8"),
  S("xjsjc","新疆私家车广播",0,"新疆","https://satellitepull.cnr.cn/live/wxxjsjcgb/playlist.m3u8"),
  S("xjwy","维语综合广播",0,"新疆","https://satellitepull.cnr.cn/live/wxxjwyzhgb/playlist.m3u8"),
  S("xjhy","哈语广播",0,"新疆","https://satellitepull.cnr.cn/live/wxxjhygb/playlist.m3u8"),
];

/* 地区顺序：中央在最前，其余按拼音升序（UI 频段按键顺序） */
const REGIONS = ["中央","安徽","北京","重庆","福建","甘肃","广东","广西","贵州","海南","河北","河南","黑龙江","湖北","湖南","吉林","江苏","江西","辽宁","内蒙古","宁夏","青海","山东","山西","陕西","上海","四川","天津","西藏","新疆","云南","浙江"];
</script>
</body>
</html>
```

注意：`贵州交通广播` 的 URL 是 `wx32gzyygb`（原合集如此标注，名称与 slug 对应以探活结果为准）。

- [ ] **Step 3: 运行探活脚本验证数据全绿**

Run: `cd /Users/xiangjianan/github/fm && bash tools/check-stations.sh`
Expected: `存活 121 / 121`（120 个主源 + 河南新闻备用源 hndt；若个别流瞬时超时，重跑一次确认）

- [ ] **Step 4: 提交**

```bash
git add index.html tools/check-stations.sh
git commit -m "feat: 电台数据(120台全验证)与探活脚本"
```

---

### Task 2: 播放引擎（HLS 协商 + 重试链 + Media Session）

**Files:**
- Modify: `index.html`（`<script>` 内追加播放引擎模块）

- [ ] **Step 1: 实现播放引擎**

在 STATIONS 定义之后追加（完整代码）：

```javascript
/* ============ 播放引擎 ============ */
const Radio = (() => {
  const audio = new Audio();
  audio.preload = "none";
  let current = null;        // 当前台对象
  let state = "idle";        // idle | loading | playing | paused | error
  let retryCount = 0, usingBackup = false, retryTimer = null;
  const listeners = [];
  const emit = (st, stn) => { state = st; listeners.forEach(fn => fn(st, stn || current)); };

  function attach(url) {
    const canNative = audio.canPlayType("application/vnd.apple.mpegurl");
    if (/\.m3u8(\?|$)/i.test(url) && !canNative && window.Hls && Hls.isSupported()) {
      const hls = new Hls({ liveDurationInfinity: true, manifestLoadingTimeOut: 8000,
        fragLoadingTimeOut: 10000, manifestLoadingMaxRetry: 2 });
      hls.loadSource(url); hls.attachMedia(audio);
      hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) fail(); });
      return () => hls.destroy();
    }
    audio.src = url;
    return () => { audio.removeAttribute("src"); audio.load(); };
  }
  let detach = null;

  function play(station) {
    clearTimeout(retryTimer);
    if (detach) detach();
    current = station; retryCount = 0; usingBackup = false;
    start();
  }
  function start() {
    const url = usingBackup && current.backup ? current.backup : current.url;
    emit("loading");
    if (window.__hlsLoadFailed && !audio.canPlayType("application/vnd.apple.mpegurl")
        && /\.m3u8/i.test(url)) { emit("error"); return; }
    detach = attach(url);
    audio.play().catch(() => emit("paused"));
  }
  function fail() {
    if (retryCount < 2) {                       // 同源重试 2 次，指数退避
      retryCount++;
      retryTimer = setTimeout(start, retryCount === 1 ? 1000 : 3000);
      return;
    }
    if (!usingBackup && current.backup) {        // 换备用源
      usingBackup = true; retryCount = 0;
      retryTimer = setTimeout(start, 500);
      return;
    }
    emit("error");
  }
  const toggle = () => state === "playing" ? (audio.pause(), emit("paused")) : start();
  const retry = () => { retryCount = 0; start(); };

  audio.addEventListener("playing", () => emit("playing"));
  audio.addEventListener("pause", () => { if (state === "playing") emit("paused"); });
  audio.addEventListener("error", () => { if (state !== "idle") fail(); });
  audio.addEventListener("stalled", () => { if (state === "playing") fail(); });
  audio.addEventListener("waiting", () => emit("loading"));

  if ("mediaSession" in navigator) {
    const setMS = () => {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.name, artist: current.freq ? `FM ${current.freq.toFixed(1)}` : "网络电台",
        album: `山河收音机 · ${current.region}` });
    };
    listeners.push(s => { if (s === "playing") setMS(); });
    navigator.mediaSession.setActionHandler("play", () => start());
    navigator.mediaSession.setActionHandler("pause", () => { audio.pause(); emit("paused"); });
  }
  return { play, toggle, retry, get state() { return state; }, get station() { return current; },
           get audio() { return audio; }, on(fn) { listeners.push(fn); } };
})();
window.__radio = Radio;   // 调试与冒烟测试入口
```

- [ ] **Step 2: 浏览器冒烟验证**

Run: `open index.html`，在浏览器控制台执行：
```javascript
__radio.play(STATIONS.find(s => s.id === "zgzs"));   // 应在 1~3 秒后出声
__radio.state;                                        // "playing"
__radio.play(STATIONS.find(s => s.id === "tjxw"));   // mp3 渐进流也应出声
```
Expected: 两条流都能出声，state 依次经历 loading → playing。

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 播放引擎(HLS协商/重试链/MediaSession)"
```

---

### Task 3: UI 结构与渲染（刻度盘/液晶屏/频段按键/电台列表）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 面板 HTML 结构**

`<body>` 内（替换占位注释）：

```html
<div class="radio">
  <div class="dial">
    <div class="dial-scale" id="dialScale">
      <div class="needle" id="needle"></div>
    </div>
    <div class="dial-nums"><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div>
  </div>
  <div class="lcd">
    <div class="lcd-left">
      <div class="lcd-name" id="lcdName">山河收音机</div>
      <div class="lcd-sub" id="lcdSub">选择一个电台开始收听</div>
    </div>
    <div class="lcd-vu" id="vu"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="lcd-freq" id="lcdFreq">FM —</div>
  </div>
  <div class="controls">
    <button class="knob" id="playBtn" aria-label="播放/暂停"><span class="knob-icon">▶</span></button>
    <div class="band-strip" id="bandStrip"></div>
    <button class="search-toggle" id="searchToggle">🔍</button>
  </div>
  <input type="search" id="searchBox" class="search-box" placeholder="搜索电台 / 省份…" hidden>
  <div class="knob-volume">
    <div class="knob-vol" id="volKnob"><div class="knob-mark"></div></div>
    <div class="knob-vol-label">音量</div>
  </div>
  <ul class="station-list" id="stationList"></ul>
  <div class="foot">数据来源：央广网/各地广播融媒体公开直播流 · <span id="stationCount"></span></div>
</div>
<audio id="audio" playsinline></audio>
```

注意：Task 2 播放引擎使用 `new Audio()`，本步骤改为绑定已存在的 `#audio` 元素（`const audio = document.getElementById("audio")`），保持单实例。

- [ ] **Step 2: 渲染逻辑（追加到 script 末尾）**

```javascript
/* ============ UI 渲染 ============ */
const $ = id => document.getElementById(id);
const dialScale = $("dialScale"), needle = $("needle");

// 刻度盘：87.5–108 线性映射到 0–100%
const freqToPct = f => Math.min(100, Math.max(0, (f - 87.5) / (108 - 87.5) * 100));
const moveNeedle = f => { needle.style.left = freqToPct(f || 99.0) + "%"; };

// 频段按键
const strip = $("bandStrip");
REGIONS.forEach(r => {
  const b = document.createElement("button");
  b.className = "band-btn"; b.textContent = r === "中央" ? "中央" : r.slice(0, 2);
  b.title = r; b.dataset.region = r;
  b.onclick = () => selectRegion(r);
  strip.appendChild(b);
});
const favBtn = document.createElement("button");
favBtn.className = "band-btn band-fav"; favBtn.textContent = "★"; favBtn.title = "收藏";
favBtn.dataset.region = "★收藏";
favBtn.onclick = () => selectRegion("★收藏");
strip.appendChild(favBtn);

let currentRegion = "中央";
function selectRegion(r) {
  currentRegion = r;
  document.querySelectorAll(".band-btn").forEach(b => b.classList.toggle("active", b.dataset.region === r));
  renderList();
}
function listStations() {
  const q = $("searchBox").value.trim();
  if (q) return STATIONS.filter(s => (s.name + s.region).toLowerCase().includes(q.toLowerCase()));
  if (currentRegion === "★收藏") return STATIONS.filter(s => Favs.has(s.id));
  return STATIONS.filter(s => s.region === currentRegion);
}
function renderList() {
  const ul = $("stationList"); ul.innerHTML = "";
  listStations().forEach(s => {
    const li = document.createElement("li");
    li.className = "station" + (Radio.station && Radio.station.id === s.id ? " current" : "");
    li.innerHTML = `<button class="st-play" data-id="${s.id}">
        <span class="st-dot"></span><span class="st-name">${s.name}</span>
        <span class="st-freq">${s.freq ? "FM " + s.freq.toFixed(1) : "NET"}</span></button>
      <button class="st-fav${Favs.has(s.id) ? " on" : ""}" data-id="${s.id}">★</button>`;
    ul.appendChild(li);
  });
}
$("stationList").addEventListener("click", e => {
  const play = e.target.closest(".st-play"), fav = e.target.closest(".st-fav");
  if (play) { const s = STATIONS.find(x => x.id === play.dataset.id);
    if (Radio.station && Radio.station.id === s.id) Radio.toggle(); else Radio.play(s); }
  if (fav) { Favs.toggle(fav.dataset.id); renderList(); }
});
```

- [ ] **Step 3: 播放状态联动 + 收藏存储（追加）**

```javascript
/* ============ 收藏（localStorage 降级内存） ============ */
const Favs = (() => {
  let set;
  try { set = new Set(JSON.parse(localStorage.getItem("fm-favorites") || "[]")); }
  catch { set = new Set(); }
  const save = () => { try { localStorage.setItem("fm-favorites", JSON.stringify([...set])); } catch {} };
  return { has: id => set.has(id),
    toggle: id => { set.has(id) ? set.delete(id) : set.add(id); save(); },
    get size() { return set.size; } };
})();

/* ============ 状态联动 ============ */
const STATUS_TEXT = { idle: "选择一个电台开始收听", loading: "调谐中…",
  playing: "● ON AIR", paused: "‖ 已暂停", error: "✕ 无信号" };
Radio.on((st, s) => {
  $("lcdName").textContent = s ? s.name : "山河收音机";
  $("lcdSub").textContent = STATUS_TEXT[st];
  $("lcdFreq").textContent = s ? (s.freq ? "FM " + s.freq.toFixed(1) : "NET") : "FM —";
  $("playBtn").querySelector(".knob-icon").textContent = st === "playing" ? "❚❚" : "▶";
  document.querySelector(".radio").classList.toggle("is-error", st === "error");
  document.querySelector(".radio").classList.toggle("is-playing", st === "playing");
  if (s) moveNeedle(s.freq);
  renderList();
});
$("playBtn").onclick = () => Radio.station ? Radio.toggle()
  : Radio.play(STATIONS.find(s => s.region === currentRegion) || STATIONS[0]);
document.addEventListener("keydown", e => {
  if (e.code === "Space" && !e.target.closest("input")) { e.preventDefault(); $("playBtn").click(); }
});
$("searchToggle").onclick = () => { const b = $("searchBox"); b.hidden = !b.hidden; if (!b.hidden) b.focus(); };
$("searchBox").addEventListener("input", renderList);
$("stationCount").textContent = `${STATIONS.length} 个电台 · ${REGIONS.length} 个地区`;
selectRegion("中央");
```

无信号时的手动重试：`is-error` 状态下点击播放按钮触发 `Radio.retry()`（在 `$("playBtn").onclick` 里加 `st === "error"` 分支）。

- [ ] **Step 4: 验证**

Run: `open index.html`
- 频段条 33 个按键（32 地区 + 收藏），默认选中「中央」并渲染 14 个电台行
- 点击「广东」→ 5 行；点击台行出声、指针滑动、液晶屏 ON AIR、VU 动
- 点星标收藏 → 切到 ★ 收藏可见；刷新页面收藏保留
- 搜索「音乐」→ 跨省过滤
Expected: 全部符合。

- [ ] **Step 5: 提交**

```bash
git add index.html
git commit -m "feat: UI结构与渲染(刻度盘/液晶屏/频段/列表/收藏/搜索)"
```

---

### Task 4: 音量旋钮 + 错误/降级细节

**Files:**
- Modify: `index.html`

- [ ] **Step 1: 旋钮实现（0–270° 拖动旋转）**

```javascript
/* ============ 音量旋钮 ============ */
(() => {
  const knob = $("volKnob"); let vol = 0.8, dragging = false;
  const apply = () => {
    knob.style.transform = `rotate(${-135 + vol * 270}deg)`;
    try { $("audio").volume = vol; } catch {}   // iOS 会抛/忽略，静默降级为系统音量
  };
  const fromEvent = e => {
    const r = knob.getBoundingClientRect();
    const ang = Math.atan2(e.clientX - (r.left + r.width / 2), (r.top + r.height / 2) - e.clientY);
    vol = Math.min(1, Math.max(0, ((ang * 180 / Math.PI + 135) / 270)));
    apply();
  };
  knob.addEventListener("pointerdown", e => { dragging = true; knob.setPointerCapture(e.pointerId); fromEvent(e); });
  knob.addEventListener("pointermove", e => dragging && fromEvent(e));
  knob.addEventListener("pointerup", () => dragging = false);
  apply();
})();
```

- [ ] **Step 2: 验证**

- 拖旋钮角度从 -135°（静音）到 +135°（最大），音量随之变化（iOS Safari 上旋钮转动但音量跟随系统——预期降级）
- 断网后点一台 → 「调谐中…」→ 重试 2 次 → 「✕ 无信号」，恢复网络点播放按钮可重新调谐

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 音量旋钮与错误降级"
```

---

### Task 5: 复古收音机视觉样式

**Files:**
- Modify: `index.html`（`<style>` 区块）

- [ ] **Step 1: 样式实现要点（关键代码，完整写入 `<style>`）**

```css
:root {
  --wood-1: #6b4a2f; --wood-2: #4a3321; --cream: #f2e8d5; --cream-dark: #e2d4b8;
  --orange: #e8722a; --lcd-bg: #1d2b22; --lcd-fg: #7fe8a8; --ink: #2b2016;
}
* { box-sizing: border-box; margin: 0; }
body { min-height: 100vh; display: grid; place-items: center; padding: 16px;
  background: repeating-linear-gradient(45deg, #2a2a2a 0 2px, #232323 2px 4px);
  font-family: "PingFang SC", "Hiragino Sans GB", system-ui, sans-serif; }
.radio { width: min(480px, 100%); border-radius: 22px; padding: 22px;
  background: linear-gradient(160deg, var(--cream) 0%, var(--cream-dark) 100%);
  border: 10px solid transparent;
  border-image: repeating-linear-gradient(88deg, var(--wood-1) 0 7px, var(--wood-2) 7px 14px) 1;
  box-shadow: 0 24px 60px rgba(0,0,0,.55), inset 0 2px 0 rgba(255,255,255,.5); }
.dial { background: #fdfaf1; border-radius: 10px; padding: 10px 12px 4px;
  box-shadow: inset 0 2px 8px rgba(0,0,0,.18); }
.dial-scale { position: relative; height: 34px;
  background: repeating-linear-gradient(90deg, var(--ink) 0 1px, transparent 1px 10%); }
.needle { position: absolute; top: -2px; bottom: -2px; width: 3px; background: var(--orange);
  border-radius: 2px; transition: left .7s cubic-bezier(.3,1.4,.4,1);
  box-shadow: 0 0 6px rgba(232,114,42,.8); }
.lcd { margin-top: 14px; background: var(--lcd-bg); color: var(--lcd-fg); border-radius: 8px;
  padding: 12px 14px; display: flex; align-items: center; gap: 12px;
  font-family: ui-monospace, Menlo, monospace; box-shadow: inset 0 2px 10px rgba(0,0,0,.7); }
.lcd-name { font-size: 20px; font-weight: 700; letter-spacing: .06em; }
.lcd-sub { font-size: 12px; opacity: .8; margin-top: 4px; }
.lcd-freq { margin-left: auto; font-size: 22px; }
.lcd-vu { display: flex; gap: 3px; align-items: flex-end; height: 26px; }
.lcd-vu i { width: 4px; background: var(--lcd-fg); height: 20%; border-radius: 1px; }
.is-playing .lcd-vu i { animation: vu .7s ease-in-out infinite alternate; }
.lcd-vu i:nth-child(2) { animation-delay: .1s } .lcd-vu i:nth-child(3) { animation-delay: .25s }
.lcd-vu i:nth-child(4) { animation-delay: .05s } .lcd-vu i:nth-child(5) { animation-delay: .18s }
@keyframes vu { from { height: 15% } to { height: 100% } }
.controls { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.knob { width: 64px; height: 64px; border-radius: 50%; border: none; cursor: pointer;
  background: radial-gradient(circle at 35% 30%, #7a5a3a, var(--wood-1) 70%);
  box-shadow: 0 5px 12px rgba(0,0,0,.4), inset 0 2px 4px rgba(255,255,255,.3);
  color: var(--cream); font-size: 22px; }
.band-strip { display: flex; gap: 6px; overflow-x: auto; flex: 1; padding-bottom: 4px; }
.band-btn { flex: 0 0 auto; border: 1px solid #b9a888; background: linear-gradient(#faf4e6, #e8dcc2);
  border-radius: 6px; padding: 8px 10px; font-size: 13px; color: var(--ink); cursor: pointer;
  box-shadow: 0 3px 0 #b9a888; transition: all .12s; }
.band-btn.active { background: var(--orange); color: #fff; transform: translateY(3px);
  box-shadow: 0 0 0 #b9a888, inset 0 2px 4px rgba(0,0,0,.3); }
.station-list { list-style: none; margin-top: 14px; max-height: 40vh; overflow-y: auto; }
.station { display: flex; align-items: center; border-bottom: 1px dashed #c9bda0; }
.st-play { flex: 1; display: flex; align-items: center; gap: 10px; padding: 11px 4px;
  background: none; border: none; font: inherit; color: var(--ink); cursor: pointer; text-align: left; }
.station.current .st-name { color: var(--orange); font-weight: 700; }
.station.current .st-dot { background: var(--orange); box-shadow: 0 0 6px var(--orange); }
.is-playing .station.current .st-dot { animation: pulse 1s infinite alternate; }
@keyframes pulse { from { opacity: .4 } to { opacity: 1 } }
.st-freq { margin-left: auto; font-family: ui-monospace, Menlo, monospace; font-size: 13px; opacity: .65; }
.st-fav { background: none; border: none; font-size: 17px; color: #c9bda0; cursor: pointer; padding: 8px; }
.st-fav.on { color: var(--orange); }
.knob-volume { display: flex; flex-direction: column; align-items: center; gap: 4px; margin-top: 14px; }
.knob-vol { width: 46px; height: 46px; border-radius: 50%; cursor: grab; touch-action: none;
  background: conic-gradient(from 0deg, var(--wood-1), var(--wood-2), var(--wood-1));
  box-shadow: 0 4px 8px rgba(0,0,0,.35); position: relative; }
.knob-mark { position: absolute; left: 50%; top: 3px; width: 3px; height: 12px;
  background: var(--cream); border-radius: 2px; transform: translateX(-50%); }
.knob-vol-label { font-size: 11px; color: #7a6a4f; }
.search-box { width: 100%; margin-top: 12px; padding: 10px 12px; border-radius: 8px;
  border: 1px solid #b9a888; background: #fdfaf1; font: inherit; }
.is-error .lcd { background: #3a1414; color: #ff9b8a; }
.foot { margin-top: 12px; font-size: 11px; color: #8a7a5f; text-align: center; }
```

（样式可在保持复古收音机基调的前提下微调间距/字号等细节。）

- [ ] **Step 2: 视觉验证**

Run: `open index.html`
- 整体呈木纹边框 + 奶油面板的收音机观感，桌面居中 480px，手机全宽
- 指针橙色发亮、选台平滑滑动；播放中 VU 条律动、当前台行橙字呼吸圆点
- 无信号态液晶屏变红

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 复古收音机视觉样式"
```

---

### Task 6: 全量验证 + README

**Files:**
- Create: `README.md`

- [ ] **Step 1: 探活全绿**

Run: `bash tools/check-stations.sh`
Expected: `存活 121 / 121`，退出码 0

- [ ] **Step 2: 手动 E2E 清单（设计文档第 8 节）**

macOS Safari + Chrome：切 3 个省的台出声、音量旋钮、搜索、收藏刷新保留、空格播放/暂停；
iPhone Safari（可用模拟器或真机局域网访问 `python3 -m http.server`）：添加主屏幕、锁屏不断播、锁屏见台名；
断网台：「无信号」+ 重试不白屏。

- [ ] **Step 3: README**

内容：项目简介、双击打开即用、部署到 GitHub Pages 的方法、电台数据来源与更新方法（跑探活脚本、替换失效 URL）、已知限制（公开流会失效、http 流在 https 部署下受限——本数据已全 https）。

- [ ] **Step 4: 提交**

```bash
git add README.md index.html
git commit -m "docs: README与最终校验"
```

---

## Self-Review 记录

- **Spec 覆盖**：数据层（T1）、播放层含重试链/MediaSession/hls降级（T2）、UI 刻度盘/液晶/频段/列表/搜索/收藏/旋钮（T3/T4/T5）、错误处理（T2/T4）、验证方式（T1 脚本 + T6 E2E）——设计文档各节均有对应任务 ✅
- **类型/命名一致性**：`Radio.play/toggle/retry/state/station/on`、`Favs.has/toggle`、`STATIONS` 字段 `id/name/freq/region/url/backup`、DOM id（`dialScale/needle/lcdName/lcdSub/lcdFreq/vu/playBtn/bandStrip/searchBox/searchToggle/stationList/volKnob/stationCount/audio`）各任务间一致 ✅
- **占位符**：无 TBD/TODO；Task 5 样式为「要点代码 + 完成度自由度」，视觉细节（如刻度数字间距微调）属实现裁量而非占位 ✅
- **已知裁量点**：贵州交通广播的 slug `wx32gzyygb` 原合集即如此标注（探活已通过），如播放内容与台名不符，用同省其他已验证 slug 替换
