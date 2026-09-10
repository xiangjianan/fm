import { describe, it, expect } from "vitest";
import { STATIONS, REGIONS } from "../src/data/stations";

describe("stations 数据完整性", () => {
  it("id 唯一", () => {
    expect(new Set(STATIONS.map(s => s.id)).size).toBe(STATIONS.length);
  });

  it("region 全部已定义且无空省", () => {
    const used = new Set(STATIONS.map(s => s.region));
    expect([...used].filter(r => !REGIONS.includes(r))).toEqual([]);
    expect(REGIONS.filter(r => !used.has(r))).toEqual([]);
  });

  it("freq 合法、url 全 https", () => {
    for (const s of STATIONS) {
      expect(s.freq).toBeGreaterThanOrEqual(0);
      expect(s.freq).toBeLessThanOrEqual(108);
      expect(s.url).toMatch(/^https:\/\//);
      if (s.backup) expect(s.backup).toMatch(/^https:\/\//);
    }
  });

  it("规模 ≥ 220（v2.2 省会台与音乐台扩充后）", () => {
    expect(STATIONS.length).toBeGreaterThanOrEqual(220);
  });

  it("safariOnly 台的 url 必须是 https（iOS 自动升级要求）", () => {
    for (const s of STATIONS.filter(x => x.safariOnly)) {
      expect(s.url).toMatch(/^https:\/\//);
    }
  });
});
