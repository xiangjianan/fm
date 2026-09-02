/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "/fm/",            // GitHub Pages 子路径（Task 5 部署）
  plugins: [vue()],
  test: { environment: "node" },
});
