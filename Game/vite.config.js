import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    // Разрешаем доступ только через известные туннельные сервисы
    allowedHosts: [
      '.loca.lt',
      '.ngrok-free.app',
      '.trycloudflare.com',
      'localhost',
    ],
    proxy: {
      // Погода
      '/api/weather': {
        target: 'https://wttr.in',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/weather/, '/Cheboksary?format=j1'),
      },
      // Курс ЦБ
      '/api/cbr': {
        target: 'https://www.cbr.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cbr/, '/scripts/XML_daily.asp'),
      },
      // Colyseus: matchmaking (HTTP)
      '/matchmake': {
        target: 'http://localhost:2567',
        changeOrigin: true,
      },
      // Colyseus: WebSocket
      '/colyseus': {
        target: 'ws://localhost:2567',
        ws: true,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/colyseus/, ''),
      },
    },
  },
})