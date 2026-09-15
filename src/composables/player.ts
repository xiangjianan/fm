import { ref, readonly } from "vue";
import type HlsType from "hls.js";
import type { Station } from "../types";

/**
 * hls.js 约 600KB（gzip ~185KB），只有按下播放才用得到，
 * 所以不进首屏主包：应用挂载后空闲时后台加载（见 main.ts 的 warmHls）。
 * 就绪前 Safari 走原生 HLS；其余浏览器由既有重试链兜底（首次重试时通常已就绪）。
 */
let Hls: typeof HlsType | null = null;
export function warmHls(): void {
  if (Hls) return;
  void import("hls.js").then(m => { Hls = m.default; }).catch(() => { /* 拉取失败则退回原生/重试链 */ });
}

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export function usePlayer() {
  const audio = new Audio();
  audio.preload = "none";

  const state = ref<PlayerState>("idle");
  const current = ref<Station | null>(null);
  let retryCount = 0;
  let usingBackup = false;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let detach: (() => void) | null = null;

  const set = (s: PlayerState) => { state.value = s; };

  function attach(url: string): () => void {
    // m3u8 优先 hls.js（可预期的失败进重试链）；
    // Safari 无 MSE 走原生 HLS（含 xmcdn 等无 CORS 源，Safari 原生不受 CORS 限制）
    if (/\.m3u8(\?|$)/i.test(url)) {
      // 内核还没预热好就先按原生挂上并催一次，失败后重试链会走 hls.js
      if (!Hls) warmHls();
      else if (Hls.isSupported()) {
        const hls = new Hls({
          liveDurationInfinity: true,
          manifestLoadingTimeOut: 8000,
          fragLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 2,
        });
        hls.loadSource(url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.ERROR, (_, d) => { if (d.fatal) fail(); });
        return () => hls.destroy();
      }
    }
    audio.src = url;   // Safari 原生 HLS / 渐进式流
    return () => { audio.removeAttribute("src"); audio.load(); };
  }

  function start() {
    if (!current.value) return;
    const url = usingBackup && current.value.backup ? current.value.backup : current.value.url;
    set("loading");
    detach?.();
    detach = attach(url);
    audio.play().catch(() => set("paused"));   // 自动播放被拦截等
  }

  function fail() {
    if (retryCount < 2) {                       // 同源重试 2 次，指数退避
      retryCount++;
      retryTimer = setTimeout(start, retryCount === 1 ? 1000 : 3000);
      return;
    }
    if (!usingBackup && current.value?.backup) { // 换备用源
      usingBackup = true;
      retryCount = 0;
      retryTimer = setTimeout(start, 500);
      return;
    }
    set("error");
  }

  function play(station: Station) {
    clearTimeout(retryTimer);
    detach?.();
    current.value = station;
    retryCount = 0;
    usingBackup = false;
    start();
  }
  const toggle = () => {
    if (state.value === "playing") { audio.pause(); set("paused"); }
    else start();
  };
  const retry = () => { retryCount = 0; start(); };

  audio.addEventListener("playing", () => set("playing"));
  audio.addEventListener("pause", () => { if (state.value === "playing") set("paused"); });
  audio.addEventListener("error", () => { if (state.value !== "idle") fail(); });
  // 瞬时 rebuffer 不重启（hls.js 有分片级重试），仅显示调谐中
  audio.addEventListener("waiting", () => { if (state.value === "playing") set("loading"); });

  if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
    const setMS = () => {
      if (!current.value) return;               // 首次播放前收到事件时忽略
      navigator.mediaSession.metadata = new MediaMetadata({
        title: current.value.name,
        artist: current.value.freq ? `FM ${current.value.freq.toFixed(1)}` : "网络电台",
        album: `山河收音机 · ${current.value.region}`,
      });
    };
    audio.addEventListener("playing", setMS);
    try {
      navigator.mediaSession.setActionHandler("play", () => start());
      navigator.mediaSession.setActionHandler("pause", () => { audio.pause(); set("paused"); });
    } catch { /* 部分浏览器不支持动作注册 */ }
  }

  return { state: readonly(state), current: readonly(current), play, toggle, retry, audio };
}

/** 应用级单例 */
export const player = usePlayer();
