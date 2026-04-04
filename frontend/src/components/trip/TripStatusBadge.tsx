import { clsx } from "clsx";
import { Badge } from "@/components/ui/Badge";

const variant: Record<string, "success" | "info" | "default" | "error"> = {
  open: "success",
  matched: "info",
  closed: "default",
  cancelled: "error",
  deleted_by_host: "error",
};

const labels: Record<string, string> = {
  open: "Open",
  matched: "Matched",
  closed: "Closed",
  cancelled: "Cancelled",
  deleted_by_host: "Deleted by host",
};

export function TripStatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  const label = labels[status] ?? status.replace(/_/g, " ");
  return (
    <Badge
      variant={variant[status] || "default"}
      className={clsx("normal-case", className)}
    >
      {label}
    </Badge>
  );
}
