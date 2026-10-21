import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@colyseus/sdk';

const SERVER_URL = window.location.origin.replace(/^http/, 'ws') + '/colyseus';
const ROOM_NAME = 'my_room';

export function useColyseus() {
  const [status, setConnStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [players, setPlayers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [mySessionId, setMySessionId] = useState(null);
  const roomRef = useRef(null);
  const prevPlayersRef = useRef(new Map());
  const firstSyncRef = useRef(true);

  const pushToast = useCallback((type, name) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, name }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const connect = useCallback(async (name) => {
    if (roomRef.current) return;
    setConnStatus('connecting');
    setError(null);
    firstSyncRef.current = true;

    try {
      const client = new Client(SERVER_URL);
      const room = await client.joinOrCreate(ROOM_NAME, { name });
      roomRef.current = room;
      setMySessionId(room.sessionId);
      setConnStatus('connected');

      const syncState = (state) => {
        if (!state || !state.players) return;

        const list = [];
        state.players.forEach((player, sessionId) => {
          list.push({
            sessionId,
            name: player?.name ?? 'Unknown',
            score: player?.score ?? 0,
            isAlive: player?.isAlive ?? true,
            status: player?.status ?? 'lobby',
            joinedAt: player?.joinedAt ?? 0,
            leftAt: player?.leftAt ?? 0,
          });
        });

        // ----- Уведомления -----
        const oldMap = prevPlayersRef.current;
        if (!firstSyncRef.current) {
          for (const p of list) {
            const old = oldMap.get(p.sessionId);
            if (p.sessionId === room.sessionId) continue;

            // Новый игрок появился в списке
            if (!old) {
              pushToast('join', p.name);
            }
            // Игрок перешёл в статус "left"
            else if (old.status !== 'left' && p.status === 'left') {
              pushToast('leave', p.name);
            }
          }
        }
        firstSyncRef.current = false;

        prevPlayersRef.current = new Map(list.map((p) => [p.sessionId, p]));
        setPlayers(list);

        // ----- Таблица рекордов -----
        if (state.leaderboard) {
          const lb = [];
          state.leaderboard.forEach((entry) => {
            lb.push({
              name: entry?.name ?? '?',
              score: entry?.score ?? 0,
              date: entry?.date ?? 0,
            });
          });
          setLeaderboard(lb);
        }
      };

      room.onStateChange(syncState);

      room.onLeave(() => {
        roomRef.current = null;
        setConnStatus('idle');
        setPlayers([]);
        setLeaderboard([]);
        setMySessionId(null);
        prevPlayersRef.current = new Map();
        firstSyncRef.current = true;
      });
    } catch (err) {
      console.error('[colyseus] Ошибка подключения:', err);
      setError(err.message || 'Не удалось подключиться к серверу');
      setConnStatus('error');
    }
  }, [pushToast]);

  const submitScore = useCallback((score) => {
    if (!roomRef.current) return;
    roomRef.current.send('submitScore', { score });
  }, []);

  const updatePlayerStatus = useCallback((newStatus) => {
    if (!roomRef.current) return;
    roomRef.current.send('setStatus', { status: newStatus });
  }, []);

  const leave = useCallback(() => {
    if (roomRef.current) {
      roomRef.current.leave();
      roomRef.current = null;
    }
    setConnStatus('idle');
    setPlayers([]);
    setLeaderboard([]);
    setMySessionId(null);
    prevPlayersRef.current = new Map();
    firstSyncRef.current = true;
  }, []);

  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.leave();
    };
  }, []);

  return {
    status,
    error,
    players,
    leaderboard,
    toasts,
    mySessionId,
    connect,
    leave,
    submitScore,
    updatePlayerStatus,
  };
}