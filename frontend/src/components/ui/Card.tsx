import { clsx } from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className, onClick, hoverable }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "bg-surface rounded-2xl border border-border p-4 lg:p-6",
        "shadow-card",
        hoverable && "hover:shadow-elevated hover:border-primary-200 transition-all duration-200 cursor-pointer hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}
