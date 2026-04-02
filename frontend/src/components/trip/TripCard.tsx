import { useNavigate } from "react-router-dom";
import { MapPin, Calendar, Banknote, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDateRange, formatBudgetRange, formatAgeRange } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";
import type { Trip } from "@/types/trip";

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const navigate = useNavigate();

  const statusVariant = {
    open: "success" as const,
    matched: "info" as const,
    closed: "default" as const,
    cancelled: "error" as const,
  };

  return (
    <Card hoverable onClick={() => navigate(ROUTES.TRIP_DETAIL(trip.id))}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-heading font-bold text-text-primary">
          {trip.destination_city?.name || "Unknown"}, {trip.destination_country?.name || ""}
        </h3>
        <Badge variant={statusVariant[trip.status as keyof typeof statusVariant] || "default"}>
          {trip.status}
        </Badge>
      </div>

      <div className="space-y-2 text-sm text-text-secondary mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary-400" />
          <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-accent-500" />
          <span>{formatBudgetRange(trip.min_budget, trip.max_budget)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-blue-400" />
          <span>{formatAgeRange(trip.min_age, trip.max_age)} · {trip.gender_preference || "Any gender"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin className="h-4 w-4 text-primary-400" />
          <span className="font-medium">{trip.people_joined}/{trip.people_needed}</span> joined
        </div>
        {trip.description && (
          <span className="text-xs text-primary-600 font-medium">View details</span>
        )}
      </div>
    </Card>
  );
}
