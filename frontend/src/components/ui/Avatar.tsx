import { clsx } from "clsx";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  initials?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  online?: boolean;
}

export function Avatar({ src, alt, initials, size = "md", className, online }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  return (
    <div className={clsx("relative inline-flex shrink-0", className)}>
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className={clsx("rounded-full object-cover", sizeClasses[size])}
        />
      ) : (
        <div
          className={clsx(
            "rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold",
            sizeClasses[size]
          )}
        >
          {initials || "?"}
        </div>
      )}
      {online !== undefined && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 rounded-full border-2 border-surface",
            online ? "bg-success" : "bg-text-tertiary",
            size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"
          )}
        />
      )}
    </div>
  );
}
