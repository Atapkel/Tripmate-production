import { clsx } from "clsx";
import { formatMessageTime } from "@/lib/formatters";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={clsx("flex mb-2", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOwn
            ? "bg-primary-600 text-white rounded-br-md"
            : "bg-surface-tertiary text-text-primary rounded-bl-md"
        )}
      >
        {!isOwn && message.sender_name && (
          <p className="text-xs font-semibold text-primary-600 mb-0.5">{message.sender_name}</p>
        )}
        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={clsx(
            "text-xs mt-1",
            isOwn ? "text-primary-200" : "text-text-tertiary"
          )}
        >
          {formatMessageTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}
