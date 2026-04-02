import { clsx } from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/formatters";
import type { ChatGroup } from "@/types/chat";

interface ChatListItemProps {
  chat: ChatGroup;
  isActive?: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function ChatListItem({ chat, isActive, onClick, unreadCount }: ChatListItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
        isActive ? "bg-primary-50" : "hover:bg-surface-tertiary"
      )}
    >
      <Avatar initials={chat.name.charAt(0)} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-text-primary truncate">{chat.name}</p>
          <span className="text-xs text-text-tertiary">{formatRelativeTime(chat.updated_at)}</span>
        </div>
      </div>
      {!!unreadCount && unreadCount > 0 && (
        <span className="shrink-0 bg-primary-600 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
          {unreadCount}
        </span>
      )}
    </button>
  );
}
