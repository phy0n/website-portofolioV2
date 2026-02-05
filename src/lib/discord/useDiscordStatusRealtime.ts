'use client';

import { useEffect, useRef, useState } from 'react';

import type { DiscordStatus } from '@/components/home/types';

import { normalizeDiscordStatusFromLanyard } from './lanyard';

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord => typeof value === 'object' && value !== null;

const getInitPresence = (payload: unknown, userId: string) => {
  if (!isRecord(payload)) return null;
  if (typeof payload.discord_status === 'string') return payload;
  const maybePresence = payload[userId];
  if (isRecord(maybePresence) && typeof maybePresence.discord_status === 'string') return maybePresence;
  return null;
};

export const useDiscordStatusRealtime = (userId: string | null) => {
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<number | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let disposed = false;

    const cleanup = () => {
      if (heartbeatRef.current !== null) {
        window.clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      if (reconnectRef.current !== null) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onerror = null;
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };

    const applyPresence = (presence: unknown) => {
      const normalized = normalizeDiscordStatusFromLanyard(presence);
      if (normalized) setDiscordStatus(normalized);
    };

    const fetchFallback = async () => {
      try {
        const res = await fetch('/api/discord-status', { cache: 'no-store' });
        const data = (await res.json()) as DiscordStatus & { error?: string };
        if (!disposed && !data?.error) setDiscordStatus(data);
      } catch {
        // ignore
      }
    };

    const scheduleReconnect = () => {
      if (disposed) return;
      const attempt = attemptsRef.current;
      attemptsRef.current = attempt + 1;

      const baseDelay = 1000;
      const maxDelay = 30000;
      const delay = Math.min(maxDelay, baseDelay * 2 ** attempt) + Math.floor(Math.random() * 250);

      reconnectRef.current = window.setTimeout(() => {
        connect();
      }, delay);
    };

    const connect = () => {
      cleanup();
      setConnected(false);
      void fetchFallback();

      if (!userId || disposed) return;

      const socket = new WebSocket('wss://api.lanyard.rest/socket');
      wsRef.current = socket;

      socket.onmessage = (event) => {
        if (disposed) return;
        const raw = typeof event.data === 'string' ? event.data : null;
        if (!raw) return;

        let payload: unknown;
        try {
          payload = JSON.parse(raw) as unknown;
        } catch {
          return;
        }

        if (!isRecord(payload)) return;
        const op = payload.op;

        if (op === 1) {
          const heartbeatInterval = isRecord(payload.d) && typeof payload.d.heartbeat_interval === 'number'
            ? payload.d.heartbeat_interval
            : 30000;

          attemptsRef.current = 0;
          setConnected(true);

          try {
            socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
          } catch {
            // ignore
          }

          if (heartbeatRef.current !== null) {
            window.clearInterval(heartbeatRef.current);
          }

          heartbeatRef.current = window.setInterval(() => {
            if (disposed) return;
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            try {
              wsRef.current.send(JSON.stringify({ op: 3 }));
            } catch {
              // ignore
            }
          }, heartbeatInterval);

          return;
        }

        if (op === 0) {
          const type = payload.t;
          if (type === 'INIT_STATE') {
            applyPresence(getInitPresence(payload.d, userId) ?? payload.d);
          }
          if (type === 'PRESENCE_UPDATE') {
            applyPresence(payload.d);
          }
        }
      };

      socket.onerror = () => {
        // handled by close + reconnect
      };

      socket.onclose = () => {
        if (disposed) return;

        setConnected(false);

        if (heartbeatRef.current !== null) {
          window.clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        scheduleReconnect();
      };
    };

    connect();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [userId]);

  return { discordStatus, connected };
};
