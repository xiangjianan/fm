# 山河收音机 📻

复古收音机风格的网页应用，可在线收听**中央 + 全国 31 个省级行政区的 120 个电台直播**。
单文件、零构建、零后端——双击 `index.html` 即可使用。

## 使用

- **本地**：直接双击打开 `index.html`（Safari / Chrome / Edge / Firefox 均可）
- **手机**：把 `index.html` 任意方式传到手机，或部署后用 Safari 打开 → 分享 → 添加到主屏幕，即可像 App 一样全屏使用，锁屏后继续播放
- 播放由点击触发（浏览器自动播放策略要求）；空格键可播放/暂停（桌面）

## 部署到 GitHub Pages

```bash
git init && git add . && git commit -m "init"
gh repo create fm --public --source=. --push
# Settings → Pages → Branch: main → Save，片刻后访问
# https://<用户名>.github.io/fm/
```

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
- **天津本地台**暂无公开可播网络流（蜻蜓 CDN 的流已加密、央广 CDN 未收录），暂以
  京津冀之声（FM100.6，三地联播）归入天津组
- 个别流偶发慢启动（10 秒内），播放器会自动重试；持续失败会显示「无信号」
- 公开流可能随电台改版失效，跑下方脚本可体检

## 数据维护

```bash
bash tools/check-stations.sh          # 全量探活（播放列表 + 分片），全绿退出码 0
bash tools/check-stations.sh --quick  # 快速只查播放列表
```

失效流的处理：在 `index.html` 的 `STATIONS` 里替换该台的 `url`（可加 `urlBackup` 备源），
重跑脚本确认全绿。新增电台同样只需加一行 `S(id, 名称, 频率, 地区, url, 备源?)`，
并把它所属省份加进 `REGIONS`（若是新省份）。

## 技术要点

- 单 `<audio>` 实例：Safari 原生播 HLS，其余浏览器经 hls.js（CDN 按需加载）
- 失败链路：同源重试 2 次（1s/3s 退避）→ 换备源 → 「无信号」手动重试
- Media Session API：锁屏显示台名（iOS 16.4+）
- 收藏存 `localStorage`（隐私模式降级为内存态）
- 界面为拟物复古收音机：调频刻度盘指针、液晶屏、推子频段键、音量旋钮
