# 山河收音机 v2（PWA + Vue 重构）设计文档

- 日期：2026-09-02
- 状态：已确认（用户批准方案与设计细节）
- 前置：v1 单文件版已合并 master（docs/superpowers/specs/2026-09-02-web-radio-app-design.md）

## 1. 目标

在 v1 验证过的数据与播放引擎基础上重构为 **可安装的 PWA**：Vite + Vue 3 + TypeScript 工程，
侧边栏主从布局适配桌面/手机，频道扩充（音乐优先），部署 GitHub Pages。

## 2. 已确认决策

| 决策项 | 选择 |
|---|---|
| 框架 | Vite + Vue 3 + `<script setup lang="ts">`（无 Pinia，用 composables） |
| PWA | vite-plugin-pwa（Workbox），仅预缓存应用外壳，不缓存音频流 |
| 部署 | GitHub Pages（https 域名满足可安装条件） |
| 布局 | ≥768px：左侧省份侧栏 + 右侧电台列表 + 底部 PlayerBar；<768px：省份/电台两级导航 + PlayerBar |
| 音量 | 横向滑条 + +/- 步进按钮（替换 v1 旋钮） |
| 视觉 | 延续复古收音机（木纹/奶油/橙/液晶绿） |
| 频道规模 | 目标 180~220 台，全量收录已验证池 + 定向补音乐系频道 |

## 3. 工程结构

```
fm/
├── index.html                 # Vite 入口
├── vite.config.ts             # vue + PWA 插件（base 按 repo 名配置）
├── package.json / tsconfig.json
├── public/
│   ├── icons/icon-192.png, icon-512.png, maskable-512.png, favicon.svg
├── src/
│   ├── main.ts / App.vue / style.css（设计变量沿用 v1 :root）
│   ├── types.ts               # interface Station { id;name;freq;region;url;backup? }
│   ├── data/stations.ts       # STATIONS + REGIONS（v1 迁移 + 扩充）
│   ├── composables/
│   │   ├── player.ts          # 播放引擎：HLS 协商（Safari 原生/hls.js）、重试链
│   │   │                     # （同源2次退避→备源→无信号）、Media Session、状态机
│   │   └── favorites.ts       # localStorage(`fm-favorites`) 降级内存
│   └── components/
│       ├── AppShell.vue       # 响应式骨架：桌面双栏 / 移动两级导航
│       ├── ProvinceSidebar.vue# 省份纵向滚动列表：名称+台数徽标+收藏入口+当前播放省高亮
│       ├── StationList.vue    # 电台行（台名/频率/收藏星标/播放态）
│       ├── PlayerBar.vue      # 液晶屏(台名/频率/状态+VU) + 播放/暂停 + 重试
│       └── VolumeSlider.vue   # 横向 range 滑条 + −/+ 步进（iOS 音量 API 受限时提示降级）
├── tools/check-stations.sh    # 改为从 src/data/stations.ts 提取 URL 探活
└── tests/                     # Vitest
    ├── player.spec.ts         # 状态机/重试链（mock audio/Hls）
    ├── favorites.spec.ts      # 收藏持久化/降级
    └── stations.spec.ts       # 数据完整性（id 唯一/region 匹配/https）
```

## 4. 关键设计

### 4.1 响应式导航
- `AppShell` 维护 `selectedRegion` 与移动端 `view: 'provinces' | 'stations'`
- 桌面（≥768px）：侧栏与列表同屏；移动：点击省份 → `view='stations'` 滑入（CSS transition），
  顶部返回按钮；切省即换列表；正在播放台全局高亮

### 4.2 播放引擎（v1 逻辑 TS 化，行为不变）
- 单 `<audio>`；m3u8：Safari 原生，其余 hls.js（失败且非 Safari 提示）
- 失败链：重试 2 次（1s/3s）→ backup → error（「无信号」+ 重试按钮）
- waiting → loading 展示；不因瞬时 rebuffer 重启
- Media Session：`if (!current) return` 防 v1 的空引用问题

### 4.3 PWA
- manifest：name「山河收音机」、display standalone、theme #4a3321、icons 192/512/maskable
- Workbox：precache `dist` 静态资源；音频流域名不做 runtime 缓存（直播不可缓存）
- 图标：复古收音机机身+刻度盘造型的 SVG 导出 PNG

### 4.4 数据扩充（音乐优先）
- 基线：v1 的 120 台
- 全量收录 2026-09-02 验证池剩余可用流（音乐/文艺/戏曲/私家车等 ~35 台）
- 定向补探音乐系频道（动感101、岷江音乐、MyFM、Music Radio 系列及各省音乐/文艺频率），
  全部经探活脚本验证后收录；目标 180~220 台
- `freq: 0` → 显示 `NET`，指针/列表按 99.0 处理

## 5. 验证方式

1. `npm run build` + `npm run preview` 本地全功能验收
2. Vitest：player 状态机/重试链、favorites、数据完整性（探活脚本之外的逻辑层）
3. Playwright 冒烟：沿用 v1 脚本思路（真实出声验证 + UI 交互清单 + 桌面/手机视口截图）
4. 探活脚本全绿后提交频道数据

## 6. 非目标

- 节目单 EPG、回听、录音；Service Worker 音频缓存；账号云同步
- v1 单文件版保留在 git 历史（master 上 v1 提交不动，v2 直接替换工作区文件）

## 7. 风险

- GitHub Pages 子路径部署需 `base` 配置正确（vite + router 无 history 模式问题，无路由）
- hls.js 经 npm 引入后体积 ~500KB（gzip ~130KB），PWA 预缓存后离线秒开可接受
