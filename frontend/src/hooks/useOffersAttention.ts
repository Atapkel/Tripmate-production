import { useQuery } from "@tanstack/react-query";
import { offerService } from "@/services/offerService";
import { queryKeys } from "@/lib/queryKeys";

/** Pending offers to review as host + unseen rejections on offers you sent (nav badge). */
export function useOffersAttention() {
  return useQuery({
    queryKey: queryKeys.offers.attention,
    queryFn: () => offerService.getAttention().then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
