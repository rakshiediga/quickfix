/**
 * useRealtimeBooking.js
 * Subscribes to live booking status updates via FastAPI WebSocket
 */
import { useEffect, useRef, useCallback } from 'react';

const getWsBase = () => {
  const customIp = localStorage.getItem('quickfix_custom_api_ip');
  if (customIp) {
    return `ws://${customIp}:8000/ws`;
  }
  return 'ws://localhost:8000/ws';
};

const WS_BASE = getWsBase();

export default function useRealtimeBooking(bookingId, userId, onUpdate) {
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (!userId || !bookingId) return;

    const ws = new WebSocket(`${WS_BASE}/${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Booking tracker connected for user: ${userId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Only handle messages related to this booking
        if (data.booking_id === bookingId || data.type === 'ping_reply') {
          if (data.booking_id === bookingId && onUpdate) {
            onUpdate(data);
          }
        }
      } catch (e) {
        console.warn('[WS] Message parse error:', e);
      }
    };

    ws.onclose = () => {
      console.log(`[WS] Booking tracker disconnected for user: ${userId}`);
    };

    ws.onerror = (err) => {
      console.warn('[WS] Booking tracker connection error:', err);
    };
  }, [bookingId, userId, onUpdate]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);
}
