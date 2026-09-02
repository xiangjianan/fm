<script setup lang="ts">
import type { Station } from "../types";
import { player } from "../composables/player";
import { useFavorites } from "../composables/favorites";

defineProps<{ stations: Station[]; title: string }>();

const favs = useFavorites();

// 源无 CORS 的台（xmcdn）仅 Safari 原生 HLS 可播；
// Chromium 的 canPlayType(mpegurl)="maybe" 有欺骗性，改用 UA 嗅探
const isSafari = /^((?!chrome|android|edg).)*safari/i.test(navigator.userAgent);
const limited = (s: Station) => s.safariOnly && !isSafari;

function onRow(s: Station) {
  if (player.current.value?.id === s.id) player.toggle();
  else player.play(s);
}
</script>

<template>
  <section class="stations">
    <div class="head">
      <h2 class="title">{{ title }}</h2>
      <span class="count">{{ stations.length }}</span>
    </div>
    <ul class="scroll">
      <li v-if="!stations.length" class="empty">
        {{ title === "★收藏" ? "还没有收藏，点击电台行的 ★ 收藏" : "没有匹配的电台" }}
      </li>
      <li
        v-for="s in stations"
        :key="s.id"
        class="row"
        :class="{ current: player.current.value?.id === s.id }"
      >
        <button class="play-area" @click="onRow(s)">
          <span class="dot" aria-hidden="true"></span>
          <span class="name">{{ s.name }}<sup v-if="limited(s)" class="s-mark" title="此源仅 Safari / iPhone 可播">S</sup></span>
          <span class="freq">{{ s.freq ? `FM ${s.freq.toFixed(1)}` : "NET" }}</span>
        </button>
        <button
          class="fav" :class="{ on: favs.has(s.id) }"
          :aria-label="favs.has(s.id) ? '取消收藏' : '收藏'" @click="favs.toggle(s.id)"
        >★</button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.stations { min-width: 0; min-height: 0; display: flex; flex-direction: column;
  background: var(--panel); border-radius: 14px; border: 1px solid var(--line); overflow: hidden; }
.head { flex: 0 0 auto; display: flex; align-items: baseline; gap: 8px;
  padding: 13px 16px 11px; border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255,138,42,.05), transparent); }
.title { font-size: 15px; font-weight: 600; letter-spacing: .04em; }
.count { font: 300 11px/1 var(--mono); color: var(--dim); }
.scroll { flex: 1; min-height: 0; overflow-y: auto; list-style: none;
  scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
.scroll::-webkit-scrollbar { width: 4px; }
.scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 2px; }
.empty { padding: 22px 18px; color: var(--dim); font-size: 13px; }

.row { display: flex; align-items: stretch; border-bottom: 1px solid rgba(38,38,48,.45);
  transition: background .14s; }
.row:last-child { border-bottom: none; }
.row:hover { background: var(--panel-2); }
.play-area { flex: 1; display: flex; align-items: center; gap: 10px; min-width: 0;
  padding: 12px 6px 12px 16px; background: none; border: none; cursor: pointer;
  text-align: left; color: var(--text); font: inherit; }
.dot { flex: 0 0 auto; width: 5px; height: 5px; border-radius: 50%; background: var(--line); }
.row.current .dot { background: var(--amber-hot); box-shadow: 0 0 8px var(--amber-hot);
  animation: pulse 1.1s infinite alternate; }
.row.current .name { color: var(--amber); font-weight: 600; }
.name { flex: 1; min-width: 0; font-size: 14.5px; letter-spacing: .02em;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.s-mark { font: 500 9px/1 var(--mono); color: #6a6a78; margin-left: 3px; }
.freq { flex: 0 0 auto; font: 300 12px/1 var(--mono); color: var(--dim); letter-spacing: .04em; }
.row.current .freq { color: var(--amber); opacity: .85; }
.fav { flex: 0 0 auto; padding: 0 14px 0 8px; background: none; border: none; cursor: pointer;
  font-size: 15px; color: #3c3c48; transition: color .15s, transform .15s; }
.fav:hover { color: var(--dim); }
.fav.on { color: var(--amber); text-shadow: 0 0 8px rgba(255, 150, 60, .5); }
.fav:active { transform: scale(.85); }
</style>
