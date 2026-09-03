<script setup lang="ts">
import { ref, computed } from "vue";
import TopPlayer from "./components/TopPlayer.vue";
import ProvinceRail from "./components/ProvinceRail.vue";
import StationList from "./components/StationList.vue";
import { STATIONS, REGIONS } from "./data/stations";
import { player } from "./composables/player";
import { useFavorites } from "./composables/favorites";

const FAV = "★收藏";
const favs = useFavorites();

const selectedRegion = ref("中央");
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

function selectRegion(r: string) {
  selectedRegion.value = r;
  query.value = "";
}
</script>

<template>
  <div class="shell">
    <!-- 顶栏固定：刻度带 + 当前台 + 播放控制 -->
    <TopPlayer />

    <div class="search-row">
      <input v-model="query" type="search" class="search-box" placeholder="搜索电台 / 省份" />
    </div>

    <!-- 同页双栏：左窄省份轨道 + 右电台列表 -->
    <div class="main">
      <ProvinceRail
        :regions="regions"
        :counts="counts"
        :active="query ? '' : selectedRegion"
        :playing-region="player.current.value?.region"
        @select="selectRegion"
      />
      <StationList
        :stations="visibleStations"
        :title="query ? '搜索结果' : selectedRegion"
      />
    </div>

    <!-- 底部由 .shell::after 的渐变过渡与安全区融为一体，不再占用列表空间 -->
  </div>
</template>
