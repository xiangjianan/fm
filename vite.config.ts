/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/fm/",            // GitHub Pages 子路径
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      // registerSW.js 只在 window load 里注册 SW，没有理由阻塞解析
      injectRegister: "script-defer",
      // 自托管字体也要进 precache：否则每次启动都回源站拉 2 个 woff2
      includeAssets: ["favicon.svg", "fonts/*.woff2"],
      manifest: {
        name: "山河收音机",
        short_name: "山河收音机",
        description: "复古收音机 · 在线收听全国各省电台直播",
        theme_color: "#0a0a0c",
        background_color: "#0a0a0c",
        display: "standalone",
        start_url: "/fm/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // 音频直播流绝不缓存（直播语义 + 体积不可控）
        navigateFallbackDenylist: [/\.m3u8$/, /\.mp3$/, /\.aac$/],
        runtimeCaching: [],
      },
    }),
  ],
  test: { environment: "node" },
});
