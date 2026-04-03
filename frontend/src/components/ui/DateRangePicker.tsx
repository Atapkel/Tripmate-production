import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
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

function toDate(s: string) {
  return new Date(s + "T00:00:00");
}

function SingleDatePicker({
  value,
  onChange,
  placeholder,
  disabledBefore,
  disabledAfter,
  hasError,
}: {
  value?: string;
  onChange: (date: string) => void;
  placeholder: string;
  disabledBefore?: Date;
  disabledAfter?: Date;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const disabled: Array<{ before: Date } | { after: Date }> = [];
  if (disabledBefore) disabled.push({ before: disabledBefore });
  if (disabledAfter) disabled.push({ after: disabledAfter });

  return (
    <div ref={ref} className="relative flex-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={clsx(
          "w-full rounded-xl border bg-surface px-3 py-2.5 text-sm text-left transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
          "flex items-center gap-2",
          hasError ? "border-error" : "border-border"
        )}
      >
        <Calendar className="w-4 h-4 text-text-tertiary shrink-0" />
        <span className={value ? "text-text-primary" : "text-text-tertiary"}>
          {value ? format(toDate(value), "MMM d, yyyy") : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 rounded-xl border border-border bg-surface shadow-elevated p-3">
          <DayPicker
            mode="single"
            selected={value ? toDate(value) : undefined}
            onSelect={(day) => {
              if (day) {
                onChange(format(day, "yyyy-MM-dd"));
                setOpen(false);
              }
            }}
            defaultMonth={value ? toDate(value) : undefined}
            disabled={disabled}
            classNames={{
              today: "font-bold text-primary-600",
              selected: "bg-primary-500 text-white rounded-full",
              chevron: "fill-primary-500",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function DateRangePicker({
  startDate,
  endDate,
  onRangeChange,
  error,
  label,
}: DateRangePickerProps) {
  const handleStartChange = (date: string) => {
    // If end date exists and is before new start, clear it
    if (endDate && date > endDate) {
      onRangeChange(date, "");
    } else {
      onRangeChange(date, endDate || "");
    }
  };

  const handleEndChange = (date: string) => {
    onRangeChange(startDate || "", date);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <SingleDatePicker
          value={startDate}
          onChange={handleStartChange}
          placeholder="Start date"
          disabledBefore={new Date()}
          hasError={!!error}
        />
        <span className="text-text-tertiary text-sm">—</span>
        <SingleDatePicker
          value={endDate}
          onChange={handleEndChange}
          placeholder="End date"
          disabledBefore={startDate ? toDate(startDate) : new Date()}
          hasError={!!error}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
