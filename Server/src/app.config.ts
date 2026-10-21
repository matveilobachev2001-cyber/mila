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

import { MyRoom } from "./rooms/MyRoom.js";


matchMaker.controller.getCorsHeaders = function () {
  return {
    "Access-Control-Allow-Origin": "https://nomer1-5jhz.onrender.com",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Vary": "Origin",
  };
};

const server = defineServer({
  rooms: {
    my_room: defineRoom(MyRoom).enableRealtimeListing(),
    lobby: defineRoom(LobbyRoom),
  },
  routes: createRouter({
    api_hello: createEndpoint("/api/hello", { method: "GET" }, async (ctx) => {
      return { message: "Hello World" };
    }),
  }),
  express: (app) => {
    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "https://nomer1-5jhz.onrender.com");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
      res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");

      if (req.method === "OPTIONS") {
        return res.sendStatus(204);
      }

      next();
    });

    app.get("/hi", (req, res) => {
      res.send("It's time to kick ass and chew bubblegum!");
    });

    if (process.env.NODE_ENV !== "production") {
      app.use("/monitor", monitor());
      app.use("/playground", playground());
    }
  }
});

export default server;
export { server };