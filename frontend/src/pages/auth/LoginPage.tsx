import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.TRIPS;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await authService.login(data);
      setTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.response?.status === 403) {
        toast.error("Please verify your email first.");
        navigate(ROUTES.VERIFY_EMAIL);
        return;
      }
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-6 text-center">Log In</h2>
      <GoogleButton label="Sign in with Google" />
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-text-tertiary">or</span>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <div className="relative">
          <Input
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-text-tertiary hover:text-text-secondary"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="text-right">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-primary-600 hover:text-primary-700">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Log In
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{" "}
        <Link to={ROUTES.REGISTER} className="text-primary-600 hover:text-primary-700 font-medium">
          Register
        </Link>
      </p>
    </Card>
  );
}
