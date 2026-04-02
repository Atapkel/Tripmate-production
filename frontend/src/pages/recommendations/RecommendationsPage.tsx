import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Sparkles, MapPin, Calendar } from "lucide-react";
import { tripService } from "@/services/tripService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { formatDateRange } from "@/lib/formatters";
import { PageContainer } from "@/components/layout/PageContainer";
import { TripPlanCard } from "@/components/trip/TripPlanCard";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/lib/constants";
import type { Trip } from "@/types/trip";
import type { TripPlan } from "@/types/chat";

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: myTrips, isLoading: tripsLoading } = useQuery({
    queryKey: queryKeys.trips.mine,
    queryFn: () => tripService.getMine().then((r) => r.data),
  });

  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: queryKeys.trips.myPlans,
    queryFn: () => tripService.getMyPlans().then((r) => r.data),
  });

  const isLoading = tripsLoading || plansLoading;

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-6 w-1/3" />
              <div className="flex gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex-shrink-0 w-36 space-y-1.5">
                    <Skeleton className="h-24 w-36 rounded-xl" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (!myTrips || myTrips.length === 0) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="No trips yet"
          description="Create a trip to get AI-powered recommendations."
          action={<Button onClick={() => navigate(ROUTES.CREATE_TRIP)}>Create Trip</Button>}
        />
      </PageContainer>
    );
  }

  const plansByTrip = new Map<number, TripPlan>();
  plans?.forEach((plan) => plansByTrip.set(plan.trip_vacancy_id, plan));

  return (
    <PageContainer>
      <div className="space-y-6">
        {myTrips.map((trip) => (
          <TripRecommendationSection
            key={trip.id}
            trip={trip}
            plan={plansByTrip.get(trip.id)}
            queryClient={queryClient}
          />
        ))}
      </div>
    </PageContainer>
  );
}

function TripRecommendationSection({
  trip,
  plan,
  queryClient,
}: {
  trip: Trip;
  plan?: TripPlan;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const navigate = useNavigate();

  const generateMutation = useMutation({
    mutationFn: () => tripService.generatePlan(trip.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.myPlans });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.plan(trip.id) });
      toast.success("Recommendations generated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(ROUTES.TRIP_DETAIL(trip.id))}
            className="flex flex-col gap-1 text-left hover:opacity-80 transition-opacity"
          >
            <div className="flex items-center gap-2 text-base font-heading font-bold text-text-primary">
              <MapPin className="h-4 w-4 text-primary-500" />
              {trip.destination_city?.name}, {trip.destination_country?.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <Calendar className="h-3 w-3" />
              {formatDateRange(trip.start_date, trip.end_date)}
            </div>
          </button>
          {plan && plan.recommended_places?.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.TRIP_PLAN(trip.id))}
            >
              View Full Plan
            </Button>
          )}
        </div>
      </Card>

      {generateMutation.isPending ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Spinner size="lg" />
          <p className="mt-3 text-sm text-text-secondary">Generating recommendations...</p>
        </div>
      ) : plan && plan.recommended_places?.length > 0 ? (
        <>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {plan.recommended_places.map((place) => (
              <TripPlanCard key={place.id} place={place} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center py-6 text-center">
          <Sparkles className="h-8 w-8 text-text-tertiary mb-2" />
          <p className="text-sm text-text-secondary mb-3">
            {trip.people_joined < trip.people_needed
              ? `Waiting for members (${trip.people_joined}/${trip.people_needed} joined)`
              : "No recommendations generated yet"}
          </p>
          <Button
            size="sm"
            onClick={() => generateMutation.mutate()}
            disabled={trip.people_joined < trip.people_needed}
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Generate Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}
