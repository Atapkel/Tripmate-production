import { NavLink } from "react-router-dom";
import { Compass, Map, MessageCircle, Send, User, Settings, MapPin, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { ROUTES } from "@/lib/constants";

const navItems = [
  { to: ROUTES.TRIPS, icon: Compass, label: "Explore" },
  { to: ROUTES.MY_TRIPS, icon: Map, label: "My Trips" },
  { to: ROUTES.RECOMMENDATIONS, icon: Sparkles, label: "Recommendations" },
  { to: ROUTES.CHATS, icon: MessageCircle, label: "Messages" },
  { to: ROUTES.OFFERS, icon: Send, label: "Offers" },
  { to: ROUTES.PROFILE, icon: User, label: "Profile" },
];

export function Sidebar({ className }: { className?: string }) {
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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary-50 text-primary-700 shadow-sm"
                    : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="mt-auto pt-4 border-t border-border">
        <NavLink
          to={ROUTES.SETTINGS}
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary-50 text-primary-700 shadow-sm"
                : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
