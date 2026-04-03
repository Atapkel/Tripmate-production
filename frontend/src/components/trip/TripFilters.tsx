import { useQuery } from "@tanstack/react-query";
import { optionsService } from "@/services/optionsService";
import { queryKeys } from "@/lib/queryKeys";
import { useFilterStore } from "@/stores/filterStore";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { DateRangePicker } from "@/components/ui/DateRangePicker";

export function TripFilters({ onApply }: { onApply?: () => void }) {
  const { filters, setFilters, resetFilters } = useFilterStore();

  const { data: countries } = useQuery({
    queryKey: queryKeys.options.countries,
    queryFn: () => optionsService.getCountries().then((r) => r.data),
  });

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-heading font-bold text-text-primary">Filters</h3>

      <Select
        id="dest_country"
        label="Destination"
        placeholder="Any country"
        options={(countries || []).map((c) => ({ value: c.name, label: c.name }))}
        value={filters.destination_country || ""}
        onChange={(e) => setFilters({ destination_country: e.target.value || undefined })}
      />

      <DateRangePicker
        label="Trip Start Date"
        startDate={filters.start_date_from}
        endDate={filters.start_date_to}
        onRangeChange={(start, end) =>
          setFilters({ start_date_from: start, start_date_to: end })
        }
      />

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Budget Range (KZT)</label>
        <div className="grid grid-cols-2 gap-3">
          <Input id="min_budget" placeholder="Min" type="number" min={0} value={filters.min_budget ?? ""} onChange={(e) => setFilters({ min_budget: e.target.value ? Number(e.target.value) : undefined })} />
          <Input id="max_budget" placeholder="Max" type="number" min={0} value={filters.max_budget ?? ""} onChange={(e) => setFilters({ max_budget: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-primary mb-1.5">Age Range</label>
        <div className="grid grid-cols-2 gap-3">
          <Input id="min_age" placeholder="Min" type="number" min={16} max={100} value={filters.min_age ?? ""} onChange={(e) => setFilters({ min_age: e.target.value ? Number(e.target.value) : undefined })} />
          <Input id="max_age" placeholder="Max" type="number" min={16} max={100} value={filters.max_age ?? ""} onChange={(e) => setFilters({ max_age: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
      </div>

      <Select
        id="gender_pref"
        label="Gender preference"
        placeholder="Any"
        options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "any", label: "Any" }]}
        value={filters.gender_preference || ""}
        onChange={(e) => setFilters({ gender_preference: e.target.value || undefined })}
      />

      <div className="flex gap-2 pt-2">
        <Button fullWidth onClick={() => onApply?.()}>Apply</Button>
        <Button fullWidth variant="outline" onClick={() => { resetFilters(); onApply?.(); }}>Reset</Button>
      </div>
    </div>
  );
}
