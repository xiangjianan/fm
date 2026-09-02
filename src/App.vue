<script setup lang="ts">
import { ref, computed } from "vue";
import ProvinceSidebar from "./components/ProvinceSidebar.vue";
import StationList from "./components/StationList.vue";
import PlayerBar from "./components/PlayerBar.vue";
import { STATIONS, REGIONS } from "./data/stations";
import { player } from "./composables/player";
import { useFavorites } from "./composables/favorites";

const FAV = "★收藏";
const favs = useFavorites();

const selectedRegion = ref("中央");
const view = ref<"provinces" | "stations">("provinces");   // 仅移动端使用
const query = ref("");

const regions = computed(() => [FAV, ...REGIONS]);
const counts = computed<Record<string, number>>(() => {
  const c: Record<string, number> = { [FAV]: favs.ids.value.size };
  for (const s of STATIONS) c[s.region] = (c[s.region] ?? 0) + 1;
  return c;
});

const visibleStations = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (q) return STATIONS.filter(s => (s.name + s.region).toLowerCase().includes(q));
  if (selectedRegion.value === FAV) return STATIONS.filter(s => favs.has(s.id));
  return STATIONS.filter(s => s.region === selectedRegion.value);
});

// 刻度盘：87.5–108 线性映射，无频率台按 99.0 落位
const needlePos = computed(() => {
  const f = player.current.value?.freq || 99.0;
  return Math.min(100, Math.max(0, (f - 87.5) / (108 - 87.5) * 100)) + "%";
});

function selectRegion(r: string) {
  selectedRegion.value = r;
  query.value = "";
  view.value = "stations";
}
function back() {
  view.value = "provinces";
  query.value = "";
}
</script>

<template>
  <div
    class="radio"
    :class="{ 'is-playing': player.state.value === 'playing', 'is-error': player.state.value === 'error' }"
  >
    <div class="dial">
      <div class="dial-scale"><div class="needle" :style="{ left: needlePos }"></div></div>
      <div class="dial-nums"><span>88</span><span>92</span><span>96</span><span>100</span><span>104</span><span>108</span></div>
    </div>

    <div class="search-row">
      <input v-model="query" type="search" class="search-box" placeholder="搜索电台 / 省份…" />
    </div>

    <div class="main" :data-view="query ? 'stations' : view">
      <ProvinceSidebar
        :regions="regions"
        :counts="counts"
        :active="selectedRegion"
        :playing-region="player.current.value?.region"
        @select="selectRegion"
        @back="back"
      />
      <StationList
        :stations="visibleStations"
        :title="query ? '搜索结果' : selectedRegion"
        @back="back"
      />
    </div>

    <PlayerBar />
  </div>
</template>
