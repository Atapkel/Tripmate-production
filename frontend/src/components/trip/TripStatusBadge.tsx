import { Badge } from "@/components/ui/Badge";

const variant: Record<string, "success" | "info" | "default" | "error"> = {
  open: "success",
  matched: "info",
  closed: "default",
  cancelled: "error",
};

export function TripStatusBadge({ status }: { status: string }) {
  return <Badge variant={variant[status] || "default"}>{status}</Badge>;
}
