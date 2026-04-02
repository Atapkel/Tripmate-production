import { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users } from "lucide-react";
import { chatService } from "@/services/chatService";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { queryKeys } from "@/lib/queryKeys";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { ChatInput } from "@/components/chat/ChatInput";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/lib/constants";
import { formatMessageDate } from "@/lib/formatters";

export default function ChatRoomPage() {
  const { id } = useParams();
  const chatId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { messagesByChat, typingUsers, setMessages, setActiveChat, clearUnread } = useChatStore();
  const { sendMessage, sendTyping, isConnected } = useWebSocket(chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: chat } = useQuery({
    queryKey: queryKeys.chats.detail(chatId),
    queryFn: () => chatService.getById(chatId).then((r) => r.data),
    enabled: !!chatId,
  });

  const { data: fetchedMessages, isLoading } = useQuery({
    queryKey: queryKeys.chats.messages(chatId),
    queryFn: () => chatService.getRecentMessages(chatId).then((r) => r.data),
    enabled: !!chatId,
  });

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(chatId, fetchedMessages);
    }
  }, [fetchedMessages, chatId, setMessages]);

  useEffect(() => {
    setActiveChat(chatId);
    clearUnread(chatId);
    return () => setActiveChat(null);
  }, [chatId, setActiveChat, clearUnread]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesByChat[chatId]]);

  const messages = messagesByChat[chatId] || [];
  const typing = typingUsers[chatId]?.filter((uid) => uid !== user?.id) || [];

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  let lastDate = "";

  return (
    <div className="flex flex-col h-[calc(100dvh-64px)] lg:h-[calc(100dvh-73px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface">
        <button onClick={() => navigate(ROUTES.CHATS)} className="lg:hidden p-1 rounded-lg hover:bg-surface-tertiary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-text-primary">{chat?.name || "Chat"}</h2>
          {!isConnected && <p className="text-xs text-warning">Reconnecting...</p>}
        </div>
        <button className="p-1 rounded-lg hover:bg-surface-tertiary">
          <Users className="h-5 w-5 text-text-secondary" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-tertiary text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const msgDate = formatMessageDate(msg.created_at);
              const showDate = msgDate !== lastDate;
              lastDate = msgDate;

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="flex justify-center my-3">
                      <span className="text-xs text-text-tertiary bg-surface-tertiary px-3 py-1 rounded-full">{msgDate}</span>
                    </div>
                  )}
                  <MessageBubble message={msg} isOwn={msg.sender_id === user?.id} />
                </div>
              );
            })}
            {typing.length > 0 && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} onTyping={sendTyping} />
    </div>
  );
}
