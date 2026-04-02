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
  error,
}: RangeSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"low" | "high" | null>(null);

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

  const lowPercent = getPercent(valueLow);
  const highPercent = getPercent(valueHigh);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-text-primary">
          {label}
        </label>
      )}
      <div className="flex items-center justify-between text-sm text-text-secondary mb-1">
        <span>{formatValue(valueLow)}</span>
        <span>{formatValue(valueHigh)}</span>
      </div>
      <div
        ref={trackRef}
        className="relative h-10 flex items-center select-none touch-none"
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
      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
}
