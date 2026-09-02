<script setup lang="ts">
import { computed } from "vue";
import { player } from "../composables/player";
import VolumeSlider from "./VolumeSlider.vue";

const STATUS_TEXT = {
  idle: "选择一个电台开始收听",
  loading: "调谐中…",
  playing: "● ON AIR",
  paused: "‖ 已暂停",
  error: "✕ 无信号，点旋钮重试",
} as const;

const name = computed(() => player.current.value?.name ?? "山河收音机");
const freq = computed(() => {
  const f = player.current.value?.freq;
  return f ? `FM ${f.toFixed(1)}` : player.current.value ? "NET" : "FM —";
});
const sub = computed(() => STATUS_TEXT[player.state.value]);
const icon = computed(() => (player.state.value === "playing" ? "❚❚" : "▶"));

function onPlay() {
  if (player.state.value === "error") player.retry();
  else player.toggle();
}
</script>

<template>
  <footer class="playerbar">
    <div class="lcd">
      <div class="lcd-left">
        <div class="lcd-name">{{ name }}</div>
        <div class="lcd-sub">{{ sub }}</div>
      </div>
      <div class="lcd-vu" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="lcd-freq">{{ freq }}</div>
    </div>
    <button class="knob" :aria-label="player.state.value === 'playing' ? '暂停' : '播放'" @click="onPlay">
      <span class="knob-icon">{{ icon }}</span>
    </button>
    <VolumeSlider class="vol" />
  </footer>
</template>

<style scoped>
.playerbar { display: flex; align-items: center; gap: 12px; margin-top: 14px; }
.lcd {
  flex: 1; min-width: 0; background: var(--lcd-bg); color: var(--lcd-fg); border-radius: 8px;
  padding: 10px 14px; display: flex; align-items: center; gap: 12px;
  font-family: ui-monospace, Menlo, monospace; box-shadow: inset 0 2px 10px rgba(0,0,0,.7);
}
.lcd-left { flex: 1; min-width: 0; }
.lcd-name { font-size: 19px; font-weight: 700; letter-spacing: .06em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lcd-sub { font-size: 12px; opacity: .8; margin-top: 4px; }
.lcd-freq { font-size: 20px; white-space: nowrap; }
.lcd-vu { display: flex; gap: 3px; align-items: flex-end; height: 26px; }
.lcd-vu i { width: 4px; background: var(--lcd-fg); height: 20%; border-radius: 1px; }
:global(.is-playing) .lcd-vu i { animation: vu .7s ease-in-out infinite alternate; }
.lcd-vu i:nth-child(2) { animation-delay: .1s } .lcd-vu i:nth-child(3) { animation-delay: .25s }
.lcd-vu i:nth-child(4) { animation-delay: .05s } .lcd-vu i:nth-child(5) { animation-delay: .18s }
:global(.is-error) .lcd { background: #3a1414; color: #ff9b8a; }
.knob {
  flex: 0 0 auto; width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer;
  background: radial-gradient(circle at 35% 30%, #7a5a3a, var(--wood-1) 70%);
  box-shadow: 0 5px 12px rgba(0,0,0,.4), inset 0 2px 4px rgba(255,255,255,.3);
  color: var(--cream); font-size: 19px;
}
.knob:active { transform: translateY(2px); }
@media (max-width: 767px) {
  .playerbar { flex-wrap: wrap; }
  .vol { width: 100%; order: 3; }
}
</style>
