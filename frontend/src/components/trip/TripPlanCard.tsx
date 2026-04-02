import { useState } from "react";
import { MapPin, Clock, Tag, Sparkles, Users, Sun } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import type { RecommendedPlace } from "@/types/chat";

const DEFAULT_PLACE_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop&q=80";

export function TripPlanCard({ place }: { place: RecommendedPlace }) {
  const [imgError, setImgError] = useState(false);
  const [open, setOpen] = useState(false);
  const imageSrc = place.image_url && !imgError ? place.image_url : DEFAULT_PLACE_IMAGE;

  return (
    <>
      {/* Compact card */}
      <button
        onClick={() => setOpen(true)}
        className="flex-shrink-0 w-36 text-left group"
      >
        <div className="relative w-36 h-24 rounded-xl overflow-hidden mb-1.5">
          <img
            src={imageSrc}
            alt={place.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            onError={() => setImgError(true)}
          />
          {(!place.image_url || imgError) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white/60" />
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-text-primary truncate">
          {place.name}
        </p>
        {place.category && (
          <p className="text-[10px] text-text-tertiary truncate">{place.category}</p>
        )}
      </button>

      {/* Detail modal */}
      <Modal isOpen={open} onClose={() => setOpen(false)} size="md">
        <div className="-m-4">
          <div className="relative">
            <img
              src={imageSrc}
              alt={place.name}
              className="w-full h-56 object-cover"
              onError={() => setImgError(true)}
            />
            {(!place.image_url || imgError) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-10 w-10 text-white/60" />
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <h3 className="text-lg font-heading font-bold text-text-primary">
              {place.name}
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {place.category && (
                <Badge variant="info">
                  <Tag className="h-3 w-3 mr-1" />
                  {place.category}
                </Badge>
              )}
              {place.best_time_of_day && (
                <Badge>
                  <Clock className="h-3 w-3 mr-1" />
                  {place.best_time_of_day}
                </Badge>
              )}
              {place.best_season && place.best_season.length > 0 && (
                <Badge>
                  <Sun className="h-3 w-3 mr-1" />
                  {place.best_season.join(", ")}
                </Badge>
              )}
              {place.audience && place.audience.length > 0 && (
                <Badge>
                  <Users className="h-3 w-3 mr-1" />
                  {place.audience.join(", ")}
                </Badge>
              )}
            </div>

            {place.short_description && (
              <p className="text-sm text-text-secondary">{place.short_description}</p>
            )}

            {place.why_people_go && (
              <div>
                <p className="text-xs font-semibold text-text-tertiary mb-1">Why people go</p>
                <p className="text-sm text-text-secondary">{place.why_people_go}</p>
              </div>
            )}

            {place.why_recommended && (
              <div className="bg-primary-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary-600" />
                  <p className="text-xs font-semibold text-primary-700">Why we recommend this</p>
                </div>
                <p className="text-sm text-primary-700">{place.why_recommended}</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
