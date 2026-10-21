import { defineConfig } from "vite";
import { colyseus } from "colyseus/vite";

export default defineConfig(({ mode }) => ({
  build: { outDir: "dist/client" },
  

server: {
  host: "0.0.0.0",
  port: Number(process.env.PORT) || 2567,
  strictPort: true,
  allowedHosts: true,
  cors: {
    origin: "https://nomer1-5jhz.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With"
    ]
  },
  hmr: {
    clientPort: 443,
  },
},


  plugins: [
    ...(mode === "client" ? [] : [colyseus({ serverEntry: "/src/app.config.ts" })]),
  ],
}));