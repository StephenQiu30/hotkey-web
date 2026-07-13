"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { sendVerification, confirmVerification } from "@/services/auth";

interface EmailVerificationStepProps {
  purpose: "register" | "reset_password";
  onConfirmed: (ticket: string, email: string) => void;
}

type Step = "send" | "confirm";

export default function EmailVerificationStep({ purpose, onConfirmed }: EmailVerificationStepProps) {
  const [step, setStep] = useState<Step>("send");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const handleSend = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    setSendError("");
    try {
      await sendVerification({ email, purpose });
      setStep("confirm");
      setCountdown(60);
    } catch (err: any) {
      setSendError(err.message ?? "操作失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [email, purpose]);

  const handleConfirm = useCallback(async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const res = await confirmVerification({ email, purpose, code });
      const ticket = res.data?.ticket;
      if (ticket) onConfirmed(ticket, email);
    } catch (err: any) {
      setSendError(err.message ?? "验证失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [email, purpose, code, onConfirmed]);

  if (step === "send") {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="verify-email" className="text-sm font-medium text-foreground">
            邮箱
          </Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="verify-email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSendError(""); }}
              className={`h-11 rounded-xl border-border/80 bg-card/80 pl-10 text-sm backdrop-blur-sm ${
                sendError ? "border-destructive" : ""
              }`}
            />
          </div>
          {sendError && (
            <p className="text-xs text-destructive">{sendError}</p>
          )}
        </div>
        <Button
          onClick={handleSend}
          disabled={!email || loading}
          className="h-11 w-full rounded-xl text-base shadow-lg shadow-primary/20"
        >
          {loading ? "发送中..." : "发送验证码"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted-foreground">
        验证码已发送至{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      <div className="space-y-2">
        <Label htmlFor="verify-code" className="text-sm font-medium text-foreground">
          验证码
        </Label>
        <Input
          id="verify-code"
          placeholder="输入 6 位验证码"
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setSendError(""); }}
          className={`h-11 rounded-xl border-border/80 bg-card/80 text-center font-mono text-lg tracking-[0.3em] backdrop-blur-sm ${
            sendError ? "border-destructive" : ""
          }`}
        />
        {sendError && (
          <p className="text-xs text-destructive">{sendError}</p>
        )}
      </div>

      <Button
        onClick={handleConfirm}
        disabled={code.length !== 6 || loading}
        className="h-11 w-full rounded-xl text-base shadow-lg shadow-primary/20"
      >
        {loading ? "验证中..." : "验证"}
      </Button>

      <button
        onClick={handleSend}
        disabled={countdown > 0}
        className={`w-full text-center text-sm no-underline ${
          countdown > 0
            ? "cursor-not-allowed text-muted-foreground"
            : "cursor-pointer text-primary hover:text-primary/80"
        }`}
      >
        {countdown > 0 ? `${countdown}秒后可重新发送` : "重新发送验证码"}
      </button>
    </div>
  );
}
