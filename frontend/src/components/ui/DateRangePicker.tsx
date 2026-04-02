import { useState, useRef, useEffect } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import { clsx } from "clsx";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onRangeChange: (start: string, end: string) => void;
  error?: string;
  label?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  error,
  label,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [localRange, setLocalRange] = useState<DateRange | undefined>(undefined);
  const ref = useRef<HTMLDivElement>(null);

  // Sync from props when calendar is closed
  const selected: DateRange | undefined = open
    ? localRange
    : startDate || endDate
      ? {
          from: startDate ? new Date(startDate + "T00:00:00") : undefined,
          to: endDate ? new Date(endDate + "T00:00:00") : undefined,
        }
      : undefined;

  const handleOpen = () => {
    if (!open) {
      // Initialize local range from props when opening
      setLocalRange(
        startDate || endDate
          ? {
              from: startDate ? new Date(startDate + "T00:00:00") : undefined,
              to: endDate ? new Date(endDate + "T00:00:00") : undefined,
            }
          : undefined
      );
    }
    setOpen(!open);
  };

  const handleSelect = (range: DateRange | undefined) => {
    setLocalRange(range);
    // Only commit to form and close when both dates are selected
    if (range?.from && range?.to) {
      onRangeChange(format(range.from, "yyyy-MM-dd"), format(range.to, "yyyy-MM-dd"));
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue =
    startDate && endDate
      ? `${format(new Date(startDate + "T00:00:00"), "MMM d, yyyy")} — ${format(new Date(endDate + "T00:00:00"), "MMM d, yyyy")}`
      : startDate
        ? `${format(new Date(startDate + "T00:00:00"), "MMM d, yyyy")} — ...`
        : "Select dates";

  return (
    <div ref={ref} className="relative space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={handleOpen}
        className={clsx(
          "w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-left transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          error ? "border-error" : "border-border",
          startDate ? "text-text-primary" : "text-text-tertiary"
        )}
      >
        {displayValue}
      </button>
      {error && <p className="text-sm text-error">{error}</p>}
      {open && (
        <div className="absolute z-50 mt-1 rounded-xl border border-border bg-surface shadow-elevated p-3">
          <DayPicker
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            classNames={{
              today: "font-bold text-primary-600",
              selected: "bg-primary-500 text-white",
              range_start: "bg-primary-500 text-white rounded-l-full",
              range_end: "bg-primary-500 text-white rounded-r-full",
              range_middle: "bg-primary-100 text-primary-800",
              chevron: "fill-primary-500",
            }}
          />
        </div>
      )}
    </div>
  );
}
