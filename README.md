# Shanhe Radio 📻

**English** | [简体中文](README.zh-CN.md)

A dark-night-airwaves-styled **PWA app** that can be installed to desktop/mobile home screens, streaming **180 live radio stations** from central, provincial (31 provincial-level regions), and capital-city broadcasters (with the most complete coverage of music channels).

Built with Vue 3 + TypeScript + Vite; the output is pure static files.

## Development

```bash
npm i
npm run dev        # local dev (includes LAN hint for phone testing)
npm run test       # Vitest unit tests
npm run typecheck  # type checking with vue-tsc
npm run build      # build to dist/
npm run preview    # preview build locally (PWA active in this env)
```

## Deploy to GitHub Pages

```bash
npm run build
npx gh-pages -d dist      # or: repo Settings → Pages → select the dist branch
# visit https://<username>.github.io/fm/
```

Once published, it can be "installed":
- **Desktop Chrome/Edge**: install icon at the right of the address bar → install as a desktop app
- **iOS Safari**: Share → Add to Home Screen → runs full screen, keeps playing on the lock screen
- **Android Chrome**: install the PWA

## Usage

- Left sidebar with provinces (including favorites ★ and an indicator for the currently playing province); on mobile, two-level province/station navigation
- The search box filters across provinces by station name/province
- Bottom player bar: LCD screen (station name/frequency/ON AIR/VU), play/pause, **horizontal volume slider (−/+ stepping)**
- Favorites are stored in localStorage; the app shell is precached by the Service Worker, so it **opens offline** (station streams require a network connection)

## Station Data Sources

All are public internet live streams from local broadcast organizations (each verified and added on 2026-09-02):

| Source | Coverage | Notes |
|---|---|---|
| `satellitepull.cnr.cn` | CNR channel family + most provincial stations | CNR satellite CDN, HTTPS + CORS fully open, primary source |
| `sk.cri.cn` | International channels (Global News/Chinese Global, etc.) | Echo-style CORS, usable in all scenarios |
| `brtv-radiolive.rbc.cn` | Beijing / Beijing-Tianjin-Hebei | Official BRTV; frequency is the path (fm945 etc.) |
| `stream.hndt.com` | Some Henan frequencies | Henan Radio & TV converged media |
| `audiolive302.iqilu.com` | A few Shandong frequencies | Qilu Network |
| `live.xmcdn.com` | Capital-city stations (Xi'an/Lanzhou/Guangzhou/Wanzhou…) plus supplementary music stations (Love Radio/Guangdong Music Radio/Chongqing Music…) | **No CORS**: only Safari/iPhone native HLS can play; other browsers show an `S` badge for these stations and playback may fail |

Known limitations:
- **Tianjin local stations** currently have no publicly playable web stream (the Dragonfly CDN streams are encrypted and the CNR CDN doesn't carry them); for now, Beijing-Tianjin-Hebei Voice (FM100.6, simulcast across the three regions) is grouped under Tianjin
- Some streams occasionally start slowly (within 10 seconds); the player retries automatically; persistent failures show "No Signal" — press the play knob to retry
- Public streams may break when stations reorganize; run the script below for a health check

## Data Maintenance

```bash
bash tools/check-stations.sh          # full liveness check (playlists + segments); exit code 0 when all green
bash tools/check-stations.sh --quick  # quick: playlists only
```

Adding a station: add a line in `src/data/stations.ts` (the `Station` type), add the new province to `REGIONS` as well,
then re-run `npm run test` (data integrity assertions) and the liveness script to confirm everything is green.

## Technical Notes

- Playback engine `src/composables/player.ts`: a single `<audio>` instance; Safari plays HLS natively,
  other browsers go through hls.js (imported via npm); **hls.js is kept out of the initial bundle** — it is
  warmed up in the background once idle after mount (`warmHls`); failure chain: same-source retry 2 times
  (1s/3s backoff) → switch to backup source → "No Signal"
- Media Session API: shows the station name on the lock screen (iOS 16.4+)
- PWA: vite-plugin-pwa (Workbox generateSW), precaching the app shell **and the self-hosted fonts**;
  `injectRegister: "script-defer"` (the register script only runs on window load, so it must not block
  parsing); `index.html` inlines the critical styles (dark background + STANDBY skeleton) so the first
  cold-start frame is never the browser's white canvas;
  `navigateFallbackDenylist` excludes m3u8/mp3/aac — live streams are never cached
