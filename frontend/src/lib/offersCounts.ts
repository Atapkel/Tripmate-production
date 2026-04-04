import type { Offer } from "@/types/offer";

export function countPendingOffers(offers: Offer[] | undefined): number {
  if (!offers?.length) return 0;
  return offers.filter((o) => o.status === "pending").length;
}

/** Accepted or rejected offers you sent that the host decided on but you have not opened Sent yet. */
export function countUnseenOutcomeSentOffers(offers: Offer[] | undefined): number {
  if (!offers?.length) return 0;
  return offers.filter(
    (o) =>
      (o.status === "accepted" || o.status === "rejected") &&
      (o.offerer_outcome_seen_at == null || o.offerer_outcome_seen_at === "")
  ).length;
}
