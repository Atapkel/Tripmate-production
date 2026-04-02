import { NavLink } from "react-router-dom";
import { Compass, Map, MessageCircle, Send, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { ROUTES } from "@/lib/constants";

const navItems = [
  { to: ROUTES.TRIPS, icon: Compass, label: "Explore" },
  { to: ROUTES.MY_TRIPS, icon: Map, label: "My Trips" },
  { to: ROUTES.RECOMMENDATIONS, icon: Sparkles, label: "Recs" },
  { to: ROUTES.CHATS, icon: MessageCircle, label: "Messages" },
  { to: ROUTES.OFFERS, icon: Send, label: "Offers" },
];

export function BottomNav({ className }: { className?: string }) {
  return (
    <nav
      className={clsx(
        "fixed bottom-0 left-0 right-0 glass border-t border-border z-40",
        "flex items-center justify-around h-16 px-2",
        className
      )}
    >
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            clsx(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-xs font-medium min-w-[48px] transition-all duration-200",
              isActive
                ? "text-primary-600"
                : "text-text-tertiary hover:text-text-secondary"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={clsx(
                "flex items-center justify-center w-10 h-7 rounded-lg transition-colors",
                isActive && "bg-primary-100"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
