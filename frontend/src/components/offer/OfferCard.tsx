import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime, formatDateRange } from "@/lib/formatters";
import type { Offer } from "@/types/offer";

const statusVariant: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  accepted: "success",
  rejected: "error",
  cancelled: "default",
};

interface OfferCardProps {
  offer: Offer;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function OfferCard({ offer, actions, children }: OfferCardProps) {
  const trip = offer.trip_vacancy;

  return (
    <Card>
      {trip && (
        <div className="mb-2 pb-2 border-b border-border">
          <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <MapPin className="h-3.5 w-3.5 text-primary-500" />
            {trip.destination_city?.name}, {trip.destination_country?.name}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-tertiary mt-0.5">
            <Calendar className="h-3 w-3" />
            {formatDateRange(trip.start_date, trip.end_date)}
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-text-secondary">{formatRelativeTime(offer.created_at)}</span>
        <Badge variant={statusVariant[offer.status] || "default"}>{offer.status}</Badge>
      </div>
      {children}
      {offer.message && (
        <p className="text-sm text-text-secondary mt-2 line-clamp-3">{offer.message}</p>
      )}
      {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
    </Card>
  );
}
