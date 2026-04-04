import { Badge } from "@/components/ui/Badge";

const variant: Record<string, "success" | "info" | "default" | "error"> = {
  open: "success",
  matched: "info",
  closed: "default",
  cancelled: "error",
  deleted_by_host: "error",
};

const labels: Record<string, string> = {
  deleted_by_host: "Removed by host",
};

export function TripStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variant[status] || "default"}>
      {labels[status] ?? status.replace(/_/g, " ")}
    </Badge>
  );
}
