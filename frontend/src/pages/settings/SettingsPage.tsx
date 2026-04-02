import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Lock, LogOut, Trash2 } from "lucide-react";
import { authService } from "@/services/authService";
import { profileService } from "@/services/profileService";
import { useAuthStore } from "@/stores/authStore";
import { getErrorMessage } from "@/lib/errorHandler";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ROUTES } from "@/lib/constants";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    logout();
    navigate(ROUTES.LOGIN, { replace: true });
    toast.success("Logged out.");
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await profileService.delete();
      logout();
      navigate(ROUTES.LOGIN, { replace: true });
      toast.success("Account deleted.");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const items = [
    { icon: User, label: "Edit Profile", onClick: () => navigate(ROUTES.PROFILE_EDIT) },
    { icon: Lock, label: "Change Password", onClick: () => navigate(ROUTES.SETTINGS_PASSWORD) },
    { icon: LogOut, label: "Log Out", onClick: () => setShowLogoutDialog(true) },
    { icon: Trash2, label: "Delete Account", onClick: () => setShowDeleteDialog(true), danger: true },
  ];

  return (
    <PageContainer>
      <Card className="max-w-md mx-auto divide-y divide-border">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-colors hover:bg-surface-tertiary ${
              item.danger ? "text-error" : "text-text-primary"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </button>
        ))}
      </Card>

      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Account"
        message="This action is permanent and cannot be undone."
        confirmLabel="Delete Account"
        confirmVariant="danger"
        isLoading={isDeleting}
      />
    </PageContainer>
  );
}
