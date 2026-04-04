import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Send, Inbox } from "lucide-react";
import { offerService } from "@/services/offerService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { PageContainer } from "@/components/layout/PageContainer";
import { OfferCard } from "@/components/offer/OfferCard";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES } from "@/lib/constants";
import { countPendingOffers, countUnseenRejectedSentOffers } from "@/lib/offersCounts";

export default function MyOffersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("sent");

  const { data: sentOffers, isLoading: sentLoading } = useQuery({
    queryKey: queryKeys.offers.mine,
    queryFn: () => offerService.getMine().then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: receivedOffers, isLoading: receivedLoading } = useQuery({
    queryKey: queryKeys.offers.received,
    queryFn: () => offerService.getReceived().then((r) => r.data),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const tabs = useMemo(() => {
    const sentPending = countPendingOffers(sentOffers);
    const unseenRejected = countUnseenRejectedSentOffers(sentOffers);
    const sentAttention = sentPending + unseenRejected;
    const receivedPending = countPendingOffers(receivedOffers);
    return [
      { key: "sent", label: "Sent", count: sentAttention > 0 ? sentAttention : undefined },
      { key: "received", label: "Received", count: receivedPending > 0 ? receivedPending : undefined },
    ];
  }, [sentOffers, receivedOffers]);

  const ackRejectedMutation = useMutation({
    mutationFn: () => offerService.acknowledgeRejectedSent(),
    onSuccess: (res) => {
      queryClient.setQueryData(queryKeys.offers.attention, res.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.mine });
    },
  });

  useEffect(() => {
    if (activeTab !== "sent" || !sentOffers?.length) return;
    if (countUnseenRejectedSentOffers(sentOffers) < 1) return;
    if (ackRejectedMutation.isPending) return;
    ackRejectedMutation.mutate();
  }, [activeTab, sentOffers, ackRejectedMutation.isPending]);

  const cancelMutation = useMutation({
    mutationFn: (id: number) => offerService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.received });
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.attention });
      queryClient.invalidateQueries({ queryKey: ["offers", "trip"] });
      toast.success("Offer cancelled.");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const isLoading = activeTab === "sent" ? sentLoading : receivedLoading;
  const offers = activeTab === "sent" ? sentOffers : receivedOffers;

  return (
    <PageContainer>
      <div className="mb-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
      </div>

      {isLoading ? (
        <div className="space-y-4 max-w-2xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : !offers || offers.length === 0 ? (
        <EmptyState
          icon={activeTab === "sent" ? <Send className="h-12 w-12" /> : <Inbox className="h-12 w-12" />}
          title={activeTab === "sent" ? "No sent offers" : "No received offers"}
          description={activeTab === "sent" ? "Browse trips and send offers to join!" : "Create trips to receive offers from travelers."}
          action={
            activeTab === "sent"
              ? <Button onClick={() => navigate(ROUTES.TRIPS)}>Browse Trips</Button>
              : <Button onClick={() => navigate(ROUTES.CREATE_TRIP)}>Create Trip</Button>
          }
        />
      ) : (
        <div className="space-y-4 max-w-2xl mx-auto">
          {offers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              actions={
                activeTab === "sent" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.TRIP_DETAIL(offer.trip_vacancy_id))}>
                      View Trip
                    </Button>
                    {offer.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => cancelMutation.mutate(offer.id)} isLoading={cancelMutation.isPending}>
                        Cancel Offer
                      </Button>
                    )}
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.TRIP_OFFERS(offer.trip_vacancy_id))}>
                    Review
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
