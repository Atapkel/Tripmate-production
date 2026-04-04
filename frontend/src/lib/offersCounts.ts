import type { Offer } from "@/types/offer";

export function countPendingOffers(offers: Offer[] | undefined): number {
  if (!offers?.length) return 0;
  return offers.filter((o) => o.status === "pending").length;
}

/** Rejected offers you sent that the server has not marked as seen yet. */
export function countUnseenRejectedSentOffers(offers: Offer[] | undefined): number {
  if (!offers?.length) return 0;
  return offers.filter(
    (o) => o.status === "rejected" && (o.offerer_rejection_seen_at == null || o.offerer_rejection_seen_at === "")
  ).length;
}
