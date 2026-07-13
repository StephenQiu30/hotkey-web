"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface PasswordFieldsProps {
  prefix?: string;
  password?: string;
  confirmPassword?: string;
  onPasswordChange?: (value: string) => void;
  onConfirmChange?: (value: string) => void;
  error?: string;
}

export default function PasswordFields({
  prefix = "password", password = "", confirmPassword = "",
  onPasswordChange, onConfirmChange, error,
}: PasswordFieldsProps) {
  const [localPassword, setLocalPassword] = useState(password);
  const [localConfirm, setLocalConfirm] = useState(confirmPassword);
  const [localError, setLocalError] = useState("");

  const handlePasswordChange = (value: string) => {
    setLocalPassword(value); setLocalError(""); onPasswordChange?.(value);
  };
  const handleConfirmChange = (value: string) => {
    setLocalConfirm(value);
    if (value && value !== (onPasswordChange ? password : localPassword)) setLocalError("两次输入的密码不一致");
    else setLocalError("");
    onConfirmChange?.(value);
  };

  const displayError = error || localError;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-password`} className="text-xs font-medium">密码</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input id={`${prefix}-password`} type="password" placeholder="至少 8 位，含大小写字母和数字"
            autoComplete="new-password"
            value={onPasswordChange ? password : localPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="h-9 rounded-md border-border bg-black/40 pl-8 text-xs" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${prefix}-confirm`} className="text-xs font-medium">确认密码</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input id={`${prefix}-confirm`} type="password" placeholder="再次输入密码"
            autoComplete="new-password"
            value={onConfirmChange ? confirmPassword : localConfirm}
            onChange={(e) => handleConfirmChange(e.target.value)}
            className={`h-9 rounded-md border-border bg-black/40 pl-8 text-xs ${displayError ? "border-destructive" : ""}`} />
        </div>
      </div>
      {displayError && <p className="text-xs text-destructive">{displayError}</p>}
      <p className="text-[11px] text-muted-foreground">密码要求：至少 8 位，含大小写字母和数字</p>
    </div>
  );
}
