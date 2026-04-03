import { useState, useRef, useCallback, useEffect } from "react";
import { clsx } from "clsx";

interface RangeSliderProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  valueLow: number;
  valueHigh: number;
  onChange: (low: number, high: number) => void;
  formatValue?: (value: number) => string;
  /** Suffix shown inside inline inputs (e.g. "KZT", "yrs") */
  inputSuffix?: string;
  error?: string;
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  valueLow,
  valueHigh,
  onChange,
  formatValue = (v) => String(v),
  inputSuffix,
  error,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);

  // Local input state so user can type freely, then commit on blur/enter
  const [lowInput, setLowInput] = useState(String(valueLow));
  const [highInput, setHighInput] = useState(String(valueHigh));

  // Sync local inputs when external values change (and not actively editing)
  useEffect(() => {
    if (document.activeElement?.getAttribute("data-range-input") !== "low") {
      setLowInput(String(valueLow));
    }
  }, [valueLow]);

  useEffect(() => {
    if (document.activeElement?.getAttribute("data-range-input") !== "high") {
      setHighInput(String(valueHigh));
    }
  }, [valueHigh]);

  const getPercent = (value: number) => ((value - min) / (max - min)) * 100;

  const getValueFromX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track) return min;
      const rect = track.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const raw = min + percent * (max - min);
      return Math.round(raw / step) * step;
    },
    [min, max, step]
  );

  const handlePointerDown = (thumb: "low" | "high") => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(thumb);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragging) return;
      const val = getValueFromX(e.clientX);
      if (dragging === "low") {
        onChange(Math.min(val, valueHigh - step), valueHigh);
      } else {
        onChange(valueLow, Math.max(val, valueLow + step));
      }
    },
    [dragging, getValueFromX, onChange, valueLow, valueHigh, step]
  );

  const handlePointerUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };
    }
  }, [dragging, handlePointerMove, handlePointerUp]);

  const commitLow = () => {
    const parsed = Number(lowInput);
    if (!isNaN(parsed)) {
      const clamped = Math.max(min, Math.min(parsed, valueHigh - step));
      const snapped = Math.round(clamped / step) * step;
      onChange(snapped, valueHigh);
      setLowInput(String(snapped));
    } else {
      setLowInput(String(valueLow));
    }
  };

  const commitHigh = () => {
    const parsed = Number(highInput);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(parsed, valueLow + step));
      const snapped = Math.round(clamped / step) * step;
      onChange(valueLow, snapped);
      setHighInput(String(snapped));
    } else {
      setHighInput(String(valueHigh));
    }
  };

  const handleKeyDown = (commit: () => void) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
      (e.target as HTMLInputElement).blur();
    }
  };

  const lowPercent = getPercent(valueLow);
  const highPercent = getPercent(valueHigh);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}

      {/* Editable inputs row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            data-range-input="low"
            type="text"
            inputMode="numeric"
            value={lowInput}
            onChange={(e) => setLowInput(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitLow}
            onKeyDown={handleKeyDown(commitLow)}
            className={clsx(
              "w-full rounded-lg border bg-surface px-3 py-1.5 text-sm text-text-primary transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              error ? "border-error" : "border-border",
              inputSuffix && "pr-12"
            )}
          />
          {inputSuffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary pointer-events-none">
              {inputSuffix}
            </span>
          )}
        </div>
        <span className="text-text-tertiary text-sm">—</span>
        <div className="relative flex-1">
          <input
            data-range-input="high"
            type="text"
            inputMode="numeric"
            value={highInput}
            onChange={(e) => setHighInput(e.target.value.replace(/[^0-9]/g, ""))}
            onBlur={commitHigh}
            onKeyDown={handleKeyDown(commitHigh)}
            className={clsx(
              "w-full rounded-lg border bg-surface px-3 py-1.5 text-sm text-text-primary transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500",
              error ? "border-error" : "border-border",
              inputSuffix && "pr-12"
            )}
          />
          {inputSuffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-tertiary pointer-events-none">
              {inputSuffix}
            </span>
          )}
        </div>
      </div>

      {/* Slider track */}
      <div
        ref={trackRef}
        className="relative h-8 flex items-center select-none touch-none"
      >
        {/* Track background */}
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-border" />
        {/* Active range */}
        <div
          className="absolute h-1.5 rounded-full bg-primary-500"
          style={{
            left: `${lowPercent}%`,
            width: `${highPercent - lowPercent}%`,
          }}
        />
        {/* Low thumb */}
        <div
          onPointerDown={handlePointerDown("low")}
          className={clsx(
            "absolute w-5 h-5 rounded-full bg-white border-2 border-primary-500 shadow-sm cursor-grab -translate-x-1/2",
            "hover:scale-110 transition-transform",
            dragging === "low" && "cursor-grabbing scale-110 ring-2 ring-primary-200"
          )}
          style={{ left: `${lowPercent}%` }}
        />
        {/* High thumb */}
        <div
          onPointerDown={handlePointerDown("high")}
          className={clsx(
            "absolute w-5 h-5 rounded-full bg-white border-2 border-primary-500 shadow-sm cursor-grab -translate-x-1/2",
            "hover:scale-110 transition-transform",
            dragging === "high" && "cursor-grabbing scale-110 ring-2 ring-primary-200"
          )}
          style={{ left: `${highPercent}%` }}
        />
      </div>

      {/* Min/max labels */}
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
