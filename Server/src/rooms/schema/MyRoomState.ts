import { schema, t, type SchemaType } from "@colyseus/schema";

export const Player = schema({
  name: t.string(),
  score: t.number(),
  isAlive: t.boolean(),
  status: t.string(),        // 'lobby' | 'playing' | 'left'
  joinedAt: t.number(),
  leftAt: t.number(),        // 0 пока активен, метка времени — после выхода
});
export type Player = SchemaType<typeof Player>;

export const LeaderboardEntry = schema({
  name: t.string(),
  score: t.number(),
  date: t.number(),
});
export type LeaderboardEntry = SchemaType<typeof LeaderboardEntry>;

export const MoveInput = schema({
  moveX: t.number(),
  moveY: t.number(),
});
export type MoveInput = SchemaType<typeof MoveInput>;

export const MyRoomState = schema({
  players: t.map(Player),
  leaderboard: t.array(LeaderboardEntry),
});
export type MyRoomState = SchemaType<typeof MyRoomState>;