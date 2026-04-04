import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { tripSchema, type TripFormData } from "@/lib/validators";
import { tripService } from "@/services/tripService";
import { optionsService } from "@/services/optionsService";
import { queryKeys } from "@/lib/queryKeys";
import { getErrorMessage } from "@/lib/errorHandler";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { ROUTES } from "@/lib/constants";

export default function CreateTripPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: { people_needed: 1, gender_preference: "any", min_budget: 0, max_budget: 1000000, min_age: 16, max_age: 100 },
  });

  const destCountryId = watch("destination_country_id");
  const description = watch("description") || "";

  const { data: countries } = useQuery({
    queryKey: queryKeys.options.countries,
    queryFn: () => optionsService.getCountries().then((r) => r.data),
  });

  const { data: destCities } = useQuery({
    queryKey: queryKeys.options.cities(destCountryId),
    queryFn: () => optionsService.getCities(destCountryId).then((r) => r.data),
    enabled: !!destCountryId,
  });

  const createMutation = useMutation({
    mutationFn: (data: TripFormData) => tripService.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.mine });
      toast.success("Trip created!");
      navigate(ROUTES.TRIP_DETAIL(res.data.id));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <PageContainer>
      <Card className="max-w-2xl mx-auto">
        <h2 className="text-xl font-heading font-bold text-text-primary mb-6">Create a Trip</h2>
        <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
          <h3 className="text-sm font-semibold text-text-primary pt-2">Destination</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller name="destination_country_id" control={control} render={({ field }) => (
              <Select id="dest_country" label="Country" placeholder="Select country" options={(countries || []).map((c) => ({ value: c.id, label: c.name }))} error={errors.destination_country_id?.message} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
            )} />
            <Controller name="destination_city_id" control={control} render={({ field }) => (
              <Select id="dest_city" label="City" placeholder="Select city" options={(destCities || []).map((c) => ({ value: c.id, label: c.name }))} error={errors.destination_city_id?.message} disabled={!destCountryId} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
            )} />
          </div>

          <h3 className="text-sm font-semibold text-text-primary pt-2">Dates</h3>
          <Controller name="start_date" control={control} render={() => (
            <DateRangePicker
              label="Trip Dates"
              startDate={watch("start_date")}
              endDate={watch("end_date")}
              onRangeChange={(start, end) => { setValue("start_date", start, { shouldValidate: true }); setValue("end_date", end, { shouldValidate: true }); }}
              error={errors.start_date?.message || errors.end_date?.message}
            />
          )} />

          <h3 className="text-sm font-semibold text-text-primary pt-2">Budget (KZT)</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input id="min_budget" label="Min Budget" type="number" min={0} error={errors.min_budget?.message} {...register("min_budget", { valueAsNumber: true })} />
            <Input id="max_budget" label="Max Budget" type="number" min={0} error={errors.max_budget?.message} {...register("max_budget", { valueAsNumber: true })} />
          </div>

          <h3 className="text-sm font-semibold text-text-primary pt-2">Companion Preferences</h3>
          <Input id="people_needed" label="People Needed" type="number" min={1} max={20} error={errors.people_needed?.message} {...register("people_needed", { valueAsNumber: true })} />
          <div className="grid grid-cols-2 gap-3">
            <Input id="min_age" label="Min Age" type="number" min={16} max={100} error={errors.min_age?.message} {...register("min_age", { valueAsNumber: true })} />
            <Input id="max_age" label="Max Age" type="number" min={16} max={100} error={errors.max_age?.message} {...register("max_age", { valueAsNumber: true })} />
          </div>
          <Select id="gender_preference" label="Gender Preference" options={[{ value: "any", label: "Any" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }]} {...register("gender_preference")} />

          <Textarea id="description" label="Description" placeholder="Describe your trip plans, vibe, and what you're looking for..." rows={4} showCount maxLength={2000} currentLength={description.length} error={errors.description?.message} {...register("description")} />

          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting || createMutation.isPending}>Create Trip</Button>
        </form>
      </Card>
    </PageContainer>
  );
}
