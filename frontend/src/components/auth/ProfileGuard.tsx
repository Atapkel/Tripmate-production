import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { profileService } from "@/services/profileService";
import { queryKeys } from "@/lib/queryKeys";
import { ROUTES } from "@/lib/constants";
import { Spinner } from "@/components/ui/Spinner";

const ServerErrorPage = lazy(() => import("@/pages/ServerErrorPage"));

function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response;
  }
  return false;
}

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.profiles.me,
    queryFn: () => profileService.getMe().then((res) => res.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError && isNetworkError(error)) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-dvh"><Spinner size="lg" /></div>}>
        <ServerErrorPage />
      </Suspense>
    );
  }

  if (isError || !profile) {
    return <Navigate to={ROUTES.ONBOARDING_PROFILE} replace />;
  }

  const hasLanguages = profile.languages && profile.languages.length > 0;
  const hasInterests = profile.interests && profile.interests.length > 0;
  const hasTravelStyles = profile.travel_styles && profile.travel_styles.length > 0;

  if (!hasLanguages || !hasInterests || !hasTravelStyles) {
    return <Navigate to={ROUTES.ONBOARDING_PREFERENCES} replace />;
  }

  return <>{children}</>;
}
