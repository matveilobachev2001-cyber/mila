import { defineConfig } from "vite";
import { colyseus } from "colyseus/vite";

export default defineConfig(({ mode }) => ({
  build: { outDir: "dist/client" },
  server: {
    host: "0.0.0.0",                       // Разрешаем подключения извне (для Render)
    port: Number(process.env.PORT) || 2567, // Берем порт Render, либо 2567 локально
    strictPort: true,                      // Если порт занят — упасть с ошибкой
    allowedHosts: true,                    // Разрешаем запросы с домена Render
  },
  plugins: [
    ...(mode === "client" ? [] : [colyseus({ serverEntry: "/src/app.config.ts" })]),
  ],
}));