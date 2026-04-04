import { Badge } from "@/components/ui/Badge";

const variant: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  accepted: "success",
  rejected: "default",
  cancelled: "default",
};

const label: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export function OfferStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={variant[status] || "default"} className="normal-case">
      {label[status] ?? status}
    </Badge>
  );
}
