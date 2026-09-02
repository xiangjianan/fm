import { describe, it, expect, vi, beforeEach } from "vitest";

/** 浏览器 Audio 的最小替身（node 环境） */
class FakeAudio {
  listeners: Record<string, Array<() => void>> = {};
  src = "";
  volume = 1;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  canPlayType = (t: string) => (t.includes("mpegurl") ? "" : "maybe");
  addEventListener(ev: string, fn: () => void) {
    (this.listeners[ev] ||= []).push(fn);
  }
  emit(ev: string) {
    (this.listeners[ev] || []).forEach(fn => fn());
  }
}

let fake: FakeAudio;

vi.stubGlobal("Audio", class extends FakeAudio {
  constructor() { super(); fake = this; }
});

// 动态导入：确保 stub 先于模块级单例 usePlayer() 执行
const { usePlayer } = await import("../src/composables/player");
import type { Station } from "../src/types";

const st = (over: Partial<Station> = {}): Station => ({
  id: "t1", name: "测试台", freq: 99.0, region: "中央",
  url: "https://example.com/main.m3u8",
  backup: "https://example.com/backup.m3u8",
  ...over,
});

beforeEach(() => {
  vi.useFakeTimers();
});

describe("player 状态机", () => {
  it("play() → loading → playing（playing 事件）", () => {
    const p = usePlayer();
    p.play(st());
    expect(p.state.value).toBe("loading");
    expect(fake.src).toBe("https://example.com/main.m3u8");
    fake.emit("playing");
    expect(p.state.value).toBe("playing");
  });

  it("playing 状态下 toggle → 暂停", () => {
    const p = usePlayer();
    p.play(st());
    fake.emit("playing");
    p.toggle();
    expect(fake.pause).toHaveBeenCalled();
    expect(p.state.value).toBe("paused");
  });

  it("瞬时 waiting 只显示 loading，不重启", () => {
    const p = usePlayer();
    p.play(st());
    fake.emit("playing");
    fake.emit("waiting");
    expect(p.state.value).toBe("loading");
    expect(fake.play).toHaveBeenCalledTimes(1);   // 未重新 start
  });
});

describe("player 失败重试链", () => {
  it("同源重试 2 次 → 切备源 → 再失败 2 次 → error", () => {
    const p = usePlayer();
    p.play(st());

    // 主源第 1、2 次错误 → 1s / 3s 退避重试
    fake.emit("error"); vi.advanceTimersByTime(1000);
    fake.emit("error"); vi.advanceTimersByTime(3000);
    expect(fake.play).toHaveBeenCalledTimes(3);   // 初始 + 2 次重试

    // 第 3 次错误 → 切换备源
    fake.emit("error"); vi.advanceTimersByTime(500);
    expect(fake.src).toBe("https://example.com/backup.m3u8");
    expect(p.state.value).toBe("loading");

    // 备源重试 2 次
    fake.emit("error"); vi.advanceTimersByTime(1000);
    fake.emit("error"); vi.advanceTimersByTime(3000);

    // 备源也耗尽 → error
    fake.emit("error");
    expect(p.state.value).toBe("error");
  });

  it("error 状态下 retry() 恢复 loading", () => {
    const p = usePlayer();
    p.play(st({ backup: undefined }));
    fake.emit("error"); vi.advanceTimersByTime(1000);
    fake.emit("error"); vi.advanceTimersByTime(3000);
    fake.emit("error");
    expect(p.state.value).toBe("error");
    p.retry();
    expect(p.state.value).toBe("loading");
  });
});
