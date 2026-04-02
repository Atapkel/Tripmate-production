import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { optionsService } from "@/services/optionsService";
import { profileService } from "@/services/profileService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/lib/constants";

export default function SetPreferencesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: languages, isLoading: l1 } = useQuery({
    queryKey: queryKeys.options.languages,
    queryFn: () => optionsService.getLanguages().then((r) => r.data),
  });
  const { data: interests, isLoading: l2 } = useQuery({
    queryKey: queryKeys.options.interests,
    queryFn: () => optionsService.getInterests().then((r) => r.data),
  });
  const { data: travelStyles, isLoading: l3 } = useQuery({
    queryKey: queryKeys.options.travelStyles,
    queryFn: () => optionsService.getTravelStyles().then((r) => r.data),
  });

  const toggle = (arr: number[], setArr: React.Dispatch<React.SetStateAction<number[]>>, id: number) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const handleSubmit = async () => {
    if (!selectedLanguages.length || !selectedInterests.length || !selectedTravelStyles.length) {
      toast.error("Please select at least one option in each category.");
      return;
    }
    setIsSubmitting(true);
    try {
      await Promise.all([
        profileService.setLanguages(selectedLanguages),
        profileService.setInterests(selectedInterests),
        profileService.setTravelStyles(selectedTravelStyles),
      ]);
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me });
      toast.success("Preferences saved! Welcome to TripMate!");
      navigate(ROUTES.TRIPS, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (l1 || l2 || l3) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <Card>
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Set Your Preferences</h2>
        <p className="text-sm text-text-secondary mb-6">Step 2 of 2 — Help us find the best matches</p>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Languages you speak</h3>
            <div className="flex flex-wrap gap-2">
              {(languages || []).map((lang) => (
                <Chip key={lang.id} label={lang.name} selected={selectedLanguages.includes(lang.id)} onClick={() => toggle(selectedLanguages, setSelectedLanguages, lang.id)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Your interests</h3>
            <div className="flex flex-wrap gap-2">
              {(interests || []).map((interest) => (
                <Chip key={interest.id} label={interest.name} selected={selectedInterests.includes(interest.id)} onClick={() => toggle(selectedInterests, setSelectedInterests, interest.id)} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-3">Travel style</h3>
            <div className="flex flex-wrap gap-2">
              {(travelStyles || []).map((style) => (
                <Chip key={style.id} label={style.name} selected={selectedTravelStyles.includes(style.id)} onClick={() => toggle(selectedTravelStyles, setSelectedTravelStyles, style.id)} />
              ))}
            </div>
          </div>

          <Button fullWidth size="lg" isLoading={isSubmitting} onClick={handleSubmit}>
            Finish Setup
          </Button>
        </div>
      </Card>
    </div>
  );
}
