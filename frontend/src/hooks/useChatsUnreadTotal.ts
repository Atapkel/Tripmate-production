import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chatService";
import { queryKeys } from "@/lib/queryKeys";

export function useChatsUnreadTotal() {
  return useQuery({
    queryKey: queryKeys.chats.mine,
    queryFn: () => chatService.getMine().then((r) => r.data),
    select: (chats) => {
      const activeUnread = chats
        .filter((c) => c.trip_status !== "deleted_by_host")
        .reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
      const unseenRemovals = chats.filter((c) => c.trip_removal_unseen).length;
      return activeUnread + unseenRemovals;
    },
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}
