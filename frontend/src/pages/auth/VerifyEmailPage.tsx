import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import { authService } from "@/services/authService";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const userId = Number(sessionStorage.getItem("verify_user_id"));
  const email = sessionStorage.getItem("verify_email") || "";

  useEffect(() => {
    if (!userId) navigate(ROUTES.REGISTER, { replace: true });
  }, [userId, navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
    if (newCode.every((d) => d !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    if (newCode.every((d) => d !== "")) {
      handleVerify(newCode.join(""));
    }
  };

  const handleVerify = async (verificationCode: string) => {
    setIsSubmitting(true);
    try {
      await authService.verifyEmail({ user_id: userId, verification_code: verificationCode });
      toast.success("Email verified! Please log in.");
      sessionStorage.removeItem("verify_user_id");
      sessionStorage.removeItem("verify_email");
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setCode(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      await authService.resendVerification({ user_id: userId });
      toast.success("Verification code resent!");
      setResendCooldown(60);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <Card className="text-center">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-primary-50 rounded-2xl">
          <Mail className="h-8 w-8 text-primary-600" />
        </div>
      </div>
      <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Verify Your Email</h2>
      <p className="text-sm text-text-secondary mb-6">
        We sent a 4-digit code to <strong>{email}</strong>
      </p>
      <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
        {code.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isSubmitting}
            className="w-14 h-14 text-center text-2xl font-bold rounded-xl border border-border bg-surface focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        ))}
      </div>
      <Button
        fullWidth
        isLoading={isSubmitting}
        onClick={() => handleVerify(code.join(""))}
        disabled={code.some((d) => d === "")}
      >
        Verify
      </Button>
      <p className="mt-4 text-sm text-text-secondary">
        Didn't receive it?{" "}
        {resendCooldown > 0 ? (
          <span className="text-text-tertiary">Resend in {resendCooldown}s</span>
        ) : (
          <button onClick={handleResend} className="text-primary-600 hover:text-primary-700 font-medium">
            Resend
          </button>
        )}
      </p>
    </Card>
  );
}
