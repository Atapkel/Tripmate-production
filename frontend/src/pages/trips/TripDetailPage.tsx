import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Calendar, Banknote, Users, MapPin, Clock, Edit, Trash2, Eye, Sparkles, CheckCircle, ExternalLink } from "lucide-react";
import { tripService } from "@/services/tripService";
import { profileService } from "@/services/profileService";
import { authService } from "@/services/authService";
import { offerService } from "@/services/offerService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { formatDateRange, formatBudgetRange, formatAgeRange, calculateDuration, formatDate, getInitials } from "@/lib/formatters";
import { PageContainer } from "@/components/layout/PageContainer";
import { TripStatusBadge } from "@/components/trip/TripStatusBadge";
import { SendOfferModal } from "@/components/offer/SendOfferModal";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/lib/constants";

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authService.getMe().then((r) => r.data),
  });

  const { data: trip, isLoading, isError } = useQuery({
    queryKey: queryKeys.trips.detail(id!),
    queryFn: () => tripService.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { data: creatorProfile } = useQuery({
    queryKey: queryKeys.profiles.detail(trip?.requester_id || 0),
    queryFn: () => profileService.getById(trip!.requester_id).then((r) => r.data),
    enabled: !!trip?.requester_id,
  });

  const { data: myOffers } = useQuery({
    queryKey: queryKeys.offers.mine,
    queryFn: () => offerService.getMine().then((r) => r.data),
    enabled: !!currentUser && !!trip,
  });

  const hasActiveOffer = myOffers?.some(
    (o) => o.trip_vacancy_id === trip?.id && (o.status === "pending" || o.status === "accepted"),
  );

  const isOwner = currentUser?.id === trip?.requester_id;

  const isMember =
    isOwner ||
    myOffers?.some(
      (o) => o.trip_vacancy_id === trip?.id && o.status === "accepted",
    );

  const { data: plan } = useQuery({
    queryKey: queryKeys.trips.plan(id!),
    queryFn: () => tripService.getPlan(id!).then((r) => r.data),
    enabled: !!id && !!isMember,
    retry: false,
  });

  const generateMutation = useMutation({
    mutationFn: () => tripService.generatePlan(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.plan(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.myPlans });
      toast.success("Recommendations generated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => tripService.delete(id!),
    onSuccess: () => {
      toast.success("Trip deleted.");
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      navigate(ROUTES.MY_TRIPS);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageContainer><div className="flex justify-center py-12"><Spinner size="lg" /></div></PageContainer>;
  if (isError || !trip) return <PageContainer><EmptyState title="Trip not found" description="This trip doesn't exist or has been removed." action={<Button onClick={() => navigate(ROUTES.TRIPS)}>Back to Trips</Button>} /></PageContainer>;

  const duration = calculateDuration(trip.start_date, trip.end_date);

  return (
    <PageContainer>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-text-primary">
                {trip.destination_city?.name}, {trip.destination_country?.name}
              </h2>
              <TripStatusBadge status={trip.status} />
            </div>
            {trip.destination_photo_url && (
              <div className="mb-4 rounded-xl overflow-hidden border border-border">
                <img
                  src={trip.destination_photo_url}
                  alt={trip.destination_city?.name ? `Photo: ${trip.destination_city.name}` : "Destination"}
                  className="w-full max-h-56 object-cover"
                  loading="lazy"
                />
              </div>
            )}
            {(trip.destination_description || trip.destination_wiki_url) && (
              <div className="mb-4 space-y-2">
                {trip.destination_description && (
                  <p className="text-sm text-text-secondary leading-relaxed">{trip.destination_description}</p>
                )}
                {trip.destination_wiki_url && (
                  <a
                    href={trip.destination_wiki_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline"
                  >
                    Read more on Wikipedia
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary"><Calendar className="h-4 w-4 text-text-tertiary" />{formatDateRange(trip.start_date, trip.end_date)} ({duration} days)</div>
              <div className="flex items-center gap-2 text-text-secondary"><Banknote className="h-4 w-4 text-text-tertiary" />{formatBudgetRange(trip.min_budget, trip.max_budget)}</div>
              <div className="flex items-center gap-2 text-text-secondary"><Users className="h-4 w-4 text-text-tertiary" />{formatAgeRange(trip.min_age, trip.max_age)} · {trip.gender_preference || "Any gender"}</div>
              <div className="flex items-center gap-2 text-text-secondary"><MapPin className="h-4 w-4 text-text-tertiary" />{trip.people_joined}/{trip.people_needed} joined</div>
              <div className="flex items-center gap-2 text-text-secondary"><Clock className="h-4 w-4 text-text-tertiary" />Created {formatDate(trip.created_at)}</div>
            </div>
            {trip.description && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-sm font-semibold text-text-primary mb-2">Description</h3>
                <p className="text-sm text-text-secondary whitespace-pre-line">{trip.description}</p>
              </div>
            )}
          </Card>

          <Card>
            {isOwner ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate(ROUTES.TRIP_EDIT(trip.id))}><Edit className="h-4 w-4 mr-1" /> Edit</Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.TRIP_OFFERS(trip.id))}><Eye className="h-4 w-4 mr-1" /> View Offers</Button>
                <Button variant="outline" onClick={() => navigate(ROUTES.TRIP_PLAN(trip.id))}><Sparkles className="h-4 w-4 mr-1" /> Trip Plan</Button>
                <Button variant="danger" onClick={() => setShowDeleteDialog(true)}><Trash2 className="h-4 w-4 mr-1" /> Delete</Button>
              </div>
            ) : isMember ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => navigate(ROUTES.TRIP_PLAN(trip.id))}><Sparkles className="h-4 w-4 mr-1" /> Trip Plan</Button>
              </div>
            ) : trip.status === "open" ? (
              hasActiveOffer ? (
                <div className="flex items-center gap-2 text-sm text-primary-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>You already sent an offer for this trip</span>
                </div>
              ) : (
                <Button onClick={() => setShowOfferModal(true)}>Send Offer</Button>
              )
            ) : (
              <p className="text-sm text-text-secondary">This trip is no longer accepting offers.</p>
            )}
          </Card>

          {/* Recommendations section */}
          {isMember && plan?.recommended_places && plan.recommended_places.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary-500" />
                  Recommendations
                </h3>
                <Button variant="outline" size="sm" onClick={() => navigate(ROUTES.TRIP_PLAN(trip.id))}>
                  View All
                </Button>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-thin">
                {plan.recommended_places.map((place) => (
                  <div key={place.id} className="flex-shrink-0 w-52 snap-start">
                    <div className="rounded-xl border border-border overflow-hidden">
                      <img
                        src={place.image_url || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop&q=80"}
                        alt={place.name}
                        className="w-full h-28 object-cover"
                        loading="lazy"
                      />
                      <div className="p-2.5">
                        <p className="text-sm font-semibold text-text-primary truncate">{place.name}</p>
                        <div className="flex gap-1 mt-1">
                          {place.category && <Badge variant="info" className="text-[10px]">{place.category}</Badge>}
                        </div>
                        {place.short_description && (
                          <p className="text-xs text-text-secondary mt-1 line-clamp-2">{place.short_description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {isMember && !plan && trip.people_joined >= trip.people_needed && (
            <Card>
              <div className="flex flex-col items-center py-4 text-center">
                <Sparkles className="h-6 w-6 text-text-tertiary mb-2" />
                <p className="text-sm text-text-secondary mb-3">No recommendations generated yet</p>
                <Button size="sm" onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                  {generateMutation.isPending ? <Spinner size="sm" /> : <Sparkles className="h-4 w-4 mr-1" />}
                  Generate Recommendations
                </Button>
              </div>
            </Card>
          )}
        </div>

        {creatorProfile && (
          <div>
            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-3">Trip Creator</h3>
              <div className="flex items-center gap-3 mb-3">
                <Avatar
                  src={creatorProfile.profile_photo ? (creatorProfile.profile_photo.startsWith("http") ? creatorProfile.profile_photo : `/${creatorProfile.profile_photo}`) : null}
                  initials={getInitials(creatorProfile.first_name, creatorProfile.last_name)}
                  size="lg"
                />
                <div>
                  <p className="font-semibold text-text-primary">{creatorProfile.first_name} {creatorProfile.last_name}</p>
                  <p className="text-sm text-text-secondary">{creatorProfile.city?.name}{creatorProfile.country ? `, ${creatorProfile.country.name}` : ""}</p>
                </div>
              </div>
              {creatorProfile.languages && creatorProfile.languages.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {creatorProfile.languages.map((l) => <Chip key={l.id} label={l.language?.name || ""} variant="blue" className="text-xs" />)}
                </div>
              )}
              {creatorProfile.interests && creatorProfile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {creatorProfile.interests.map((i) => <Chip key={i.id} label={i.interest?.name || ""} variant="teal" className="text-xs" />)}
                </div>
              )}
              <Button variant="outline" size="sm" fullWidth onClick={() => navigate(ROUTES.PROFILE_VIEW(creatorProfile.user_id))}>View Full Profile</Button>
            </Card>
          </div>
        )}
      </div>

      {showOfferModal && <SendOfferModal tripId={trip.id} onClose={() => setShowOfferModal(false)} />}
      <ConfirmDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={() => deleteMutation.mutate()} title="Delete Trip" message="Are you sure? This cannot be undone." confirmLabel="Delete" confirmVariant="danger" isLoading={deleteMutation.isPending} />
    </PageContainer>
  );
}
