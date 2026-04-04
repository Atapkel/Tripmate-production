import { Link, useLocation } from "react-router-dom";
import { Compass, Map, MessageCircle, Send, User, Settings, MapPin, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { ROUTES } from "@/lib/constants";
import { isMainNavItemActive, isNavItemActive, normalizePathname } from "@/lib/navActive";
import { usePendingReceivedOffersCount } from "@/hooks/usePendingReceivedOffersCount";
import { useChatsUnreadTotal } from "@/hooks/useChatsUnreadTotal";
import { NavCountBadge } from "@/components/ui/NavCountBadge";

type NavItem =
  | { to: string; icon: typeof Compass; label: string; end: boolean }
  | {
      to: string;
      icon: typeof User;
      label: string;
      /** Only "my" profile + edit — not `/profile/:otherUserId` */
      isActive: (pathname: string) => boolean;
    };

const navItems: NavItem[] = [
  { to: ROUTES.TRIPS, icon: Compass, label: "Explore", end: true },
  { to: ROUTES.MY_TRIPS, icon: Map, label: "My Trips", end: true },
  { to: ROUTES.RECOMMENDATIONS, icon: Sparkles, label: "Recommendations", end: true },
  { to: ROUTES.CHATS, icon: MessageCircle, label: "Messages", end: false },
  { to: ROUTES.OFFERS, icon: Send, label: "Offers", end: true },
  {
    to: ROUTES.PROFILE,
    icon: User,
    label: "Profile",
    isActive: (pathname) => {
      const p = normalizePathname(pathname);
      return p === normalizePathname(ROUTES.PROFILE) || p === normalizePathname(ROUTES.PROFILE_EDIT);
    },
  },
];

export function Sidebar({ className }: { className?: string }) {
  const { pathname } = useLocation();
  const settingsActive = isNavItemActive(pathname, ROUTES.SETTINGS, false);
  const { data: pendingReceived = 0 } = usePendingReceivedOffersCount();
  const { data: chatsUnread = 0 } = useChatsUnreadTotal();

  return (
    <aside
      className={clsx(
        "w-[260px] bg-surface border-r border-border flex-col justify-between p-4",
        className
      )}
    >
      <div>
        <div className="flex items-center gap-2.5 px-3 py-4 mb-6">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary-600 text-white">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xl font-heading font-bold text-text-primary">TripMate</span>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              "isActive" in item
                ? item.isActive(pathname)
                : isMainNavItemActive(pathname, item.to, item.end);
            const offersBadge = item.to === ROUTES.OFFERS ? pendingReceived : 0;
            const messagesBadge = item.to === ROUTES.CHATS ? chatsUnread : 0;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive ? "page" : undefined}
                aria-label={
                  offersBadge > 0
                    ? `${item.label}, ${offersBadge} pending`
                    : messagesBadge > 0
                      ? `${item.label}, ${messagesBadge} unread`
                      : undefined
                }
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 truncate">{item.label}</span>
                {offersBadge > 0 && <NavCountBadge count={offersBadge} className="shrink-0" />}
                {messagesBadge > 0 && <NavCountBadge count={messagesBadge} className="shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto pt-4 border-t border-border">
        <Link
          to={ROUTES.SETTINGS}
          aria-current={settingsActive ? "page" : undefined}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
            settingsActive
              ? "bg-primary-50 text-primary-700 shadow-sm"
              : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
          )}
        >
          <Settings className="h-5 w-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
