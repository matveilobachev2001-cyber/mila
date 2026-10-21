import { defineConfig } from "vite";
import { colyseus } from "colyseus/vite";

export default defineConfig(({ mode }) => ({
  build: { outDir: "dist/client" },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.PORT) || 2567,
    strictPort: true,
    allowedHosts: true,
    // Добавляем настройку HMR для WebSocket за прокси Render
    hmr: {
      clientPort: 443, // Render использует HTTPS (порт 443)
    },
  },
  plugins: [
    ...(mode === "client" ? [] : [colyseus({ serverEntry: "/src/app.config.ts" })]),
  ],
}));