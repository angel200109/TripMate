import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

import pxtorem from "postcss-pxtorem";
// https://vite.dev/config/

export default defineConfig({
  base: "/FunTrip",
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
    host: "localhost",
    port: 8080,
    open: true,
    proxy: {
      "/api": {
        target: "http://172.0.0.1:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
