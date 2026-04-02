import { clsx } from "clsx";

interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  variant?: "blue" | "teal" | "orange" | "default";
  className?: string;
}

export function Chip({ label, selected, onClick, variant = "default", className }: ChipProps) {
  const variantClasses = {
    default: selected
      ? "bg-primary-100 text-primary-700 border-primary-300"
      : "bg-surface-secondary text-text-secondary border-border hover:border-primary-300 hover:bg-primary-50",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    teal: "bg-primary-50 text-primary-700 border-primary-200",
    orange: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200",
        onClick && "cursor-pointer",
        variant === "default" ? variantClasses.default : variantClasses[variant],
        className
      )}
    >
      {label}
    </button>
  );
}
