import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validators";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <Card>
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-4 text-center">
          Invalid Reset Link
        </h2>
        <p className="text-sm text-text-secondary mb-6 text-center">
          This password reset link is invalid or has expired.
        </p>
        <div className="flex flex-col gap-3">
          <Link to={ROUTES.FORGOT_PASSWORD}>
            <Button fullWidth variant="primary">Request a New Link</Button>
          </Link>
          <Link to={ROUTES.LOGIN} className="text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
            Back to Login
          </Link>
        </div>
      </Card>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await authService.resetPassword({
        token,
        new_password: data.new_password,
      });
      toast.success("Password reset successfully! Please log in.");
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-6 text-center">
        Reset Password
      </h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <p className="text-sm text-text-secondary mb-4">
          Enter your new password below.
        </p>
        <Input
          id="new_password"
          label="New Password"
          type="password"
          placeholder="Enter new password"
          error={form.formState.errors.new_password?.message}
          {...form.register("new_password")}
        />
        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />
        <Button type="submit" fullWidth isLoading={form.formState.isSubmitting}>
          Reset Password
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
          Back to Login
        </Link>
      </p>
    </Card>
  );
}
