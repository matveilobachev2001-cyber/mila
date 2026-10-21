import { defineConfig } from "vite";
import { colyseus } from "colyseus/vite";

export default defineConfig(({ mode }) => ({
  build: { outDir: "dist/client" },
  server: {
    port: 2567,        // <-- Порт для Colyseus-сервера
    strictPort: true,  // <-- Если порт занят — упасть с ошибкой, а не прыгать на другой
  },
  plugins: [
    ...(mode === "client" ? [] : [colyseus({ serverEntry: "/src/app.config.ts" })]),
  ],
}));