"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import AuthShell from "@/components/auth/AuthShell";
import PasswordFields from "@/components/auth/PasswordFields";
import { resetPassword } from "@/services/auth";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".rp-content", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" });
  }, { scope: containerRef });

  useEffect(() => {
    const stored = sessionStorage.getItem("verification_ticket");
    if (!stored) {
      window.location.href = "/forgot-password";
      return;
    }
    setTicket(stored);
    sessionStorage.removeItem("verification_ticket");
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket) return;
    if (password.length < 8) {
      setError("密码至少 8 位");
      return;
    }
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await resetPassword({
        reset_token: ticket,
        new_password: password,
      });
      setSuccess(true);
      toast.success("密码已重置");
    } catch (err: any) {
      setError(err.message ?? "密码重置失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) {
    return null;
  }

  if (success) {
    return (
      <AuthShell title="密码已重置" subtitle="请使用新密码登录">
        <div className="text-center">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-500" />
          <p className="mb-6 text-sm text-muted-foreground">
            密码重置成功
          </p>
          <a href="/login">
            <Button className="h-11 w-full rounded-xl text-base shadow-lg shadow-primary/20">
              前往登录
            </Button>
          </a>
        </div>
      </AuthShell>
    );
  }

  return (
    <div ref={containerRef}>
      <AuthShell title="设置新密码" subtitle="请输入新密码">
        <div className="rp-content">
          <form onSubmit={handleReset} className="space-y-4">
            <PasswordFields
              prefix="reset"
              password={password}
              confirmPassword={confirmPassword}
              onPasswordChange={setPassword}
              onConfirmChange={setConfirmPassword}
            />

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading || !password}
              className="h-11 w-full rounded-xl text-base shadow-lg shadow-primary/20"
            >
              {loading ? "重置中..." : "重置密码"}
            </Button>
          </form>
        </div>
      </AuthShell>
    </div>
  );
}
