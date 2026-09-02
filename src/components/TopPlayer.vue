<script setup lang="ts">
import { computed } from "vue";
import { player } from "../composables/player";

const name = computed(() => player.current.value?.name ?? "选择电台");
const sub = computed(() => {
  const s = player.current.value;
  if (!s) return "中央 + 31 省 · 163 个频率";
  const freq = s.freq ? `FM ${s.freq.toFixed(1)}` : "NET";
  return `${s.region} · ${freq}`;
});
const status = computed(() => {
  switch (player.state.value) {
    case "playing": return "ON AIR";
    case "loading": return "TUNING…";
    case "paused": return "PAUSED";
    case "error": return "NO SIGNAL";
    default: return "STANDBY";
  }
});
const needlePos = computed(() => {
  const f = player.current.value?.freq || 99.0;
  return Math.min(100, Math.max(0, (f - 87.5) / (108 - 87.5) * 100)) + "%";
});
const icon = computed(() => (player.state.value === "playing" ? "❚❚" : "▶"));

function onPlay() {
  if (player.state.value === "error") player.retry();
  else player.toggle();
}
</script>

<template>
  <header class="top" :class="{ live: player.state.value === 'playing', err: player.state.value === 'error' }">
    <div class="freq" aria-hidden="true">
      <div class="ticks"><i v-for="n in 21" :key="n" :class="{ tall: (n - 1) % 4 === 0 }"></i></div>
      <div class="nums"><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div>
      <div class="needle" :style="{ left: needlePos }"></div>
    </div>

    <div class="now">
      <div class="now-info">
        <h1 class="now-name">{{ name }}</h1>
        <div class="now-sub">
          <span class="status">{{ status }}</span><span class="sep">·</span><span>{{ sub }}</span>
        </div>
      </div>
      <div class="vu" aria-hidden="true"><i v-for="n in 12" :key="n"></i></div>
      <button class="play" :aria-label="player.state.value === 'playing' ? '暂停' : '播放'" @click="onPlay">{{ icon }}</button>
    </div>
  </header>
</template>

<style scoped>
.top { flex: 0 0 auto; }

/* —— 调频刻度带 —— */
.freq { position: relative; padding: 10px 6px 2px; }
.ticks { display: flex; justify-content: space-between; align-items: flex-end; height: 16px; }
.ticks i { width: 1px; height: 6px; background: var(--line); }
.ticks i.tall { height: 14px; background: #3a3a46; }
.nums { display: flex; justify-content: space-between; margin-top: 4px;
  font: 300 10px/1 var(--mono); color: var(--dim); letter-spacing: .04em; }
.needle {
  position: absolute; top: 8px; bottom: 18px; width: 2px; border-radius: 1px;
  background: var(--amber-hot); box-shadow: var(--glow);
  transition: left .7s cubic-bezier(.3, 1.4, .4, 1);
}
.needle::after {  /* 指针顶部的电光点 */
  content: ""; position: absolute; top: -2px; left: -2px; width: 6px; height: 6px;
  border-radius: 50%; background: var(--amber); box-shadow: 0 0 10px var(--amber-hot);
}

/* —— 当前台：超大字 + 状态 + 波形 + 播放键 —— */
.now { display: flex; align-items: center; gap: 14px; margin-top: 6px; min-width: 0; }
.now-info { flex: 1; min-width: 0; }
.now-name {
  font-size: clamp(26px, 7.5vw, 40px); font-weight: 600; line-height: 1.12;
  letter-spacing: .02em; color: var(--text);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.now-sub { display: flex; align-items: baseline; gap: 8px; margin-top: 4px;
  font: 300 12px/1 var(--mono); color: var(--dim); letter-spacing: .05em; }
.status { color: var(--dim); }
.live .status { color: var(--amber); text-shadow: 0 0 8px rgba(255, 150, 60, .6); }
.err .status { color: #ff7a6b; }
.sep { opacity: .5; }

.vu { display: flex; align-items: flex-end; gap: 3px; height: 30px; flex: 0 0 auto; }
.vu i { width: 3px; height: 18%; border-radius: 1px; background: var(--line); }
.live .vu i {
  background: linear-gradient(180deg, var(--amber), var(--amber-hot));
  animation: vu .8s ease-in-out infinite alternate;
  box-shadow: 0 0 6px rgba(255, 150, 60, .35);
}
.vu i:nth-child(2n) { animation-delay: .12s } .vu i:nth-child(3n) { animation-delay: .28s }
.vu i:nth-child(5n) { animation-delay: .05s } .vu i:nth-child(7n) { animation-delay: .2s }
@keyframes vu { from { height: 12% } to { height: 100% } }

.play {
  flex: 0 0 auto; width: 54px; height: 54px; border-radius: 50%;
  border: 1px solid var(--amber-hot); background: rgba(255, 138, 42, .08);
  color: var(--amber); font-size: 17px; cursor: pointer;
  transition: transform .15s, box-shadow .2s, background .2s;
}
.play:hover { background: rgba(255, 138, 42, .16); box-shadow: var(--glow); }
.play:active { transform: scale(.94); }
</style>
