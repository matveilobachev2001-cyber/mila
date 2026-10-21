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

const allowAllOrigin = "*";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom.js";

matchMaker.controller.getCorsHeaders = function () {
  return {
    "Access-Control-Allow-Origin": allowAllOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
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
      res.header("Access-Control-Allow-Origin", allowAllOrigin);
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
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