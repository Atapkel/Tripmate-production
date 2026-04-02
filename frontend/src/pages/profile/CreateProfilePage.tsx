import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { profileSchema, type ProfileFormData } from "@/lib/validators";
import { profileService } from "@/services/profileService";
import { optionsService } from "@/services/optionsService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const countryId = watch("country_id");
  const bio = watch("bio") || "";

  const { data: countries } = useQuery({
    queryKey: queryKeys.options.countries,
    queryFn: () => optionsService.getCountries().then((r) => r.data),
  });

  const { data: cities, isLoading: citiesLoading } = useQuery({
    queryKey: queryKeys.options.cities(countryId),
    queryFn: () => optionsService.getCities(countryId).then((r) => r.data),
    enabled: !!countryId,
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await profileService.create(data);
      if (photoFile) {
        await profileService.uploadPhoto(photoFile);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me });
      toast.success("Profile created!");
      navigate(ROUTES.ONBOARDING_PREFERENCES);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <Card>
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Create Your Profile</h2>
        <p className="text-sm text-text-secondary mb-6">Step 1 of 2 — Tell us about yourself</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-surface-tertiary flex items-center justify-center border-2 border-dashed border-border hover:border-primary-500 transition-colors overflow-hidden">
                {photoFile ? (
                  <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-tertiary text-xs text-center">Add Photo</span>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input id="first_name" label="First Name" error={errors.first_name?.message} {...register("first_name")} />
            <Input id="last_name" label="Last Name" error={errors.last_name?.message} {...register("last_name")} />
          </div>

          <Input id="date_of_birth" label="Date of Birth" type="date" error={errors.date_of_birth?.message} {...register("date_of_birth")} />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-text-primary">Gender</label>
            <div className="flex gap-4">
              {["male", "female"].map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value={g} {...register("gender")} className="text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm capitalize">{g}</span>
                </label>
              ))}
            </div>
            {errors.gender && <p className="text-sm text-error">{errors.gender.message}</p>}
          </div>

          <Input id="nationality" label="Nationality" placeholder="e.g. Kazakh" error={errors.nationality?.message} {...register("nationality")} />

          <Textarea
            id="bio"
            label="Bio"
            placeholder="Tell others about yourself..."
            showCount
            maxLength={500}
            currentLength={bio.length}
            error={errors.bio?.message}
            rows={3}
            {...register("bio")}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input id="instagram_handle" label="Instagram" placeholder="@username" error={errors.instagram_handle?.message} {...register("instagram_handle")} />
            <Input id="telegram_handle" label="Telegram" placeholder="@username" error={errors.telegram_handle?.message} {...register("telegram_handle")} />
          </div>

          <Controller
            name="country_id"
            control={control}
            render={({ field }) => (
              <Select
                id="country_id"
                label="Country"
                placeholder="Select country"
                options={(countries || []).map((c) => ({ value: c.id, label: c.name }))}
                error={errors.country_id?.message}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />

          <Controller
            name="city_id"
            control={control}
            render={({ field }) => (
              <Select
                id="city_id"
                label="City"
                placeholder={citiesLoading ? "Loading cities..." : "Select city"}
                options={(cities || []).map((c) => ({ value: c.id, label: c.name }))}
                error={errors.city_id?.message}
                disabled={!countryId}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            )}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">
            Continue
          </Button>
        </form>
      </Card>
    </div>
  );
}
