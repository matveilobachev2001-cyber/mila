import { Room, Client, CloseCode } from "colyseus";
import { MyRoomState, Player, LeaderboardEntry } from "./schema/MyRoomState.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEADERBOARD_FILE = path.join(__dirname, "..", "..", "data", "leaderboard.json");
const MAX_LEADERBOARD = 5;

type LeaderboardRecord = { name: string; score: number; date: number };

function loadLeaderboard(): LeaderboardRecord[] {
  try {
    if (!fs.existsSync(LEADERBOARD_FILE)) return [];
    const raw = fs.readFileSync(LEADERBOARD_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("[leaderboard] load failed:", err);
    return [];
  }
}

function saveLeaderboard(data: LeaderboardRecord[]) {
  try {
    const dir = path.dirname(LEADERBOARD_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LEADERBOARD_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[leaderboard] save failed:", err);
  }
}

export class MyRoom extends Room<{ state: MyRoomState }> {
  maxClients = 8;
  state = new MyRoomState();

  private leaderboard: LeaderboardRecord[] = [];

  onCreate(_options: any) {
    console.log("Room created:", this.roomId);
    this.leaderboard = loadLeaderboard();
    this.syncLeaderboardToState();
  }

  private syncLeaderboardToState() {
    this.state.leaderboard.splice(0, this.state.leaderboard.length);
    for (const entry of this.leaderboard) {
      this.state.leaderboard.push(
        new LeaderboardEntry({
          name: entry.name,
          score: entry.score,
          date: entry.date,
        }),
      );
    }
  }

  private addToLeaderboard(name: string, score: number) {
  // Ищем существующую запись с таким же именем
  const existingIdx = this.leaderboard.findIndex((e) => e.name === name);

  if (existingIdx >= 0) {
    // Обновляем только если новый счёт выше
    if (score > this.leaderboard[existingIdx].score) {
      this.leaderboard[existingIdx].score = score;
      this.leaderboard[existingIdx].date = Date.now();
      console.log(`[leaderboard] обновил рекорд ${name}: ${score}`);
    } else {
      console.log(`[leaderboard] ${name} результат ${score} не улучшил свой рекорд`);
    }
  } else {
    // Новая запись
    this.leaderboard.push({ name, score, date: Date.now() });
    console.log(`[leaderboard] добавил ${name}: ${score}`);
  }

  this.leaderboard.sort((a, b) => b.score - a.score);
  this.leaderboard = this.leaderboard.slice(0, MAX_LEADERBOARD);
  saveLeaderboard(this.leaderboard);
  this.syncLeaderboardToState();
}

  messages = {
    setStatus: (client: Client, data: { status: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (!["lobby", "playing"].includes(data?.status)) return;
      player.status = data.status;
    },

    submitScore: (client: Client, data: { score: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (typeof data?.score !== "number") return;

      if (data.score > player.score) player.score = data.score;
      player.status = "lobby";

      if (data.score > 0) {
        this.addToLeaderboard(player.name, data.score);
        console.log(`[leaderboard] ${player.name} добавил ${data.score} очков`);
      }
    },
  };

  onJoin(client: Client, options: { name?: string }) {
    const name = (options?.name || "Anonymous").toString().slice(0, 20);
    console.log(`[join] ${name} (${client.sessionId})`);

    // Если в списке уже есть запись с таким же именем и статусом 'left' —
    // значит игрок вернулся. Убираем старую запись, чтобы не было дубликата.
    const stale: string[] = [];
    this.state.players.forEach((p, sid) => {
      if (p.name === name) stale.push(sid);
    });
    for (const sid of stale) {
      console.log(`[join] убираю старую запись ${name} (${sid})`);
      this.state.players.delete(sid);
    }

    this.state.players.set(
      client.sessionId,
      new Player({
        name,
        score: 0,
        isAlive: true,
        status: "lobby",
        joinedAt: Date.now(),
        leftAt: 0,
      }),
    );
  }

  onLeave(client: Client, _code: CloseCode) {
    const player = this.state.players.get(client.sessionId);
    if (player) {
      console.log(`[leave] ${player.name} (${client.sessionId}) — статус 'left'`);
      player.status = "left";
      player.isAlive = false;
      player.leftAt = Date.now();
    }
    // НЕ удаляем игрока из state — он остаётся в списке навсегда,
    // помеченный как «вышел» (💤). Уберётся только если вернётся с тем же именем.
  }

  onDrop(client: Client, _code: CloseCode) {
    this.allowReconnection(client, 30).catch(() => {});
  }

  onReconnect(client: Client) {
    console.log(`[reconnect] ${client.sessionId}`);
    const player = this.state.players.get(client.sessionId);
    if (player) {
      player.status = "lobby";
      player.leftAt = 0;
      player.isAlive = true;
    }
  }

  onDispose() {
    console.log("Room disposing:", this.roomId);
  }
}