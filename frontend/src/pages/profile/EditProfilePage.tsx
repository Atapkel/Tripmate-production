import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { profileSchema, type ProfileFormData } from "@/lib/validators";
import { profileService } from "@/services/profileService";
import { optionsService } from "@/services/optionsService";
import { useAuthStore } from "@/stores/authStore";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Chip } from "@/components/ui/Chip";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTES } from "@/lib/constants";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<number[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [selectedTravelStyles, setSelectedTravelStyles] = useState<number[]>([]);

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.profiles.me,
    queryFn: () => profileService.getMe().then((r) => r.data),
  });

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const countryId = watch("country_id");
  const bio = watch("bio") || "";

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        nationality: profile.nationality || "",
        bio: profile.bio || "",
        country_id: profile.country_id,
        city_id: profile.city_id,
        instagram_handle: profile.instagram_handle || "",
        telegram_handle: profile.telegram_handle || "",
      });
      setSelectedLanguages(profile.languages?.map((l) => l.language_id) || []);
      setSelectedInterests(profile.interests?.map((i) => i.interest_id) || []);
      setSelectedTravelStyles(profile.travel_styles?.map((ts) => ts.travel_style_id) || []);
    }
  }, [profile, reset]);

  const { data: nationalities } = useQuery({
    queryKey: queryKeys.options.nationalities,
    queryFn: () => optionsService.getNationalities().then((r) => r.data),
  });

  const { data: countries } = useQuery({
    queryKey: queryKeys.options.countries,
    queryFn: () => optionsService.getCountries().then((r) => r.data),
  });

  const { data: cities } = useQuery({
    queryKey: queryKeys.options.cities(countryId),
    queryFn: () => optionsService.getCities(countryId).then((r) => r.data),
    enabled: !!countryId,
  });

  const { data: languages } = useQuery({ queryKey: queryKeys.options.languages, queryFn: () => optionsService.getLanguages().then((r) => r.data) });
  const { data: interests } = useQuery({ queryKey: queryKeys.options.interests, queryFn: () => optionsService.getInterests().then((r) => r.data) });
  const { data: travelStyles } = useQuery({ queryKey: queryKeys.options.travelStyles, queryFn: () => optionsService.getTravelStyles().then((r) => r.data) });

  const toggle = (arr: number[], setArr: React.Dispatch<React.SetStateAction<number[]>>, id: number) => {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await profileService.update({
        ...data,
        language_ids: selectedLanguages,
        interest_ids: selectedInterests,
        travel_style_ids: selectedTravelStyles,
      });
      if (photoFile) await profileService.uploadPhoto(photoFile);
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.me });
      toast.success("Profile updated!");
      navigate(ROUTES.PROFILE);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await profileService.delete();
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
      toast.success("Account deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <PageContainer><div className="flex justify-center py-12"><Spinner size="lg" /></div></PageContainer>;

  return (
    <PageContainer>
      <Card className="max-w-2xl mx-auto">
        <h2 className="text-xl font-heading font-bold text-text-primary mb-6">Edit Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-surface-tertiary flex items-center justify-center border-2 border-dashed border-border overflow-hidden">
                {photoFile ? (
                  <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : profile?.profile_photo ? (
                  <img src={profile.profile_photo.startsWith("http") ? profile.profile_photo : `/${profile.profile_photo}`} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-text-tertiary text-xs">Change Photo</span>
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
                  <input type="radio" value={g} {...register("gender")} className="text-primary-600" />
                  <span className="text-sm capitalize">{g}</span>
                </label>
              ))}
            </div>
          </div>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <Select
                id="nationality"
                label="Nationality"
                placeholder="Select nationality"
                options={(nationalities || []).map((n) => ({ value: n.name, label: n.name }))}
                error={errors.nationality?.message}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value || "")}
              />
            )}
          />
          <Textarea id="bio" label="Bio" showCount maxLength={500} currentLength={bio.length} rows={3} error={errors.bio?.message} {...register("bio")} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="instagram_handle" label="Instagram" placeholder="@username" error={errors.instagram_handle?.message} {...register("instagram_handle")} />
            <Input id="telegram_handle" label="Telegram" placeholder="@username" error={errors.telegram_handle?.message} {...register("telegram_handle")} />
          </div>
          <Controller name="country_id" control={control} render={({ field }) => (
            <Select id="country_id" label="Country" placeholder="Select country" options={(countries || []).map((c) => ({ value: c.id, label: c.name }))} error={errors.country_id?.message} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
          )} />
          <Controller name="city_id" control={control} render={({ field }) => (
            <Select id="city_id" label="City" placeholder="Select city" options={(cities || []).map((c) => ({ value: c.id, label: c.name }))} error={errors.city_id?.message} disabled={!countryId} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
          )} />

          <div className="pt-4 border-t border-border space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {(languages || []).map((l) => (<Chip key={l.id} label={l.name} selected={selectedLanguages.includes(l.id)} onClick={() => toggle(selectedLanguages, setSelectedLanguages, l.id)} />))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(interests || []).map((i) => (<Chip key={i.id} label={i.name} selected={selectedInterests.includes(i.id)} onClick={() => toggle(selectedInterests, setSelectedInterests, i.id)} />))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">Travel Style</h3>
              <div className="flex flex-wrap gap-2">
                {(travelStyles || []).map((ts) => (<Chip key={ts.id} label={ts.name} selected={selectedTravelStyles.includes(ts.id)} onClick={() => toggle(selectedTravelStyles, setSelectedTravelStyles, ts.id)} />))}
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth isLoading={isSubmitting} size="lg">Save Changes</Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <Button variant="danger" fullWidth onClick={() => setShowDeleteDialog(true)}>Delete Account</Button>
        </div>
      </Card>

      <ConfirmDialog isOpen={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} onConfirm={handleDelete} title="Delete Account" message="This action is permanent and cannot be undone." confirmLabel="Delete Account" confirmVariant="danger" isLoading={isDeleting} />
    </PageContainer>
  );
}
