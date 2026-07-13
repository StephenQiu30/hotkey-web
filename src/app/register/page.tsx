"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import AuthShell from "@/components/auth/AuthShell";
import EmailVerificationStep from "@/components/auth/EmailVerificationStep";
import PasswordFields from "@/components/auth/PasswordFields";
import { register as apiRegister } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";
import { createRegisterRequest } from "@/lib/registerRequest";

type Step = "email" | "profile";

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("email");
  const [ticket, setTicket] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const establishSession = useAuthStore((s) => s.establishSession);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".rg-content", { y: 20, opacity: 0, duration: 0.5, ease: "power3.out" });
  }, { scope: containerRef, dependencies: [step] });

  const handleConfirmed = (tkt: string, eml: string) => {
    setTicket(tkt);
    setEmail(eml);
    setStep("profile");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName) {
      setError("请输入显示名称");
      return;
    }
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
      const response = await apiRegister(
        createRegisterRequest(ticket, password, displayName)
      );
      if (!response.data) throw new Error("注册响应无效");
      await establishSession(response.data);
      toast.success("注册成功");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={containerRef}>
      <AuthShell title="创建账号" subtitle="开启热点创作之旅">
        <div className="rg-content">
          {step === "email" && (
            <EmailVerificationStep
              purpose="register"
              onConfirmed={handleConfirmed}
            />
          )}

          {step === "profile" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-sm font-medium text-foreground">
                  显示名称
                </Label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="display-name"
                    placeholder="您的昵称"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-11 rounded-xl border-border/80 bg-white/80 pl-10 text-sm backdrop-blur-sm"
                  />
                </div>
              </div>

              <PasswordFields
                prefix="register"
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
                disabled={loading}
                className="h-11 w-full rounded-xl text-base shadow-lg shadow-primary/20"
              >
                {loading ? "注册中..." : "完成注册"}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            已有账号？去登录
          </a>
        </div>
      </AuthShell>
    </div>
  );
}
