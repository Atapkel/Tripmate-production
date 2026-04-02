import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { tripService } from "@/services/tripService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { PageContainer } from "@/components/layout/PageContainer";
import { TripPlanCard } from "@/components/trip/TripPlanCard";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function TripPlanPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: plan, isLoading, isError } = useQuery({
    queryKey: queryKeys.trips.plan(id!),
    queryFn: () => tripService.getPlan(id!).then((r) => r.data),
    enabled: !!id,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => tripService.generatePlan(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.plan(id!) });
      toast.success("Trip plan generated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-border rounded-2xl p-4 space-y-3">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </PageContainer>
    );
  }

  if (generateMutation.isPending) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-16">
          <Spinner size="lg" />
          <p className="mt-4 text-text-secondary">Generating your personalized trip plan...</p>
          <p className="text-sm text-text-tertiary mt-1">This may take 10-15 seconds</p>
        </div>
      </PageContainer>
    );
  }

  if (isError || !plan || !plan.recommended_places?.length) {
    return (
      <PageContainer>
        <EmptyState
          icon={<Sparkles className="h-12 w-12" />}
          title="No plan yet"
          description="AI will analyze your trip and members' profiles to recommend places."
          action={<Button onClick={() => generateMutation.mutate()}>Generate AI Plan</Button>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-text-primary">Trip Plan</h2>
        <Button variant="outline" size="sm" onClick={() => generateMutation.mutate()}>Regenerate</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plan.recommended_places.map((place) => <TripPlanCard key={place.id} place={place} />)}
      </div>
    </PageContainer>
  );
}
