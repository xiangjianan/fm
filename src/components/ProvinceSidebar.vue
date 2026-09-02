<script setup lang="ts">
defineProps<{
  regions: string[];
  counts: Record<string, number>;
  active: string;
  playingRegion?: string;
}>();
defineEmits<{ select: [region: string]; back: [] }>();
</script>

<template>
  <nav class="sidebar" aria-label="省份选择">
    <button class="back" @click="$emit('back')">‹ 省份</button>
    <div class="sidebar-scroll">
      <button
        v-for="r in regions"
        :key="r"
        class="prov"
        :class="{ active: r === active }"
        @click="$emit('select', r)"
      >
        <span v-if="r === playingRegion" class="playing-dot" aria-hidden="true"></span>
        <span class="prov-name">{{ r }}</span>
        <span class="prov-count">{{ counts[r] ?? 0 }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.sidebar { display: flex; flex-direction: column; min-height: 0; }
.back { display: none; flex: 0 0 auto; }
.sidebar-scroll { flex: 1; min-height: 0; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: var(--line) transparent; }
.sidebar-scroll::-webkit-scrollbar { width: 5px; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: var(--line); border-radius: 3px; }
.prov {
  display: flex; align-items: center; gap: 8px; width: 100%;
  padding: 9px 12px; border: none; background: none; cursor: pointer;
  font: inherit; font-size: 14px; color: var(--ink);
  border-bottom: 1px dashed var(--line); text-align: left;
}
.prov.active { background: var(--orange); color: #fff; font-weight: 700; }
.prov.active .prov-count { background: rgba(255,255,255,.3); }
.playing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--orange); flex: 0 0 auto;
  box-shadow: 0 0 5px var(--orange); animation: pulse 1s infinite alternate; }
.prov.active .playing-dot { background: #fff; box-shadow: 0 0 5px #fff; }
.prov-name { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prov-count { font-size: 11px; font-family: ui-monospace, Menlo, monospace; opacity: .75;
  background: rgba(0,0,0,.06); border-radius: 8px; padding: 1px 7px; }
@media (max-width: 767px) {
  .back {
    display: block; margin: 0 0 4px; padding: 8px 12px; border: 1px solid #b9a888;
    background: linear-gradient(#faf4e6, #e8dcc2); border-radius: 6px;
    font: inherit; font-size: 14px; color: var(--ink); cursor: pointer;
    box-shadow: 0 3px 0 #b9a888;
  }
}
</style>
