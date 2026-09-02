import { describe, it, expect, vi, beforeAll } from "vitest";

const store = new Map<string, string>();
const mockLS = {
  getItem: vi.fn((k: string) => store.get(k) ?? null),
  setItem: vi.fn((k: string, v: string) => { store.set(k, v); }),
};

let useFavorites: typeof import("../src/composables/favorites").useFavorites;

beforeAll(async () => {
  vi.stubGlobal("localStorage", mockLS);
  ({ useFavorites } = await import("../src/composables/favorites"));
});

describe("favorites", () => {
  it("toggle 收藏/取消，has 判定", () => {
    const f = useFavorites();
    expect(f.has("a")).toBe(false);
    f.toggle("a");
    expect(f.has("a")).toBe(true);
    f.toggle("a");
    expect(f.has("a")).toBe(false);
  });

  it("持久化到 localStorage", () => {
    const f = useFavorites();
    f.toggle("b1");
    f.toggle("b2");
    expect(mockLS.setItem).toHaveBeenCalledWith("fm-favorites", expect.any(String));
    const saved = JSON.parse(store.get("fm-favorites")!);
    expect(saved).toContain("b1");
    expect(saved).toContain("b2");
  });

  it("localStorage 写入抛异常不崩（隐私模式降级）", () => {
    mockLS.setItem.mockImplementationOnce(() => { throw new Error("denied"); });
    const f = useFavorites();
    expect(() => f.toggle("c1")).not.toThrow();
    expect(f.has("c1")).toBe(true);
  });

  it("读取损坏数据降级为空集", () => {
    store.set("fm-favorites", "{not json");
    expect(() => useFavorites()).not.toThrow();
  });
});
