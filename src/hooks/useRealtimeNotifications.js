/**
 * useRealtimeNotifications.js
 * Subscribes to live notification pushes via FastAPI WebSocket
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

export default function useRealtimeNotifications(userId, onNotification) {
  const wsRef = useRef(null);

  const connect = useCallback(() => {
    if (!userId) return;

    const ws = new WebSocket(`${WS_BASE}/${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log(`[WS] Notifications connected for user: ${userId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const notifTypes = [
          'new_booking', 'booking_accepted', 'booking_rejected',
          'service_started', 'service_completed', 'new_review',
          'account_approved', 'account_rejected', 'new_chat_message'
        ];
        if (notifTypes.includes(data.type) && onNotification) {
          onNotification(data);
        }
      } catch (e) {
        console.warn('[WS] Notification parse error:', e);
      }
    };

    ws.onclose = () => {
      console.log(`[WS] Notifications disconnected for user: ${userId}`);
    };

    ws.onerror = (err) => {
      console.warn('[WS] Notification connection error:', err);
    };
  }, [userId, onNotification]);

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

// Also export as named export for backward compatibility
export { useRealtimeNotifications };
