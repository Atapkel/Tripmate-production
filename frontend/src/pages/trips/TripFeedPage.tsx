import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, SlidersHorizontal, Compass } from "lucide-react";
import { tripService } from "@/services/tripService";
import { useFilterStore } from "@/stores/filterStore";
import { queryKeys } from "@/lib/queryKeys";
import { PageContainer } from "@/components/layout/PageContainer";
import { TripCard } from "@/components/trip/TripCard";
import { TripFilters } from "@/components/trip/TripFilters";
import { TripCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ROUTES } from "@/lib/constants";

export default function TripFeedPage() {
  const navigate = useNavigate();
  const { filters } = useFilterStore();
  const [showFilters, setShowFilters] = useState(false);

  const { data: trips, isLoading } = useQuery({
    queryKey: queryKeys.trips.list(filters),
    queryFn: () => tripService.getAll(filters).then((r) => r.data),
  });

  return (
    <PageContainer wide>
      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 bg-surface border border-border rounded-2xl p-4">
            <TripFilters />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal className="h-4 w-4 mr-1" /> Filters
            </Button>
            <Button size="sm" onClick={() => navigate(ROUTES.CREATE_TRIP)}>
              <Plus className="h-4 w-4 mr-1" /> New Trip
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <TripCardSkeleton key={i} />)}
            </div>
          ) : !trips || trips.length === 0 ? (
            <EmptyState
              icon={<Compass className="h-12 w-12" />}
              title="No trips found"
              description="Try adjusting your filters or create the first trip!"
              action={<Button onClick={() => navigate(ROUTES.CREATE_TRIP)}>Create Trip</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => navigate(ROUTES.CREATE_TRIP)}
        className="hidden lg:flex fixed bottom-8 right-8 h-14 w-14 bg-primary-600 text-white rounded-full items-center justify-center shadow-elevated hover:bg-primary-700 hover:shadow-glow transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Drawer isOpen={showFilters} onClose={() => setShowFilters(false)} title="Filters">
        <TripFilters onApply={() => setShowFilters(false)} />
      </Drawer>
    </PageContainer>
  );
}
