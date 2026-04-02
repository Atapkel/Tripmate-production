import { format, formatDistanceToNow, differenceInDays, parseISO } from "date-fns";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateRange(start: string, end: string): string {
  const s = parseISO(start);
  const e = parseISO(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  if (sameYear) {
    return `${format(s, "MMM d")} – ${format(e, "MMM d, yyyy")}`;
  }
  return `${format(s, "MMM d, yyyy")} – ${format(e, "MMM d, yyyy")}`;
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function calculateDuration(start: string, end: string): number {
  return differenceInDays(parseISO(end), parseISO(start));
}

export function formatBudget(amount?: number): string {
  if (!amount) return "Not specified";
  return `${amount.toLocaleString()} KZT`;
}

export function formatBudgetRange(min?: number, max?: number): string {
  if (!min && !max) return "Not specified";
  if (min && max) return `${min.toLocaleString()} – ${max.toLocaleString()} KZT`;
  if (max) return `Up to ${max.toLocaleString()} KZT`;
  return `From ${min!.toLocaleString()} KZT`;
}

export function formatAgeRange(min?: number, max?: number): string {
  if (!min && !max) return "Any age";
  if (min && max) return `${min} – ${max} years`;
  if (max) return `Up to ${max} years`;
  return `${min}+ years`;
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function formatMessageTime(date: string): string {
  return format(parseISO(date), "HH:mm");
}

export function formatMessageDate(date: string): string {
  const d = parseISO(date);
  const now = new Date();
  const diff = differenceInDays(now, d);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return format(d, "MMMM d, yyyy");
}
