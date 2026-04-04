import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { queryKeys } from "@/lib/queryKeys";
import type { ChatMessage } from "@/types/chat";

const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const WS_BASE = import.meta.env.VITE_WS_BASE_URL || `${wsProtocol}//${window.location.host}/api/v1`;
const MAX_RECONNECT = 5;

export function useWebSocket(chatId: number | string | null) {
  const queryClient = useQueryClient();
  const { accessToken } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!chatId || accessToken == null) return;
    const token = accessToken;

    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let connectTimer: ReturnType<typeof setTimeout> | undefined;

    function connect() {
      if (cancelled) return;

      const ws = new WebSocket(
        `${WS_BASE}/chats/ws/${chatId}?token=${encodeURIComponent(token)}`
      );

      ws.onopen = () => {
        if (cancelled) {
          ws.close();
          return;
        }
        reconnectAttempts.current = 0;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const { addMessage, setTyping } = useChatStore.getState();
          switch (data.type) {
            case "message": {
              const msg: ChatMessage = {
                id: data.id,
                chat_group_id: data.chat_group_id,
                sender_id: data.sender_id,
                sender_name: data.sender_name,
                content: data.content,
                created_at: data.created_at,
              };
              addMessage(Number(chatId), msg);
              if (data.sender_id == null) {
                queryClient.invalidateQueries({ queryKey: queryKeys.chats.mine });
              }
              break;
            }
            case "typing":
              setTyping(Number(chatId), data.user_id, data.is_typing);
              break;
            case "offer_received": {
              queryClient.invalidateQueries({ queryKey: queryKeys.offers.received });
              const tid = data.trip_vacancy_id as number | undefined;
              if (tid != null) {
                queryClient.invalidateQueries({
                  queryKey: queryKeys.offers.forTrip(tid),
                });
              }
              break;
            }
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (cancelled) return;
        if (reconnectAttempts.current < MAX_RECONNECT) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          reconnectTimer = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = () => {
        // Let the socket transition to onclose; avoid close() here (noisy in dev, redundant).
      };

      wsRef.current = ws;
    }

    // React 18 Strict Mode runs mount → cleanup → mount in dev. Defer opening the socket so the
    // first (discarded) effect never creates a WebSocket that we immediately close while CONNECTING.
    connectTimer = window.setTimeout(() => {
      connectTimer = undefined;
      connect();
    }, 0);

    return () => {
      cancelled = true;
      if (connectTimer !== undefined) window.clearTimeout(connectTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [chatId, accessToken]);

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "message", content }));
    }
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
    }
  }, []);

  return { sendMessage, sendTyping, isConnected };
}
