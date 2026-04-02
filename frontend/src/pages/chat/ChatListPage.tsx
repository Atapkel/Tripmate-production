import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { chatService } from "@/services/chatService";
import { useChatStore } from "@/stores/chatStore";
import { queryKeys } from "@/lib/queryKeys";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { PageContainer } from "@/components/layout/PageContainer";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { ChatListItemSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ROUTES } from "@/lib/constants";

export default function ChatListPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isDesktop = useIsDesktop();
  const { unreadCounts } = useChatStore();

  const { data: chats, isLoading } = useQuery({
    queryKey: queryKeys.chats.mine,
    queryFn: () => chatService.getMine().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => <ChatListItemSkeleton key={i} />)}
        </div>
      </PageContainer>
    );
  }

  if (!chats || chats.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon={<MessageCircle className="h-12 w-12" />}
          title="No chats yet"
          description="Accept an offer or get your offer accepted to start chatting!"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className={isDesktop ? "max-w-md" : ""}>
        <div className="space-y-1">
          {chats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              isActive={id ? Number(id) === chat.id : false}
              onClick={() => navigate(ROUTES.CHAT_ROOM(chat.id))}
              unreadCount={unreadCounts[chat.id] || 0}
            />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
