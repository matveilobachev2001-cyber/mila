import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";

// Класс входных данных (обязательно extends Schema)
export class MoveInput extends Schema {
  @type("number") moveX: number = 0;
  @type("number") moveY: number = 0;
}

export class Player extends Schema {
  @type("string") name: string = "";
  @type("number") score: number = 0;
  @type("boolean") isAlive: boolean = true;
  @type("string") status: string = "lobby";
  @type("number") joinedAt: number = 0;
  @type("number") leftAt: number = 0;
}

export class LeaderboardEntry extends Schema {
  @type("string") name: string = "";
  @type("number") score: number = 0;
  @type("number") date: number = 0;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([LeaderboardEntry]) leaderboard = new ArraySchema<LeaderboardEntry>();
}