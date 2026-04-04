import type { Offer } from "@/types/offer";

export function countPendingOffers(offers: Offer[] | undefined): number {
  if (!offers?.length) return 0;
  return offers.filter((o) => o.status === "pending").length;
}
