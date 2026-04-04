import { clsx } from "clsx";
import { formatMessageTime } from "@/lib/formatters";
import { Avatar } from "@/components/ui/Avatar";
import type { ChatMessage } from "@/types/chat";

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
}

function resolvePhoto(photo?: string | null): string | null {
  if (!photo) return null;
  return photo.startsWith("http") ? photo : `/${photo}`;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const isSystem = message.sender_id == null;

  if (isSystem) {
    return (
      <div className="flex justify-center mb-3 px-2">
        <div className="max-w-[95%] rounded-xl border border-border bg-surface-tertiary/80 px-4 py-2.5 text-center">
          <p className="text-xs font-semibold text-primary-600 mb-1">{message.sender_name || "TripMate"}</p>
          <p className="text-sm text-text-primary whitespace-pre-wrap break-words">{message.content}</p>
          <p className="text-xs text-text-tertiary mt-1">{formatMessageTime(message.created_at)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("flex mb-2 items-end gap-2", isOwn ? "justify-end" : "justify-start")}>
      {!isOwn && showAvatar && (
        <Avatar
          src={resolvePhoto(message.sender_photo)}
          initials={message.sender_name?.charAt(0)?.toUpperCase()}
          size="sm"
        />
      )}
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
