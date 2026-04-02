import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validators";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/lib/errorHandler";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";

export default function ChangePasswordPage() {
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await authService.changePassword({
        current_password: data.current_password,
        new_password: data.new_password,
      });
      toast.success("Password changed successfully!");
      navigate(ROUTES.SETTINGS);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <PageContainer>
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-heading font-bold text-text-primary mb-6">Change Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="current_password"
            label="Current Password"
            type="password"
            autoComplete="current-password"
            error={errors.current_password?.message}
            {...register("current_password")}
          />
          <Input
            id="new_password"
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={errors.new_password?.message}
            {...register("new_password")}
          />
          <Input
            id="confirm_password"
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            error={errors.confirm_password?.message}
            {...register("confirm_password")}
          />
          <div className="flex gap-3">
            <Button type="button" variant="outline" fullWidth onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" fullWidth isLoading={isSubmitting}>Change Password</Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
}
