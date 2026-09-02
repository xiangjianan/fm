# 山河收音机 v2（PWA + Vue3 + TS 重构）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 v1 单文件电台应用重构为 Vite+Vue3+TS 的可安装 PWA：侧边栏主从布局、横向音量滑条、频道扩充至约 165 个（音乐优先），部署 GitHub Pages。

**Architecture:** 工程化重构（设计文档方案 A）。播放引擎 v1 逻辑 TS 化为 composable；组件化 UI（侧栏省份/列表/底部播放条）；vite-plugin-pwa 预缓存应用外壳（不缓存音频流）；数据全部来自 2026-09-02 验证过的公开直播流。

**Tech Stack:** Vite 5、Vue 3 `<script setup lang="ts">`、hls.js（npm）、vite-plugin-pwa、Vitest、Playwright（冒烟）。

**对设计文档的细化/修正：**
1. 频道目标从「180~220」修正为「**约 161~166**」——验证池扩容后即此规模（120 + 41 新收录 + 最多 5 个复探通过），数据只收验证过的，不凑数
2. v1 数据有一处标签错误顺带修正：`wx32gzyygb` 原始合集标注为**贵州音乐广播**（v1 误标「贵州交通广播」），Task 2 改名并复探真正的贵州交通 slug

---

### Task 1: Vite + Vue3 + TS 脚手架、数据迁移、测试基建

**Files:**
- Create: `package.json`、`vite.config.ts`、`tsconfig.json`、`index.html`（Vite 入口，替换 v1 同名文件）、`src/main.ts`、`src/App.vue`（占位）、`src/style.css`
- Create: `src/types.ts`、`src/data/stations.ts`、`tests/stations.spec.ts`
- Modify: `tools/check-stations.sh`（数据源路径）
- Delete: 无（v1 `index.html` 被覆盖；v1 逻辑保留在 git 历史）

- [ ] **Step 1: 脚手架**

```bash
cd /Users/xiangjianan/github/fm
npm create vite@latest . -- --template vue-ts   # 选择覆盖 index.html
npm i && npm i hls.js && npm i -D vite-plugin-pwa vitest
```

`vite.config.ts`（PWA 部分在 Task 5 补全，先留 vue 单插件）：

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/fm/",            // GitHub Pages 子路径
  plugins: [vue()],
  test: { environment: "node" },   // vitest
});
```

- [ ] **Step 2: 类型与数据迁移**

`src/types.ts`：

```typescript
export interface Station {
  id: string;          // 稳定标识（收藏去重用）
  name: string;
  freq: number;        // 0 = 无公开频率（显示 NET，指针按 99.0）
  region: string;      // "中央" 或省级行政区名
  url: string;         // 直播流（仅 https）
  backup?: string;     // 备用流
}
```

`src/data/stations.ts`：把 v1 `index.html` 中 `STATIONS` 数组（约 15–135 行）逐条机械迁移为
`export const STATIONS: Station[] = [...]`（去掉 `S()` 工具函数，展开为对象字面量），
`REGIONS` 同样导出。不增不减不改（扩充在 Task 2）。

- [ ] **Step 3: 数据完整性测试（先写）**

`tests/stations.spec.ts`：

```typescript
import { describe, it, expect } from "vitest";
import { STATIONS, REGIONS } from "../src/data/stations";

