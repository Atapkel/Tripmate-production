import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, User } from "lucide-react";
import { profileService } from "@/services/profileService";
import { queryKeys } from "@/lib/queryKeys";
import { APP_NAME, ROUTES } from "@/lib/constants";

// Pages that are "sub-pages" and should show a back button
const backButtonRoutes: { match: (path: string) => boolean; fallback: string }[] = [
  { match: (p) => p === "/trips/new", fallback: "/trips" },
  { match: (p) => p === "/trips/me", fallback: "/trips" },
  { match: (p) => /^\/trips\/\d+\/edit$/.test(p), fallback: "/trips" },
  { match: (p) => /^\/trips\/\d+\/offers$/.test(p), fallback: "/trips" },
  { match: (p) => /^\/trips\/\d+\/plan$/.test(p), fallback: "/trips" },
  { match: (p) => /^\/trips\/\d+$/.test(p), fallback: "/trips" },
  { match: (p) => /^\/chats\/\d+$/.test(p), fallback: "/chats" },
  { match: (p) => p === "/profile/edit", fallback: "/profile" },
  { match: (p) => /^\/profile\/\d+$/.test(p), fallback: "/trips" },
  { match: (p) => p === "/settings/password", fallback: "/settings" },
  { match: (p) => p === "/offers", fallback: "/trips" },
  { match: (p) => p === "/recommendations", fallback: "/trips" },
  { match: (p) => p === "/settings", fallback: "/trips" },
];

function getPageTitle(pathname: string): string {
  if (pathname === "/trips" || pathname === "/") return "Explore Trips";
  if (pathname === "/trips/new") return "Create Trip";
  if (pathname === "/trips/me") return "My Trips";
  if (pathname.startsWith("/trips/") && pathname.endsWith("/edit")) return "Edit Trip";
  if (pathname.startsWith("/trips/") && pathname.endsWith("/offers")) return "Trip Offers";
  if (pathname.startsWith("/trips/") && pathname.endsWith("/plan")) return "Trip Plan";
  if (pathname.startsWith("/trips/")) return "Trip Details";
  if (pathname === "/chats") return "Messages";
  if (pathname.startsWith("/chats/")) return "Chat";
  if (pathname === "/offers") return "My Offers";
  if (pathname === "/recommendations") return "Recommendations";
  if (pathname === "/profile") return "My Profile";
  if (pathname === "/profile/edit") return "Edit Profile";
  if (pathname.startsWith("/profile/")) return "Profile";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/settings/password") return "Change Password";
  return APP_NAME;
}

export function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const title = getPageTitle(pathname);

  const { data: profile } = useQuery({
    queryKey: queryKeys.profiles.me,
    queryFn: () => profileService.getMe().then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const backRoute = backButtonRoutes.find((r) => r.match(pathname));

  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/");

  return (
    <header className="glass border-b border-border px-4 lg:px-8 py-3.5 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {backRoute && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-xl hover:bg-surface-tertiary transition-colors text-text-secondary hover:text-text-primary"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-lg font-heading font-bold text-text-primary">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden lg:inline text-sm font-medium text-text-secondary">
              {profile.first_name} {profile.last_name}
            </span>
          )}
          <NavLink
            to={ROUTES.PROFILE}
            className={`flex lg:hidden items-center justify-center w-8 h-8 rounded-xl transition-colors ${
              isProfilePage
                ? "bg-primary-100 text-primary-600"
                : "hover:bg-surface-tertiary text-text-secondary hover:text-text-primary"
            }`}
            aria-label="Profile"
          >
            <User className="h-5 w-5" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}
