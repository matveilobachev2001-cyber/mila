import {
  defineServer,
  defineRoom,
  monitor,
  playground,
  createRouter,
  createEndpoint,
  LobbyRoom,
  matchMaker,
} from "colyseus";

const FRONTEND_ORIGINS = [
  "https://mila-1.onrender.com",
  "https://mila.onrender.com",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:3000",
].filter(Boolean);

const allowOrigin = (origin?: string) => {
  if (!origin) return "*";
  return FRONTEND_ORIGINS.includes(origin) ? origin : "*";
};

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom.js";

matchMaker.controller.getCorsHeaders = function (req) {
  const origin = req.headers.origin;
  return {
    "Access-Control-Allow-Origin": allowOrigin(origin),
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
};

const server = defineServer({

  /**
   * Define your room handlers:
   */
  rooms: {
    my_room: defineRoom(MyRoom).enableRealtimeListing(),
    lobby: defineRoom(LobbyRoom),
  },

  /**
   * Experimental: Define API routes. Built-in integration with the "playground" and SDK.
   */
  routes: createRouter({
    api_hello: createEndpoint("/api/hello", { method: "GET" }, async (ctx) => {
      return { message: "Hello World" };
    }),
  }),

  /**
   * Bind your custom express routes here:
   */
  express: (app) => {

    app.use((req, res, next) => {
      const origin = req.headers.origin;
      const corsOrigin = allowOrigin(origin);

      res.header("Access-Control-Allow-Origin", corsOrigin);
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Vary", "Origin");

      if (req.method === "OPTIONS") {
        return res.sendStatus(204);
      }

      next();
    });

    app.get("/hi", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    /**
     * Use @colyseus/monitor
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/monitor", monitor());
    }

    /**
     * Use @colyseus/playground
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/playground", playground());
    }
  }
});

export default server;

/** Named export read by the `colyseus/vite` plugin's `serverEntry`. */
export { server };