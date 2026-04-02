import { Outlet } from "react-router-dom";
import { MapPin } from "lucide-react";

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary-50 via-surface-secondary to-accent-50 flex flex-col">
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-600 text-white shadow-glow">
            <MapPin className="h-6 w-6" />
          </div>
          <span className="text-2xl font-heading font-bold text-text-primary">TripMate</span>
        </div>
      </div>
      <div className="flex-1 flex items-start justify-center px-4 pb-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
