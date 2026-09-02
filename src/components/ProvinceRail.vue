<script setup lang="ts">
defineProps<{
  regions: string[];
  counts: Record<string, number>;
  active: string;
  playingRegion?: string;
}>();
defineEmits<{ select: [region: string] }>();

const label = (r: string) => (r === "★收藏" ? "★" : r);
</script>

<template>
  <nav class="rail" aria-label="省份">
    <div class="rail-scroll">
      <button
        v-for="r in regions"
        :key="r"
        class="rail-item"
        :class="{ active: r === active }"
        @click="$emit('select', r)"
      >
        <span class="rail-name">{{ label(r) }}</span>
        <span v-if="r === playingRegion" class="onair" aria-hidden="true"></span>
        <span class="rail-count">{{ counts[r] ?? 0 }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.rail { min-height: 0; display: flex; }
.rail-scroll {
  flex: 1; min-height: 0; overflow-y: auto;
  display: flex; flex-direction: column;
  scrollbar-width: none;
}
.rail-scroll::-webkit-scrollbar { display: none; }
.rail-item {
  position: relative; flex: 0 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 9px 2px 8px; border: none; background: none; cursor: pointer;
  color: var(--dim); border-bottom: 1px solid rgba(38, 38, 48, .5);
  transition: color .15s;
}
.rail-item:hover { color: var(--text); }
.rail-item.active { color: var(--amber); }
.rail-item.active::before {
  content: ""; position: absolute; left: -8px; top: 8px; bottom: 8px; width: 2px;
  border-radius: 1px; background: var(--amber-hot); box-shadow: var(--glow);
}
.rail-name { font-size: 13px; font-weight: 500; line-height: 1.25; letter-spacing: .02em; }
.rail-count { font: 300 10px/1 var(--mono); opacity: .65; }
.onair {
  position: absolute; top: 7px; right: 7px; width: 4px; height: 4px; border-radius: 50%;
  background: var(--amber-hot); box-shadow: 0 0 6px var(--amber-hot);
  animation: pulse 1.1s infinite alternate;
}
</style>
