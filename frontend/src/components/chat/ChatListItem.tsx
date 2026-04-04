import { clsx } from "clsx";
import { Avatar } from "@/components/ui/Avatar";
import { TripStatusBadge } from "@/components/trip/TripStatusBadge";
import { formatRelativeTime } from "@/lib/formatters";
import type { ChatGroup } from "@/types/chat";

interface ChatListItemProps {
  chat: ChatGroup;
  isActive?: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export function ChatListItem({ chat, isActive, onClick, unreadCount }: ChatListItemProps) {
  const unread = unreadCount ?? chat.unread_count ?? 0;
  const removalUnseen = !!chat.trip_removal_unseen;
  const badgeCount = Math.max(unread, removalUnseen ? 1 : 0);

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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{chat.name}</p>
            {chat.trip_status === "deleted_by_host" && (
              <TripStatusBadge
                status="deleted_by_host"
                className="shrink-0 text-[10px] px-2 py-0 font-semibold"
              />
            )}
          </div>
          <span className="text-xs text-text-tertiary shrink-0">
            {formatRelativeTime(chat.updated_at)}
          </span>
        </div>
      </div>
      {badgeCount > 0 && (
        <span className="shrink-0 bg-primary-600 text-white text-xs rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
          {badgeCount > 99 ? "99+" : badgeCount}
        </span>
      )}
    </button>
  );
}
