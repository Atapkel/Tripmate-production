import { useQuery } from "@tanstack/react-query";
import { optionsService } from "@/services/optionsService";
import { queryKeys } from "@/lib/queryKeys";
import { useFilterStore } from "@/stores/filterStore";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RangeSlider } from "@/components/ui/RangeSlider";

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

      <div className="space-y-3">
        <Input id="start_from" label="From date" type="date" value={filters.start_date_from || ""} onChange={(e) => setFilters({ start_date_from: e.target.value || undefined })} />
        <Input id="start_to" label="To date" type="date" value={filters.start_date_to || ""} onChange={(e) => setFilters({ start_date_to: e.target.value || undefined })} />
      </div>

      <RangeSlider
        label="Budget Range"
        min={0}
        max={10000000}
        step={100}
        valueLow={filters.min_budget ?? 0}
        valueHigh={filters.max_budget ?? 10000000}
        onChange={(low, high) => setFilters({ min_budget: low > 0 ? low : undefined, max_budget: high < 10000000 ? high : undefined })}
        formatValue={(v) => `${v.toLocaleString()} KZT`}
      />

      <RangeSlider
        label="Age Range"
        min={16}
        max={100}
        step={1}
        valueLow={filters.min_age ?? 16}
        valueHigh={filters.max_age ?? 100}
        onChange={(low, high) => setFilters({ min_age: low > 16 ? low : undefined, max_age: high < 100 ? high : undefined })}
        formatValue={(v) => `${v} yrs`}
      />

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
