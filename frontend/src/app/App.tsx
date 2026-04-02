import { RouterProvider } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { MapPin } from "lucide-react";
import { router } from "./router";
import { Providers } from "./providers";

function AppContent() {
  const { isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-surface-secondary">
        <div className="flex flex-col items-center gap-4">
          <MapPin className="w-12 h-12 text-primary-600 animate-pulse" />
          <p className="text-text-secondary font-body">Loading TripMate...</p>
        </div>
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <Providers>
      <AppContent />
    </Providers>
  );
}
