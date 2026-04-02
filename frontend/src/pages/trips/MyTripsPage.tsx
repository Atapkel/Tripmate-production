import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, Map, Inbox } from "lucide-react";
import { tripService } from "@/services/tripService";
import { offerService } from "@/services/offerService";
import { queryKeys } from "@/lib/queryKeys";
import { PageContainer } from "@/components/layout/PageContainer";
import { TripCard } from "@/components/trip/TripCard";
import { OfferCard } from "@/components/offer/OfferCard";
import { TripCardSkeleton } from "@/components/ui/Skeleton";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

const tabs = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const { data: trips, isLoading } = useQuery({
    queryKey: queryKeys.trips.mine,
    queryFn: () => tripService.getMine().then((r) => r.data),
  });

  const { data: receivedOffers, isLoading: offersLoading } = useQuery({
    queryKey: queryKeys.offers.received,
    queryFn: () => offerService.getReceived().then((r) => r.data),
  });

  const filteredTrips = trips?.filter((t) => activeTab === "all" ? true : t.status === activeTab);
  const pendingOffers = receivedOffers?.filter((o) => o.status === "pending") || [];

  return (
    <PageContainer>
      {/* Received Offers Section */}
      {!offersLoading && pendingOffers.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Inbox className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-heading font-bold text-text-primary">
              Pending Offers ({pendingOffers.length})
            </h2>
          </div>
          <div className="space-y-3 max-w-2xl">
            {pendingOffers.slice(0, 5).map((offer) => (
              <OfferCard key={offer.id} offer={offer}
                actions={
                  <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.TRIP_OFFERS(offer.trip_vacancy_id))}>
                    Review
                  </Button>
                }
              />
            ))}
            {pendingOffers.length > 5 && (
              <p className="text-sm text-text-secondary text-center">
                +{pendingOffers.length - 5} more offers
              </p>
            )}
          </div>
        </div>
      )}

      {/* Trips Section */}
      <div className="flex items-center justify-between mb-4">
        <Tabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <Button size="sm" onClick={() => navigate(ROUTES.CREATE_TRIP)} className="ml-4 shrink-0">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <TripCardSkeleton key={i} />)}
        </div>
      ) : !filteredTrips || filteredTrips.length === 0 ? (
        <EmptyState
          icon={<Map className="h-12 w-12" />}
          title={activeTab === "all" ? "No trips yet" : `No ${activeTab} trips`}
          description={activeTab === "all" ? "Create your first trip!" : undefined}
          action={activeTab === "all" ? <Button onClick={() => navigate(ROUTES.CREATE_TRIP)}>Create Trip</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
        </div>
      )}
    </PageContainer>
  );
}
