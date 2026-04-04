import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PublicRoute } from "@/components/auth/PublicRoute";
import { ProfileGuard } from "@/components/auth/ProfileGuard";
import { BackendGuard } from "@/components/auth/BackendGuard";
import { Spinner } from "@/components/ui/Spinner";

const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const GoogleCallbackPage = lazy(() => import("@/pages/auth/GoogleCallbackPage"));

const CreateProfilePage = lazy(() => import("@/pages/profile/CreateProfilePage"));
const SetPreferencesPage = lazy(() => import("@/pages/profile/SetPreferencesPage"));
const ViewProfilePage = lazy(() => import("@/pages/profile/ViewProfilePage"));
const EditProfilePage = lazy(() => import("@/pages/profile/EditProfilePage"));

const TripFeedPage = lazy(() => import("@/pages/trips/TripFeedPage"));
const TripDetailPage = lazy(() => import("@/pages/trips/TripDetailPage"));
const CreateTripPage = lazy(() => import("@/pages/trips/CreateTripPage"));
const EditTripPage = lazy(() => import("@/pages/trips/EditTripPage"));
const MyTripsPage = lazy(() => import("@/pages/trips/MyTripsPage"));
const TripPlanPage = lazy(() => import("@/pages/trips/TripPlanPage"));

const MyOffersPage = lazy(() => import("@/pages/offers/MyOffersPage"));
const TripOffersPage = lazy(() => import("@/pages/offers/TripOffersPage"));

const RecommendationsPage = lazy(() => import("@/pages/recommendations/RecommendationsPage"));

const ChatListPage = lazy(() => import("@/pages/chat/ChatListPage"));
const ChatRoomPage = lazy(() => import("@/pages/chat/ChatRoomPage"));

const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const ChangePasswordPage = lazy(() => import("@/pages/settings/ChangePasswordPage"));

const LandingPage = lazy(() => import("@/pages/LandingPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  // Landing page
  {
    path: "/",
    element: (
      <PublicRoute>
        <SuspenseWrapper><LandingPage /></SuspenseWrapper>
      </PublicRoute>
    ),
  },

  // Public routes
  {
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { path: "/login", element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: "/register", element: <SuspenseWrapper><RegisterPage /></SuspenseWrapper> },
      { path: "/verify-email", element: <SuspenseWrapper><VerifyEmailPage /></SuspenseWrapper> },
      { path: "/forgot-password", element: <SuspenseWrapper><ForgotPasswordPage /></SuspenseWrapper> },
      { path: "/reset-password", element: <SuspenseWrapper><ResetPasswordPage /></SuspenseWrapper> },
      { path: "/auth/google/callback", element: <SuspenseWrapper><GoogleCallbackPage /></SuspenseWrapper> },
    ],
  },

  // Protected routes with profile guard
  {
    element: (
      <ProtectedRoute>
        <ProfileGuard>
          <AppLayout />
        </ProfileGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: "/trips", element: <SuspenseWrapper><TripFeedPage /></SuspenseWrapper> },
      { path: "/trips/new", element: <SuspenseWrapper><CreateTripPage /></SuspenseWrapper> },
      { path: "/trips/me", element: <SuspenseWrapper><MyTripsPage /></SuspenseWrapper> },
      { path: "/trips/:id", element: <SuspenseWrapper><TripDetailPage /></SuspenseWrapper> },
      { path: "/trips/:id/edit", element: <SuspenseWrapper><EditTripPage /></SuspenseWrapper> },
      { path: "/trips/:id/offers", element: <SuspenseWrapper><TripOffersPage /></SuspenseWrapper> },
      { path: "/trips/:id/plan", element: <SuspenseWrapper><TripPlanPage /></SuspenseWrapper> },
      { path: "/offers", element: <SuspenseWrapper><MyOffersPage /></SuspenseWrapper> },
      { path: "/recommendations", element: <SuspenseWrapper><RecommendationsPage /></SuspenseWrapper> },
      { path: "/chats", element: <SuspenseWrapper><ChatListPage /></SuspenseWrapper> },
      { path: "/chats/:id", element: <SuspenseWrapper><ChatRoomPage /></SuspenseWrapper> },
      { path: "/profile", element: <SuspenseWrapper><ViewProfilePage /></SuspenseWrapper> },
      { path: "/profile/edit", element: <SuspenseWrapper><EditProfilePage /></SuspenseWrapper> },
      { path: "/profile/:id", element: <SuspenseWrapper><ViewProfilePage /></SuspenseWrapper> },
      { path: "/settings", element: <SuspenseWrapper><SettingsPage /></SuspenseWrapper> },
      { path: "/settings/password", element: <SuspenseWrapper><ChangePasswordPage /></SuspenseWrapper> },
    ],
  },

  // Profile onboarding (authenticated, no profile guard)
  {
    element: (
      <ProtectedRoute>
        <BackendGuard>
          <AuthLayout />
        </BackendGuard>
      </ProtectedRoute>
    ),
    children: [
      { path: "/onboarding/profile", element: <SuspenseWrapper><CreateProfilePage /></SuspenseWrapper> },
      { path: "/onboarding/preferences", element: <SuspenseWrapper><SetPreferencesPage /></SuspenseWrapper> },
    ],
  },

  // 404
  { path: "*", element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper> },
]);
