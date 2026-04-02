import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import type { ChatMessage } from "@/types/chat";

const WS_BASE = import.meta.env.VITE_WS_BASE_URL || `ws://${window.location.host}/api/v1`;
const MAX_RECONNECT = 5;

export function useWebSocket(chatId: number | string | null) {
  const { accessToken } = useAuthStore();
  const { addMessage, setTyping } = useChatStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!chatId || !accessToken) return;

    function connect() {
      const ws = new WebSocket(
        `${WS_BASE}/chats/ws/${chatId}?token=${accessToken}`
      );

      ws.onopen = () => {
        reconnectAttempts.current = 0;
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
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
              break;
            }
            case "typing":
              setTyping(Number(chatId), data.user_id, data.is_typing);
              break;
          }
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        if (reconnectAttempts.current < MAX_RECONNECT) {
          const delay = Math.min(1000 * 2 ** reconnectAttempts.current, 30000);
          setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    }

    connect();

    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [chatId, accessToken, addMessage, setTyping]);

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
