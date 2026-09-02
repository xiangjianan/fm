import { ref, computed } from "vue";

const KEY = "fm-favorites";

const load = (): Set<string> => {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();   // 隐私模式 / 解析失败：降级内存态
  }
};

const ids = ref<Set<string>>(load());

const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids.value]));
  } catch { /* 隐私模式：静默降级 */ }
};

export function useFavorites() {
  return {
    ids: computed(() => ids.value),
    has: (id: string) => ids.value.has(id),
    toggle: (id: string) => {
      const next = new Set(ids.value);
      if (next.has(id)) next.delete(id); else next.add(id);
      ids.value = next;      // 不可变更新，触发响应式
      save();
    },
  };
}
