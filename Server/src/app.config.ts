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
  
    // API: текущая погода (по умолчанию — Москва)
    app.get("/api/weather", async (_req, res) => {
      try {
        const url =
          "https://api.open-meteo.com/v1/forecast" +
          "?latitude=55.7558&longitude=37.6173" +
          "&current=temperature_2m,wind_speed_10m,weather_code" +
          "&wind_speed_unit=kmh&timezone=Europe%2FMoscow";

        const response = await fetch(url);

        if (!response.ok) {
          return res.status(502).json({
            error: "Weather provider unavailable",
          });
        }

        const data = await response.json();
        const current = data.current;

        const descriptions: Record<number, string> = {
          0: "Clear sky",
          1: "Mainly clear",
          2: "Partly cloudy",
          3: "Overcast",
          45: "Fog",
          48: "Depositing rime fog",
          51: "Light drizzle",
          53: "Moderate drizzle",
          55: "Dense drizzle",
          61: "Slight rain",
          63: "Moderate rain",
          65: "Heavy rain",
          71: "Slight snow",
          73: "Moderate snow",
          75: "Heavy snow",
          80: "Rain showers",
          81: "Moderate rain showers",
          82: "Violent rain showers",
          95: "Thunderstorm",
          96: "Thunderstorm with hail",
          99: "Thunderstorm with heavy hail",
        };

        res.set("Cache-Control", "public, max-age=600");
        res.json({
          current_condition: [
            {
              temp_C: String(current.temperature_2m),
              windspeedKmph: String(current.wind_speed_10m),
              weatherDesc: [
                {
                  value:
                    descriptions[current.weather_code] ??
                    "Weather unavailable",
                },
              ],
            },
          ],
        });
      } catch (error) {
        console.error("Weather API error:", error);
        res.status(502).json({ error: "Unable to fetch weather" });
      }
    });

    // API: официальный курс валют ЦБ РФ в XML
    app.get("/api/cbr", async (_req, res) => {
      try {
        const response = await fetch(
          "https://www.cbr.ru/scripts/XML_daily.asp"
        );

        if (!response.ok) {
          return res.status(502).send("Currency provider unavailable");
        }

        const xml = await response.text();

        res.set("Content-Type", "application/xml; charset=utf-8");
        res.set("Cache-Control", "public, max-age=3600");
        res.send(xml);
      } catch (error) {
        console.error("CBR API error:", error);
        res.status(502).send("Unable to fetch currency rates");
      }
    });
  
  }
});

export default server;
export { server };