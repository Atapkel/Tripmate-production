import { Link, useLocation } from "react-router-dom";
import { Compass, Map, MessageCircle, Send, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { ROUTES } from "@/lib/constants";
import { getBottomNavActiveId, normalizePathname } from "@/lib/navActive";

const navItems = [
  { id: "explore" as const, to: ROUTES.TRIPS, icon: Compass, label: "Explore" },
  { id: "myTrips" as const, to: ROUTES.MY_TRIPS, icon: Map, label: "My Trips" },
  { id: "recs" as const, to: ROUTES.RECOMMENDATIONS, icon: Sparkles, label: "Recs" },
  { id: "messages" as const, to: ROUTES.CHATS, icon: MessageCircle, label: "Messages" },
  { id: "offers" as const, to: ROUTES.OFFERS, icon: Send, label: "Offers" },
];

export function BottomNav({ className }: { className?: string }) {
  const { pathname } = useLocation();
  // Re-render on route changes via `pathname`; highlight uses the real URL bar when in the browser.
  const path =
    typeof window !== "undefined"
      ? normalizePathname(window.location.pathname)
      : normalizePathname(pathname);
  const activeId = getBottomNavActiveId(path);

  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 glass border-t border-border z-40",
        "flex items-center justify-around h-16 px-2",
        className
      )}
    >
      {navItems.map((item) => {
        const isActive = item.id === activeId;
        return (
          <Link
            key={item.id}
            to={item.to}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-xs font-medium min-w-[48px] transition-all duration-200",
              "[-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2",
              isActive
                ? "text-primary-600"
                : "text-text-tertiary hover:text-text-secondary"
            )}
          >
            <div
              className={clsx(
                "flex items-center justify-center w-10 h-7 rounded-lg transition-colors",
                isActive && "bg-primary-100"
              )}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
