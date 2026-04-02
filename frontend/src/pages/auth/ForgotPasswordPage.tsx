import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validators";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data);
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-6 text-center">
        Forgot Password
      </h2>

      {sent ? (
        <div className="text-center space-y-4">
          <p className="text-sm text-text-secondary">
            If an account exists with that email, we've sent a password reset link.
            Please check your inbox.
          </p>
          <p className="text-sm text-text-secondary">
            The link will expire in 1 hour.
          </p>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <p className="text-sm text-text-secondary mb-4">
            Enter your email and we'll send you a reset link.
          </p>
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
          <Button type="submit" fullWidth isLoading={form.formState.isSubmitting}>
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-text-secondary">
        <Link to={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-700 font-medium">
          Back to Login
        </Link>
      </p>
    </Card>
  );
}
