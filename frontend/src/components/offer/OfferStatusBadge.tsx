import { Badge } from "@/components/ui/Badge";

const variant: Record<string, "warning" | "success" | "error" | "default"> = {
  pending: "warning",
  accepted: "success",
  rejected: "error",
  cancelled: "default",
};

export function OfferStatusBadge({ status }: { status: string }) {
  return <Badge variant={variant[status] || "default"}>{status}</Badge>;
}
