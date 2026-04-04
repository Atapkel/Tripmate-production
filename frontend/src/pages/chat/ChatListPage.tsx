import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { chatService } from "@/services/chatService";
import { queryKeys } from "@/lib/queryKeys";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { PageContainer } from "@/components/layout/PageContainer";
import { ChatListItem } from "@/components/chat/ChatListItem";
import { ChatListItemSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ROUTES } from "@/lib/constants";

function isArchivedChat(tripStatus: string | null | undefined) {
  return tripStatus === "deleted_by_host";
}

const CHATS_TAB_QUERY = "tab";
const CHATS_TAB_ARCHIVE = "archive";

export default function ChatListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const isDesktop = useIsDesktop();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab: "active" | "archive" =
    searchParams.get(CHATS_TAB_QUERY) === CHATS_TAB_ARCHIVE ? "archive" : "active";

  const setActiveTab = (tab: "active" | "archive") => {
    if (tab === "archive") {
      setSearchParams({ [CHATS_TAB_QUERY]: CHATS_TAB_ARCHIVE }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const { data: chats, isLoading } = useQuery({
    queryKey: queryKeys.chats.mine,
    queryFn: () => chatService.getMine().then((r) => r.data),
  });

  const ackRemovalsMutation = useMutation({
    mutationFn: () => chatService.acknowledgeTripRemovals(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.chats.mine });
    },
  });

  const hasUnseenRemoval = !!chats?.some((c) => c.trip_removal_unseen);

  useEffect(() => {
    if (activeTab !== "archive" || !hasUnseenRemoval) return;
    if (ackRemovalsMutation.isPending) return;
    ackRemovalsMutation.mutate();
  }, [activeTab, hasUnseenRemoval, ackRemovalsMutation.isPending]);

  const tabDefs = useMemo(() => {
    const unseenClosedCount =
      chats?.filter((c) => c.trip_removal_unseen).length ?? 0;
    return [
      { key: "active", label: "Active" },
      {
        key: "archive",
        label: "Archive",
        count: unseenClosedCount > 0 ? unseenClosedCount : undefined,
      },
    ];
  }, [chats]);

  const filteredChats = useMemo(() => {
    if (!chats?.length) return [];
    if (activeTab === "archive") return chats.filter((c) => isArchivedChat(c.trip_status));
    return chats.filter((c) => !isArchivedChat(c.trip_status));
  }, [chats, activeTab]);

  const onlyArchivedChats =
    !!chats?.length && chats.every((c) => isArchivedChat(c.trip_status));

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <ChatListItemSkeleton key={i} />
          ))}
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
        <div className="mb-4">
          <Tabs
            tabs={tabDefs}
            active={activeTab}
            onChange={(key) => setActiveTab(key as "active" | "archive")}
          />
        </div>
        {filteredChats.length === 0 ? (
          <EmptyState
            icon={<MessageCircle className="h-12 w-12" />}
            title={activeTab === "active" ? "No active chats" : "No archived chats"}
            description={
              activeTab === "active" && onlyArchivedChats
                ? "The organizer removed these trips. Open Archive to read past messages."
                : activeTab === "active"
                  ? "When a trip is removed by the host, its chat moves to Archive."
                  : "Chats for trips removed by the organizer appear here. You can still read the history."
            }
            action={
              activeTab === "active" && onlyArchivedChats ? (
                <Button variant="outline" onClick={() => setActiveTab("archive")}>
                  Open archive
                </Button>
              ) : activeTab === "active" && chats.some((c) => isArchivedChat(c.trip_status)) ? (
                <Button variant="outline" onClick={() => setActiveTab("archive")}>
                  View archive
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-1">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isActive={id ? Number(id) === chat.id : false}
                onClick={() => navigate(ROUTES.CHAT_ROOM(chat.id))}
                unreadCount={chat.unread_count ?? 0}
              />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