describe("stations 数据完整性", () => {
  it("id 唯一", () => {
    expect(new Set(STATIONS.map(s => s.id)).size).toBe(STATIONS.length);
  });
  it("region 全部已定义且无空省", () => {
    const used = new Set(STATIONS.map(s => s.region));
    expect([...used].filter(r => !REGIONS.includes(r))).toEqual([]);
    expect(REGIONS.filter(r => !used.has(r))).toEqual([]);
  });
  it("freq 合法、url 全 https", () => {
    for (const s of STATIONS) {
      expect(s.freq).toBeGreaterThanOrEqual(0);
      expect(s.freq).toBeLessThanOrEqual(108);
      expect(s.url).toMatch(/^https:\/\//);
      if (s.backup) expect(s.backup).toMatch(/^https:\/\//);
    }
  });
  it("规模 ≥ 120（v1 基线）", () => {
    expect(STATIONS.length).toBeGreaterThanOrEqual(120);
  });
});
```

- [ ] **Step 4: 探活脚本改路径**

`tools/check-stations.sh` 中 `HTML="index.html"` 改为 `HTML="src/data/stations.ts"`
（grep 的 URL 正则不变，ts 文件同样适用）。

- [ ] **Step 5: 验证**

Run: `npx vitest run && bash tools/check-stations.sh --quick && npm run build`
Expected: 测试全绿；探活 124/124；build 成功产出 `dist/`。

- [ ] **Step 6: 提交**

```bash
git add -A && git commit -m "feat: Vite+Vue3+TS脚手架与数据迁移(v2)"
```

---

### Task 2: 频道扩充（音乐优先）

**Files:**
- Modify: `src/data/stations.ts`、`tests/stations.spec.ts`

- [ ] **Step 1: 复探掉队者（shell，仅收录分片 206/200 者）**

```bash
for u in \
  "https://satellitepull.cnr.cn/live/wxsxxxwgb/playlist.m3u8" \
  "https://satellitepull.cnr.cn/live/wxsxxjjgb/playlist.m3u8" \
  "https://satellitepull.cnr.cn/live/wxsxxjtgb/playlist.m3u8" \
  "https://satellitepull.cnr.cn/live/wxhubzsgb/playlist.m3u8" \
  "https://satellitepull.cnr.cn/live/wx32gzjtgb/playlist.m3u8" \
  "https://sk.cri.cn/915.m3u8" \
  "https://ls.qingting.fm/live/274.m3u8"; do
  curl -s -o /tmp/p.m3u8 -w "$u -> %{http_code}\n" --max-time 6 "$u"
done
```

预期多数超时/404；分片验证通过的才进 Step 2 名单。

- [ ] **Step 2: 追加 41 个已验证台**

以下全部来自 2026-09-02 验证池（playlist+分片双绿），按 region 追加进 `STATIONS`
（`wx32gzyygb` 一并从「贵州交通广播」**改名为「贵州音乐广播」**）：

```
中央: （无新增）
北京: 北京城市广播 0 wxbjcsfwgl
内蒙古: 内蒙古对外广播 0 wx32nmgdwgb | 绿野之声 0 wx32nmglyzs | 蒙古语综合广播 0 wx32nmgmyxwgb | 呼伦贝尔汉语广播 0 wx32nmghlbehygb | 呼伦贝尔蒙语广播 0 wx32nmghlbemygb
吉林: 吉林乡村广播 0 wxjlxcgb
辽宁: 辽宁乡村广播 0 wxlnxcgb
黑龙江: 高校广播 0 wx32hljgxgb | 女性广播 0 wx32hljnxgb | 爱家调频 0 wx32hljajgb | 朝鲜语广播 0 wx32hljcygb
江苏: 江苏新闻广播 0 wx32jsxwgb | 江苏故事广播 0 wx32jsgsgb
浙江: 浙江民生广播996 99.6 wxzjmsgb
安徽: 安徽旅游广播 0 wxahlygb | 安徽农村广播 0 wxahncgb | 安徽戏曲广播 0 wxahxqgb | 安徽小说评书广播 0 wxahxspsgb
福建: 福建财经广播961 96.1 wx32fjdnjjgb
山东: 山东乡村广播 0 wxsdxcgb
河南: 河南旅游广播 0 wxhnlygb | 河南农村广播 0 wxhnncgb | 河南戏曲广播 0 wxhnxqgb | 河南信息广播 0 wxhnxxgb | 河南教育广播 0 hndt:jiaoyu | 河南影视广播 0 hndt:yingshi
湖北: （无新增，已 3 台）
湖南: 金鹰之声 0 wx32955
广东: 广东股市广播 0 wxgdgsgb | 南方生活广播 0 wxgdnfshgb | 广东文体广播 0 wxgdwtgb | 深圳交通频率 0 wxszjjpl
贵州: 贵州故事广播 0 wx32gzgsgb | 贵州旅游广播 0 wx32gzlygb
西藏: 西藏藏语康巴方言 0 wxxzzykbfy | 西藏对外交通广播 0 wxxzdwjtgb
新疆: 新疆柯尔克孜语广播 0 wxxjkygb | 新疆蒙语广播 0 wxxjmygb | 新疆绿色广播 0 wxxjlsgb | 维语交通文艺广播 0 wxxjwyjtwygb
甘肃: 甘肃都市调频 0 wxgsdstb | 甘肃青春调频 0 wxgsqcgb
```

（id 规则与 v1 一致：拼音缩写；`hndt:` 前缀表示 `https://stream.hndt.com/live/<slug>/playlist.m3u8`）

- [ ] **Step 3: 更新测试断言**

`tests/stations.spec.ts` 规模断言改为 `expect(STATIONS.length).toBeGreaterThanOrEqual(160);`

- [ ] **Step 4: 验证**

Run: `npx vitest run && bash tools/check-stations.sh`
Expected: 测试绿；探活 165+/165+ 全绿（120+41+备源数）。

- [ ] **Step 5: 提交**

```bash
git add -A && git commit -m "feat: 频道扩充至161+(音乐优先,含贵州台名修正)"
```

---

### Task 3: 播放引擎与收藏 composables

**Files:**
- Create: `src/composables/player.ts`、`src/composables/favorites.ts`
- Test: `tests/player.spec.ts`、`tests/favorites.spec.ts`

- [ ] **Step 1: player.ts（v1 逻辑 TS 化，行为不变）**

```typescript
import { ref, readonly } from "vue";
import type { Station } from "../types";

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export function usePlayer() {
  // 单例：模块级 audio，避免多实例竞态
  const audio = new Audio();
  audio.preload = "none";

  const state = ref<PlayerState>("idle");
  const current = ref<Station | null>(null);
  let retryCount = 0, usingBackup = false, retryTimer: number | undefined;
  let detach: (() => void) | null = null;

  const set = (s: PlayerState) => { state.value = s; };

  function attach(url: string): () => void {
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

  function start() {
    if (!current.value) return;
    const url = usingBackup && current.value.backup ? current.value.backup : current.value.url;
    set("loading");
    if ((window as any).__hlsLoadFailed && !audio.canPlayType("application/vnd.apple.mpegurl")
        && /\.m3u8/i.test(url)) { set("error"); return; }
    detach?.();
    detach = attach(url);
    audio.play().catch(() => set("paused"));
  }

  function fail() {
    if (retryCount < 2) {
      retryCount++;
      retryTimer = window.setTimeout(start, retryCount === 1 ? 1000 : 3000);
      return;
    }
    if (!usingBackup && current.value?.backup) {
      usingBackup = true; retryCount = 0;
      retryTimer = window.setTimeout(start, 500);
      return;
    }
    set("error");
  }

  function play(station: Station) {
    clearTimeout(retryTimer);
    detach?.();
    current.value = station; retryCount = 0; usingBackup = false;
    start();
  }
  const toggle = () => state.value === "playing" ? (audio.pause(), set("paused")) : start();
  const retry = () => { retryCount = 0; start(); };

  audio.addEventListener("playing", () => set("playing"));
  audio.addEventListener("pause", () => { if (state.value === "playing") set("paused"); });
  audio.addEventListener("error", () => { if (state.value !== "idle") fail(); });
  audio.addEventListener("waiting", () => { if (state.value === "playing") set("loading"); });

  if ("mediaSession" in navigator) {
    try {
      navigator.mediaSession.setActionHandler("play", () => start());
      navigator.mediaSession.setActionHandler("pause", () => { audio.pause(); set("paused"); });
    } catch { /* 部分浏览器不支持 */ }
    const setMS = () => {
      if (!current.value) return;                    // v1 修过的空引用
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.value.name,
        artist: current.value.freq ? `FM ${current.value.freq.toFixed(1)}` : "网络电台",
        album: `山河收音机 · ${current.value.region}` });
    };
    audio.addEventListener("playing", setMS);
  }

  return { state: readonly(state), current: readonly(current), play, toggle, retry, audio };
}
export const player = usePlayer();   // 应用级单例
```

- [ ] **Step 2: favorites.ts**

```typescript
import { ref } from "vue";
const KEY = "fm-favorites";
const load = (): Set<string> => {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { return new Set(); }
};
const set = ref<Set<string>>(load());
const save = () => { try { localStorage.setItem(KEY, JSON.stringify([...set.value])); } catch { /* 隐私模式降级内存 */ } };

export function useFavorites() {
  return {
    ids: set,
    has: (id: string) => set.value.has(id),
    toggle: (id: string) => {
      set.value.has(id) ? set.value.delete(id) : set.value.add(id);
      set.value = new Set(set.value);   // 触发响应式
      save();
    },
  };
}
```

- [ ] **Step 3: 测试（先跑失败再补实现细节）**

`tests/player.spec.ts` 要点（用 `vi.mock`/stub 替换 `Audio`、`window.Hls`）：
- play() → loading → (fake play 事件) → playing
- 连续 2 次 error 事件 + 第 3 次 → 有 backup 时切换 usingBackup 再 start
- error 状态下 retry() 回到 loading
`tests/favorites.spec.ts` 要点（stub `localStorage`，jsdom 或手动注入 global）：
- toggle 增加/移除、has 判定、持久化写入、localStorage 抛异常不崩

- [ ] **Step 4: 验证与提交**

Run: `npx vitest run`
```bash
git add -A && git commit -m "feat: 播放引擎与收藏composables(含单元测试)"
```

---

### Task 4: 组件与响应式布局

**Files:**
- Create: `src/App.vue`（AppShell 职责）、`src/components/ProvinceSidebar.vue`、`src/components/StationList.vue`、`src/components/PlayerBar.vue`、`src/components/VolumeSlider.vue`
- Modify: `src/style.css`（v1 复古样式迁移为全局变量 + 组件样式）

- [ ] **Step 1: 布局骨架（App.vue）**

- `selectedRegion = ref("中央")`、`view = ref<"provinces" | "stations">("provinces")`（仅移动端用）
- 桌面（`@media (min-width: 768px)`）：grid 双栏 `260px 1fr`，侧栏与列表同屏
- 移动：单列，`view === 'provinces'` 显示侧栏全屏；点击省份 → `view = 'stations'` 列表滑入（transform 过渡）+ 顶部「‹ 返回」；底部 PlayerBar 常驻
- 搜索框：置顶（覆盖全部数据的过滤，输入时列表联动，侧栏隐藏匹配数为 0 的省）

- [ ] **Step 2: ProvinceSidebar**

- props：`regions: string[]`、`counts: Record<string, number>`（含「★收藏」）、`active`、`playingRegion`
- 每项：省名 + 台数徽标；`playingRegion === r` 时加播放中标识（小橙点）；纵向滚动
- emit：`select(region)`

- [ ] **Step 3: StationList**

- props：`stations: Station[]`；当前播放台行高亮（橙名+呼吸点）
- 行内容：台名 / freq（`0` → `NET`）/ 收藏 ★（useFavorites）
- 点击行为与 v1 相同：非当前台 → play；当前台 → toggle

- [ ] **Step 4: PlayerBar + VolumeSlider**

- PlayerBar：液晶屏（台名/频率/状态/VU 动画，沿用 v1 样式类名与 CSS）、播放/暂停按钮、error 态重试按钮
- VolumeSlider：`<input type="range" min="0" max="1" step="0.01">` + `−/+` 步进按钮（±0.1），
  绑定 `player.audio.volume`；iOS 上 range 无效时静默降级（try/catch 同 v1）
- Media Session 已在 composable 内

- [ ] **Step 5: 样式迁移**

v1 `index.html`（git 历史 `master:67a3124` 可查）`<style>` 块迁移到 `src/style.css` 与各组件 `<style scoped>`；
`--wood/--cream/--orange/--lcd` 变量原样保留；新增侧栏/滑条样式遵循同一设计语言。

- [ ] **Step 6: Playwright 冒烟验证**

Run: `npm run preview &` 后跑（沿用 v1 脚本思路改 URL）：
- 桌面 900px：侧栏 33 项、点击广东右侧出 5+ 行、播放出声（t>0.5）
- 手机 390px：省份页 → 点击滑入电台页 → 返回；PlayerBar 常驻；音量滑条拖动改变 `audio.volume`
- 收藏切换 + 刷新保留；搜索「音乐」跨省过滤

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "feat: 侧边栏主从布局与组件(UI v2)"
```

---

### Task 5: PWA 与部署配置

**Files:**
- Modify: `vite.config.ts`（PWA 插件）
- Create: `public/icons/icon-192.png`、`icon-512.png`、`maskable-512.png`、`public/favicon.svg`

- [ ] **Step 1: 图标生成（Playwright 渲染 SVG → PNG）**

复古收音机造型 SVG（木纹机身 + 奶油面板 + 橙色刻度线 + 液晶绿圆点），用无头浏览器截图导出
192/512 与 maskable（安全区 80%）三枚 PNG（`omitBackground` 透明底）。

- [ ] **Step 2: vite-plugin-pwa 配置**

```typescript
import { VitePWA } from "vite-plugin-pwa";
// plugins 追加：
VitePWA({
  registerType: "autoUpdate",
  manifest: {
    name: "山河收音机", short_name: "山河收音机",
    description: "收听全国各省电台直播的复古收音机",
    theme_color: "#4a3321", background_color: "#232323",
    display: "standalone", start_url: "/fm/",
    icons: [
      { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  },
  workbox: { navigateFallbackDenylist: [/\.m3u8$/, /\.mp3$/, /\.aac$/] },  // 音频流绝不缓存
})
```

- [ ] **Step 3: 验证**

Run: `npm run build && npm run preview`
Playwright 打开 preview 地址断言：`/fm/manifest.webmanifest` 200、`sw.js` 注册
（`navigator.serviceWorker.ready` resolve）、应用可离线加载外壳（offline 后页面仍渲染）。

- [ ] **Step 4: 提交**

```bash
git add -A && git commit -m "feat: PWA(manifest/图标/ServiceWorker)与部署配置"
```

---

### Task 6: 终验与 README

- [ ] **Step 1:** `npx vitest run && bash tools/check-stations.sh && npm run build`（全绿）
- [ ] **Step 2:** Playwright 全量冒烟（Task 4 Step 6 清单 + 桌面/手机截图人工过目）
- [ ] **Step 3:** README 更新：v2 说明（npm i/dev/build、GitHub Pages 部署 `gh-pages` 流程、数据维护不变）
- [ ] **Step 4:** 提交 `docs: README v2`

---

## Self-Review 记录

- **Spec 覆盖**：工程结构(T1)、数据扩充+贵州修正(T2)、引擎/收藏 TS 化+单测(T3)、侧栏布局/滑条/响应式(T4)、PWA/部署(T5)、验证/文档(T6)——设计文档各节均有任务 ✅
- **命名一致性**：`usePlayer/useFavorites`、`Station{id,name,freq,region,url,backup?}`、组件名与 spec 相同、`player.audio/state/current/play/toggle/retry` 全计划一致 ✅
- **占位符**：Task 3 测试给出要点式描述（mock Audio/Hls 的具体断言由 TDD 循环补全）——按「先跑失败再补实现」步骤执行；其余步骤均有完整代码或精确文件行号引用 ✅
- **规模修正**：频道目标 161~166 已在头部声明（验证池上限，不凑数）✅
