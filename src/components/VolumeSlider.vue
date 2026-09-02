<script setup lang="ts">
import { ref } from "vue";
import { player } from "../composables/player";

const vol = ref(0.8);
try { player.audio.volume = vol.value; } catch { /* iOS 不允许脚本控音量 */ }

function set(v: number) {
  vol.value = Math.min(1, Math.max(0, Math.round(v * 100) / 100));
  try { player.audio.volume = vol.value; } catch { /* 静默降级为系统音量 */ }
}
const step = (d: number) => set(vol.value + d);
</script>

<template>
  <div class="volslider" role="group" aria-label="音量">
    <button class="vol-btn" aria-label="减小音量" @click="step(-0.1)">−</button>
    <input
      class="vol-range" type="range" min="0" max="1" step="0.01"
      :value="vol" :style="{ '--fill': `${vol * 100}%` }" :aria-valuetext="`${Math.round(vol * 100)}%`"
      @input="set(Number(($event.target as HTMLInputElement).value))"
    />
    <button class="vol-btn" aria-label="增大音量" @click="step(0.1)">＋</button>
  </div>
</template>

<style scoped>
.volslider { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.vol-btn {
  width: 30px; height: 30px; border-radius: 50%; border: 1px solid #b9a888; cursor: pointer;
  background: linear-gradient(#faf4e6, #e8dcc2); color: var(--ink); font-size: 15px;
  box-shadow: 0 2px 0 #b9a888; line-height: 1;
}
.vol-btn:active { transform: translateY(2px); box-shadow: none; }
.vol-range {
  -webkit-appearance: none; appearance: none; width: 110px; height: 6px; border-radius: 3px;
  background: linear-gradient(90deg, var(--orange) 0%, var(--orange) 80%, var(--line) 80%);
  background: linear-gradient(90deg, var(--orange) var(--fill, 80%), var(--line) var(--fill, 80%));
  cursor: pointer;
}
.vol-range::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #7a5a3a, var(--wood-1) 70%);
  box-shadow: 0 2px 5px rgba(0,0,0,.4); border: 2px solid var(--cream);
}
.vol-range::-moz-range-thumb {
  width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--cream);
  background: var(--wood-1); box-shadow: 0 2px 5px rgba(0,0,0,.4);
}
</style>
