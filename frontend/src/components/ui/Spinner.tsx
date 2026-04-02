import { Loader2 } from "lucide-react";
import { clsx } from "clsx";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <Loader2
      className={clsx(
        "animate-spin text-primary-600",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "md",
          "h-10 w-10": size === "lg",
        },
        className
      )}
    />
  );
}
