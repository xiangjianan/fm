import { createApp } from "vue";
import App from "./App.vue";
import { warmHls } from "./composables/player";
import "./style.css";

createApp(App).mount("#app");

// 首帧之后再拉播放内核，不占冷启动关键路径
const idle = (globalThis as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
if (idle) idle(() => warmHls());
else setTimeout(warmHls, 1200);
