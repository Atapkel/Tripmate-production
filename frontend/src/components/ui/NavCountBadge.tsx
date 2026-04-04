import { clsx } from "clsx";

interface NavCountBadgeProps {
  count: number;
  className?: string;
}

export function NavCountBadge({ count, className }: NavCountBadgeProps) {
  if (count < 1) return null;
  const text = count > 99 ? "99+" : String(count);
  return (
    <span
      className={clsx(
        "min-w-5 h-5 px-1 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-semibold leading-none tabular-nums",
        className
      )}
      aria-hidden
    >
      {text}
    </span>
  );
}
