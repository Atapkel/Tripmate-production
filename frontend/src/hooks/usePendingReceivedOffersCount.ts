import { useQuery } from "@tanstack/react-query";
import { offerService } from "@/services/offerService";
import { queryKeys } from "@/lib/queryKeys";
import { countPendingOffers } from "@/lib/offersCounts";

/** Subscribes to received offers; returns pending count for nav badges (shared React Query cache). */
export function usePendingReceivedOffersCount() {
  return useQuery({
    queryKey: queryKeys.offers.received,
    queryFn: () => offerService.getReceived().then((r) => r.data),
    select: (data) => countPendingOffers(data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}
