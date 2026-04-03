import { useState, useRef, useEffect } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
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

  const hasStart = !!startDate;
  const hasEnd = !!endDate;

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
          "flex items-center gap-3",
          error ? "border-error" : "border-border"
        )}
      >
        <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={clsx(
            "truncate",
            hasStart ? "text-text-primary" : "text-text-tertiary"
          )}>
            {hasStart
              ? format(new Date(startDate + "T00:00:00"), "MMM d, yyyy")
              : "Start date"}
          </span>
          <span className="text-text-tertiary">→</span>
          <span className={clsx(
            "truncate",
            hasEnd ? "text-text-primary" : "text-text-tertiary"
          )}>
            {hasEnd
              ? format(new Date(endDate + "T00:00:00"), "MMM d, yyyy")
              : "End date"}
          </span>
        </div>
      </button>

      {error && <p className="text-sm text-error">{error}</p>}

      {open && (
        <div className="absolute z-50 mt-1 rounded-xl border border-border bg-surface shadow-elevated p-4">
          <p className="text-xs text-text-tertiary mb-2">
            {!localRange?.from
              ? "Select start date"
              : !localRange?.to
                ? "Now select end date"
                : "Date range selected"}
          </p>
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
