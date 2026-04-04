import { ROUTES } from "@/lib/constants";

export type BottomNavTabId = "explore" | "myTrips" | "recs" | "messages" | "offers";

/** Strip trailing slashes except keep "/" for root. */
export function normalizePathname(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

/**
 * At most one bottom-nav tab is active (mutually exclusive if/else).
 * My Trips is checked before Explore so `/trips` vs `/trips/me` never overlap.
 */
export function getBottomNavActiveId(pathname: string): BottomNavTabId | null {
  const p = normalizePathname(pathname);
  const myTrips = normalizePathname(ROUTES.MY_TRIPS);
  const feed = normalizePathname(ROUTES.TRIPS);
  if (p === myTrips) return "myTrips";
  if (p === feed) return "explore";
  if (p === normalizePathname(ROUTES.RECOMMENDATIONS)) return "recs";
  const chats = normalizePathname(ROUTES.CHATS);
  if (p === chats || p.startsWith(`${chats}/`)) return "messages";
  if (p === normalizePathname(ROUTES.OFFERS)) return "offers";
  return null;
}

/**
 * Generic active check. When `end` is true, only exact `to` matches.
 * When false, `pathname` matches if it equals `to` or continues with a segment (`/chats/12`).
 */
export function isNavItemActive(pathname: string, to: string, end: boolean): boolean {
  const p = normalizePathname(pathname);
  const t = normalizePathname(to);
  if (end) return p === t;
  return p === t || p.startsWith(`${t}/`);
}

/**
 * Sidebar / bottom nav: Explore (`/trips`) and My Trips (`/trips/me`) must never both read as active.
 * Uses explicit paths so `/trips` is never treated as a prefix of other trip routes.
 */
export function isMainNavItemActive(pathname: string, to: string, end: boolean): boolean {
  const p = normalizePathname(pathname);
  if (to === ROUTES.TRIPS) return p === normalizePathname(ROUTES.TRIPS);
  if (to === ROUTES.MY_TRIPS) return p === normalizePathname(ROUTES.MY_TRIPS);
  return isNavItemActive(pathname, to, end);
}
