import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { UserX } from "lucide-react";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/stores/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { ROUTES } from "@/lib/constants";
import { getInitials } from "@/lib/formatters";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar } from "@/components/ui/Avatar";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProfileSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ViewProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isOwnProfile = !id || (user && id === String(user.id));

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: isOwnProfile ? queryKeys.profiles.me : queryKeys.profiles.detail(id!),
    queryFn: () =>
      isOwnProfile
        ? profileService.getMe().then((r) => r.data)
        : profileService.getById(id!).then((r) => r.data),
  });

  if (isLoading) return <PageContainer><ProfileSkeleton /></PageContainer>;

  if (isError || !profile) {
    return (
      <PageContainer>
        <EmptyState icon={<UserX className="h-12 w-12" />} title="User not found" description="This profile doesn't exist or has been removed." />
      </PageContainer>
    );
  }

  const photoUrl = profile.profile_photo
    ? profile.profile_photo.startsWith("http") ? profile.profile_photo : `/${profile.profile_photo}`
    : null;

  return (
    <PageContainer>
      <Card className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <Avatar src={photoUrl} initials={getInitials(profile.first_name, profile.last_name)} size="xl" className="mb-3" />
          <h2 className="text-xl font-heading font-bold text-text-primary">
            {profile.first_name} {profile.last_name}
          </h2>
          <p className="text-sm text-text-secondary">
            {profile.gender && <span className="capitalize">{profile.gender}</span>}
            {profile.nationality && ` · ${profile.nationality}`}
            {profile.city && ` · ${profile.city.name}`}
            {profile.country && `, ${profile.country.name}`}
          </p>
        </div>

        {profile.bio && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">About</h3>
            <p className="text-sm text-text-secondary whitespace-pre-line">{profile.bio}</p>
          </div>
        )}

        {(profile.instagram_handle || profile.telegram_handle) && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Socials</h3>
            <div className="flex flex-col gap-1">
              {profile.instagram_handle && (
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Instagram:</span>{" "}
                  <a href={`https://instagram.com/${profile.instagram_handle.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.instagram_handle.startsWith("@") ? profile.instagram_handle : `@${profile.instagram_handle}`}
                  </a>
                </p>
              )}
              {profile.telegram_handle && (
                <p className="text-sm text-text-secondary">
                  <span className="font-medium text-text-primary">Telegram:</span>{" "}
                  <a href={`https://t.me/${profile.telegram_handle.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {profile.telegram_handle.startsWith("@") ? profile.telegram_handle : `@${profile.telegram_handle}`}
                  </a>
                </p>
              )}
            </div>
          </div>
        )}

        {profile.languages && profile.languages.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Languages</h3>
            <div className="flex flex-wrap gap-2">
              {profile.languages.map((l) => (
                <Chip key={l.id} label={l.language?.name || `Language ${l.language_id}`} variant="blue" />
              ))}
            </div>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <Chip key={i.id} label={i.interest?.name || `Interest ${i.interest_id}`} variant="teal" />
              ))}
            </div>
          </div>
        )}

        {profile.travel_styles && profile.travel_styles.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Travel Style</h3>
            <div className="flex flex-wrap gap-2">
              {profile.travel_styles.map((ts) => (
                <Chip key={ts.id} label={ts.travel_style?.name || `Style ${ts.travel_style_id}`} variant="orange" />
              ))}
            </div>
          </div>
        )}

        {isOwnProfile && (
          <Button fullWidth variant="outline" onClick={() => navigate(ROUTES.PROFILE_EDIT)}>
            Edit Profile
          </Button>
        )}
      </Card>
    </PageContainer>
  );
}
