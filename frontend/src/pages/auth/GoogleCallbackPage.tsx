import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/lib/errorHandler";
import { ROUTES } from "@/lib/constants";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens, setUser } = useAuthStore();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google sign-in was cancelled.");
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (!code) {
      toast.error("Invalid Google callback.");
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;

    authService
      .googleAuth({ code, redirect_uri: redirectUri })
      .then((res) => {
        setTokens(res.data.access_token, res.data.refresh_token);
        setUser(res.data.user);
        toast.success("Welcome!");
        navigate(ROUTES.TRIPS, { replace: true });
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate(ROUTES.LOGIN, { replace: true });
      });
  }, [searchParams, setTokens, setUser, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      <p className="text-text-secondary">Signing in with Google...</p>
    </div>
  );
}
