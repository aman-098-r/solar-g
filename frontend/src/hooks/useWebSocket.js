// src/hooks/useWebSocket.js
import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = import.meta.env.VITE_BACKEND_WS_URL || "ws://localhost:4000";
const RECONNECT_DELAY_MS = 3000;

/**
 * useWebSocket — connects to the Node backend WebSocket,
 * returns the latest parsed message and connection state.
 */
export function useWebSocket() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setConnected(true);
      clearTimeout(reconnectTimer.current);
      // heartbeat
      const hb = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 20000);
      ws._hbInterval = hb;
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "firebase_update") {
          setData(msg.data);
        }
      } catch (_) {}
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      clearInterval(ws._hbInterval);
      setConnected(false);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectTimer.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { data, connected };
}
