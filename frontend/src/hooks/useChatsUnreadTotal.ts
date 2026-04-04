import { useQuery } from "@tanstack/react-query";
import { chatService } from "@/services/chatService";
import { queryKeys } from "@/lib/queryKeys";

export function useChatsUnreadTotal() {
  return useQuery({
    queryKey: queryKeys.chats.mine,
    queryFn: () => chatService.getMine().then((r) => r.data),
    select: (chats) => chats.reduce((sum, c) => sum + (c.unread_count ?? 0), 0),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
  });
}
