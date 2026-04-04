import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Spinner } from "@/components/ui/Spinner";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { ROUTES } from "@/lib/constants";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EditTripPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: trip, isLoading } = useQuery({
    queryKey: queryKeys.trips.detail(id!),
    queryFn: () => tripService.getById(id!).then((r) => r.data),
    enabled: !!id,
  });

  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors, isSubmitting } } = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
  });

  useEffect(() => {
    if (trip) {
      reset({
        destination_country_id: trip.destination_country_id,
        destination_city_id: trip.destination_city_id,
        start_date: trip.start_date,
        end_date: trip.end_date,
        min_budget: trip.min_budget,
        max_budget: trip.max_budget,
        people_needed: trip.people_needed,
        min_age: trip.min_age,
        max_age: trip.max_age,
        gender_preference: trip.gender_preference || "any",
        description: trip.description || "",
      });
    }
  }, [trip, reset]);

  const destCountryId = watch("destination_country_id");
  const description = watch("description") || "";

  const { data: countries } = useQuery({ queryKey: queryKeys.options.countries, queryFn: () => optionsService.getCountries().then((r) => r.data) });
  const { data: destCities } = useQuery({ queryKey: queryKeys.options.cities(destCountryId), queryFn: () => optionsService.getCities(destCountryId).then((r) => r.data), enabled: !!destCountryId });

  const updateMutation = useMutation({
    mutationFn: (data: TripFormData) => tripService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.detail(id!) });
      queryClient.invalidateQueries({ queryKey: queryKeys.trips.all });
      toast.success("Trip updated!");
      navigate(ROUTES.TRIP_DETAIL(id!));
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <PageContainer><div className="flex justify-center py-12"><Spinner size="lg" /></div></PageContainer>;

  if (trip?.status === "deleted_by_host") {
    return (
      <PageContainer>
        <EmptyState
          title="Trip was removed"
          description="This trip is no longer editable."
          action={<Button onClick={() => navigate(ROUTES.TRIP_DETAIL(id!))}>View trip</Button>}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card className="max-w-2xl mx-auto">
        <h2 className="text-xl font-heading font-bold text-text-primary mb-6">Edit Trip</h2>
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller name="destination_country_id" control={control} render={({ field }) => (
              <Select id="dest_country" label="Country" placeholder="Select" options={(countries || []).map((c) => ({ value: c.id, label: c.name }))} error={errors.destination_country_id?.message} value={field.value || ""} onChange={(e) => { const v = e.target.value ? Number(e.target.value) : undefined; field.onChange(v); setValue("destination_city_id", undefined as unknown as number); }} />
            )} />
            <Controller name="destination_city_id" control={control} render={({ field }) => (
              <Select id="dest_city" label="City" placeholder="Select" options={(destCities || []).map((c) => ({ value: c.id, label: c.name }))} error={errors.destination_city_id?.message} disabled={!destCountryId} value={field.value || ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)} />
            )} />
          </div>
          <Controller name="start_date" control={control} render={() => (
            <DateRangePicker
              label="Trip Dates"
              startDate={watch("start_date")}
              endDate={watch("end_date")}
              onRangeChange={(start, end) => { setValue("start_date", start, { shouldValidate: true }); setValue("end_date", end, { shouldValidate: true }); }}
              error={errors.start_date?.message || errors.end_date?.message}
            />
          )} />
          <RangeSlider
            label="Budget Range"
            min={0}
            max={10000000}
            step={100}
            valueLow={watch("min_budget") || 0}
            valueHigh={watch("max_budget") || 10000000}
            onChange={(low, high) => { setValue("min_budget", low); setValue("max_budget", high); }}
            formatValue={(v) => `${v.toLocaleString()} ₸`}
            inputSuffix="KZT"
            error={errors.max_budget?.message}
          />
          <Input id="people_needed" label="People Needed" type="number" min={1} error={errors.people_needed?.message} {...register("people_needed", { valueAsNumber: true })} />
          <RangeSlider
            label="Age Range"
            min={16}
            max={100}
            step={1}
            valueLow={watch("min_age") || 16}
            valueHigh={watch("max_age") || 100}
            onChange={(low, high) => { setValue("min_age", low); setValue("max_age", high); }}
            formatValue={(v) => `${v} yrs`}
            inputSuffix="yrs"
          />
          <Select id="gender_preference" label="Gender Preference" options={[{ value: "any", label: "Any" }, { value: "male", label: "Male" }, { value: "female", label: "Female" }]} {...register("gender_preference")} />
          <Textarea id="description" label="Description" rows={4} showCount maxLength={2000} currentLength={description.length} error={errors.description?.message} {...register("description")} />
          <div className="flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" fullWidth isLoading={isSubmitting || updateMutation.isPending}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
