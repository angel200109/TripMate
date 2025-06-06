import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

import pxtorem from "postcss-pxtorem";
// https://vite.dev/config/

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  css: {
    postcss: {
      plugins: [
        pxtorem({
          rootValue: 37.5,
          propList: ["*"],
          unitPrecision: 3,
        }),
      ],
    },
  },
  server: {
    host: "172.22.235.67",
    port: 3000,
    open: true,
  },
});
