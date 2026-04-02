import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-primary-50 via-surface-secondary to-accent-50">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary-100 text-primary-400 mb-6">
        <MapPin className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Looks like you're lost</h1>
      <p className="text-text-secondary mb-8 max-w-md">
        This page doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Button onClick={() => navigate(ROUTES.TRIPS)}>Go to Home</Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </div>
  );
}
