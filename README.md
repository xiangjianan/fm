# 山河收音机 📻

复古收音机风格的 **PWA 应用**，可安装到桌面/手机主屏幕，在线收听**中央 + 全国 31 个省级行政区的 163 个电台直播**（音乐系频道覆盖最全）。

Vue 3 + TypeScript + Vite 构建，产物为纯静态文件。

## 开发

```bash
npm i
npm run dev        # 本地开发（含手机局域网访问提示）
npm run test       # Vitest 单元测试
npm run typecheck  # vue-tsc 类型检查
npm run build      # 构建到 dist/
npm run preview    # 本地预览构建产物（PWA 在此环境生效）
```

## 部署到 GitHub Pages

```bash
npm run build
npx gh-pages -d dist      # 或：仓库 Settings → Pages → 选 dist 分支
# 访问 https://<用户名>.github.io/fm/
```

发布后即可「安装」：
- **桌面 Chrome/Edge**：地址栏右侧安装图标 → 安装为桌面应用
- **iOS Safari**：分享 → 添加到主屏幕 → 全屏运行，锁屏继续播放
- **Android Chrome**：安装 PWA

## 使用

- 左侧省份侧栏（含收藏 ★、当前播放省标识）；手机端为省份/电台两级导航
- 搜索框支持按台名/省份跨省过滤
- 底部播放条：液晶屏（台名/频率/ON AIR/VU）、播放/暂停、**横向音量滑条（−/+ 步进）**
- 收藏存 localStorage；应用外壳由 Service Worker 预缓存，**离线可打开**（电台流需联网）

## 电台数据来源

全部为各地广播机构公开的互联网直播流（2026-09-02 逐个验证收录）：

| 来源 | 覆盖 | 说明 |
|---|---|---|
| `satellitepull.cnr.cn` | 央广套系 + 绝大多数省级台 | 央广卫星 CDN，HTTPS + CORS 全开，主力源 |
| `sk.cri.cn` | 国际台（环球资讯/华语环球等） | 回显式 CORS，全场景可用 |
| `brtv-radiolive.rbc.cn` | 北京/京津冀 | BRTV 官方，频率即路径（fm945 等） |
| `stream.hndt.com` | 河南部分频率 | 河南广播融媒体 |
| `audiolive302.iqilu.com` | 山东个别频率 | 齐鲁网 |

已知限制：
- **天津本地台**暂无公开可播网络流（蜻蜓 CDN 的流已加密、央广 CDN 未收录），暂以京津冀之声（FM100.6，三地联播）归入天津组
- 个别流偶发慢启动（10 秒内），播放器自动重试；持续失败显示「无信号」，点播放旋钮重试
- 公开流可能随电台改版失效，跑下方脚本可体检

## 数据维护

```bash
bash tools/check-stations.sh          # 全量探活（播放列表 + 分片），全绿退出码 0
bash tools/check-stations.sh --quick  # 快速只查播放列表
```

新增电台：在 `src/data/stations.ts` 加一行（`Station` 类型），新省份同步加进 `REGIONS`，
重跑 `npm run test`（数据完整性断言）与探活脚本确认全绿。

## 技术要点

- 播放引擎 `src/composables/player.ts`：单 `<audio>` 实例；Safari 原生播 HLS，
  其余浏览器经 hls.js（npm 引入）；失败链：同源重试 2 次（1s/3s 退避）→ 换备源 → 「无信号」
- Media Session API：锁屏显示台名（iOS 16.4+）
- PWA：vite-plugin-pwa（Workbox generateSW），仅预缓存应用外壳；
  `navigateFallbackDenylist` 排除 m3u8/mp3/aac，直播流不做任何缓存
- 状态管理：composables（player/favorites），未引入 Pinia
- 设计文档与实现计划见 `docs/superpowers/`
