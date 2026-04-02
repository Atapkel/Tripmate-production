import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Inbox } from "lucide-react";
import { offerService } from "@/services/offerService";
import { profileService } from "@/services/profileService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { PageContainer } from "@/components/layout/PageContainer";
import { OfferCard } from "@/components/offer/OfferCard";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ROUTES } from "@/lib/constants";
import { getInitials } from "@/lib/formatters";
import { useState } from "react";

export default function TripOffersPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<{ id: number; action: "accepted" | "rejected" } | null>(null);

  const { data: offers, isLoading } = useQuery({
    queryKey: queryKeys.offers.forTrip(id!),
    queryFn: () => offerService.getForTrip(id!).then((r) => r.data),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ offerId, status }: { offerId: number; status: "accepted" | "rejected" }) =>
      offerService.updateStatus(offerId, { status }),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.offers.forTrip(id!) });
      toast.success(status === "accepted" ? "Offer accepted! Chat created." : "Offer rejected.");
      setConfirmAction(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageContainer><div className="flex justify-center py-12"><Spinner size="lg" /></div></PageContainer>;

  if (!offers || offers.length === 0) {
    return (
      <PageContainer>
        <EmptyState icon={<Inbox className="h-12 w-12" />} title="No offers yet" description="When someone sends an offer to join your trip, it will appear here." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4 max-w-2xl mx-auto">
        {offers.map((offer) => (
          <OfferCardWithProfile
            key={offer.id}
            offer={offer}
            onAccept={() => setConfirmAction({ id: offer.id, action: "accepted" })}
            onReject={() => setConfirmAction({ id: offer.id, action: "rejected" })}
            navigate={navigate}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => confirmAction && statusMutation.mutate({ offerId: confirmAction.id, status: confirmAction.action })}
        title={confirmAction?.action === "accepted" ? "Accept Offer" : "Reject Offer"}
        message={confirmAction?.action === "accepted" ? "Accept this offer? A chat will be created." : "Reject this offer?"}
        confirmLabel={confirmAction?.action === "accepted" ? "Accept" : "Reject"}
        confirmVariant={confirmAction?.action === "rejected" ? "danger" : "primary"}
        isLoading={statusMutation.isPending}
      />
    </PageContainer>
  );
}

function OfferCardWithProfile({ offer, onAccept, onReject, navigate }: {
  offer: import("@/types/offer").Offer;
  onAccept: () => void;
  onReject: () => void;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { data: profile } = useQuery({
    queryKey: queryKeys.profiles.detail(offer.offerer_id),
    queryFn: () => profileService.getById(offer.offerer_id).then((r) => r.data),
  });

  return (
    <OfferCard
      offer={offer}
      actions={
        offer.status === "pending" ? (
          <>
            <Button variant="outline" size="sm" onClick={() => profile && navigate(ROUTES.PROFILE_VIEW(profile.user_id))}>View Profile</Button>
            <Button size="sm" onClick={onAccept}>Accept</Button>
            <Button variant="danger" size="sm" onClick={onReject}>Reject</Button>
          </>
        ) : undefined
      }
    >
      {profile && (
        <div className="flex items-center gap-3 mb-2">
          <Avatar
            src={profile.profile_photo ? (profile.profile_photo.startsWith("http") ? profile.profile_photo : `/${profile.profile_photo}`) : null}
            initials={getInitials(profile.first_name, profile.last_name)}
            size="md"
          />
          <div>
            <p className="text-sm font-semibold text-text-primary">{profile.first_name} {profile.last_name}</p>
            <p className="text-xs text-text-secondary">{profile.city?.name}{profile.country ? `, ${profile.country.name}` : ""}</p>
          </div>
        </div>
      )}
    </OfferCard>
  );
}
