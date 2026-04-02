import { lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Spinner } from "@/components/ui/Spinner";

const ServerErrorPage = lazy(() => import("@/pages/ServerErrorPage"));

export function BackendGuard({ children }: { children: React.ReactNode }) {
  const { isLoading, isError } = useQuery({
    queryKey: ["backend-health"],
    queryFn: () => axios.get("/health"),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center min-h-dvh"><Spinner size="lg" /></div>}>
        <ServerErrorPage />
      </Suspense>
    );
  }

  return <>{children}</>;
}
