<script setup lang="ts">
import type { Station } from "../types";
import { player } from "../composables/player";
import { useFavorites } from "../composables/favorites";

defineProps<{ stations: Station[]; title: string }>();
defineEmits<{ back: [] }>();

const favs = useFavorites();

function onRow(s: Station) {
  if (player.current.value?.id === s.id) player.toggle();
  else player.play(s);
}
</script>

<template>
  <section class="stations">
    <div class="stations-head">
      <button class="back" @click="$emit('back')">‹ 返回</button>
      <h2 class="stations-title">{{ title }}</h2>
    </div>
    <ul class="stations-scroll">
      <li v-if="!stations.length" class="empty">
        {{ title === "★收藏" ? "还没有收藏，点击电台行的 ★ 收藏" : "没有匹配的电台" }}
      </li>
      <li
        v-for="s in stations"
        :key="s.id"
        class="station"
        :class="{ current: player.current.value?.id === s.id }"
      >
        <button class="st-play" @click="onRow(s)">
          <span class="st-dot"></span>
          <span class="st-name">{{ s.name }}</span>
          <span class="st-freq">{{ s.freq ? `FM ${s.freq.toFixed(1)}` : "NET" }}</span>
        </button>
        <button
          class="st-fav" :class="{ on: favs.has(s.id) }"
          :aria-label="favs.has(s.id) ? '取消收藏' : '收藏'" @click="favs.toggle(s.id)"
        >★</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.stations { display: flex; flex-direction: column; min-height: 0; min-width: 0; }
.stations-head { display: flex; align-items: center; gap: 8px; padding-bottom: 6px; }
.back { display: none; }
.stations-title { font-size: 15px; font-weight: 700; color: var(--ink); }
.stations-scroll { list-style: none; overflow-y: auto; flex: 1; min-height: 0;
  scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
.stations-scroll::-webkit-scrollbar { width: 5px; }
.stations-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
.empty { color: #8a7a5f; font-size: 13px; padding: 18px 6px; }
.station { display: flex; align-items: center; border-bottom: 1px dashed var(--line); }
.st-play { flex: 1; display: flex; align-items: center; gap: 10px; padding: 11px 6px;
  background: none; border: none; font: inherit; color: var(--ink); cursor: pointer; text-align: left;
  min-width: 0; }
.st-dot { flex: 0 0 auto; width: 7px; height: 7px; border-radius: 50%; background: var(--line); }
.station.current .st-name { color: var(--orange); font-weight: 700; }
.station.current .st-dot { background: var(--orange); box-shadow: 0 0 6px var(--orange); }
:global(.is-playing) .station.current .st-dot { animation: pulse 1s infinite alternate; }
.st-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.st-freq { flex: 0 0 auto; font-family: ui-monospace, Menlo, monospace; font-size: 13px; opacity: .65; }
.st-fav { flex: 0 0 auto; background: none; border: none; font-size: 17px; color: var(--line);
  cursor: pointer; padding: 8px; }
.st-fav.on { color: var(--orange); }
@media (max-width: 767px) {
  .back {
    display: block; padding: 7px 12px; border: 1px solid #b9a888;
    background: linear-gradient(#faf4e6, #e8dcc2); border-radius: 6px;
    font: inherit; font-size: 14px; color: var(--ink); cursor: pointer;
    box-shadow: 0 3px 0 #b9a888;
  }
}
</style>
