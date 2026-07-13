"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface PasswordFieldsProps {
  prefix?: string;
  /** Controlled password value */
  password?: string;
  /** Controlled confirm password value */
  confirmPassword?: string;
  /** Password change handler */
  onPasswordChange?: (value: string) => void;
  /** Confirm password change handler */
  onConfirmChange?: (value: string) => void;
  /** Validation error message */
  error?: string;
}

export default function PasswordFields({
  prefix = "password",
  password = "",
  confirmPassword = "",
  onPasswordChange,
  onConfirmChange,
  error,
}: PasswordFieldsProps) {
  const [localPassword, setLocalPassword] = useState(password);
  const [localConfirm, setLocalConfirm] = useState(confirmPassword);
  const [localError, setLocalError] = useState("");

  const handlePasswordChange = (value: string) => {
    setLocalPassword(value);
    setLocalError("");
    onPasswordChange?.(value);
  };

  const handleConfirmChange = (value: string) => {
    setLocalConfirm(value);
    if (value && value !== (onPasswordChange ? password : localPassword)) {
      setLocalError("两次输入的密码不一致");
    } else {
      setLocalError("");
    }
    onConfirmChange?.(value);
  };

  const displayError = error || localError;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${prefix}-password`} className="text-sm font-medium text-foreground">
          密码
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={`${prefix}-password`}
            type="password"
            placeholder="至少 8 位，含大小写字母和数字"
            autoComplete="new-password"
            value={onPasswordChange ? password : localPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="h-11 rounded-xl border-border/80 bg-white/80 pl-10 text-sm backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${prefix}-confirm`} className="text-sm font-medium text-foreground">
          确认密码
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={`${prefix}-confirm`}
            type="password"
            placeholder="再次输入密码"
            autoComplete="new-password"
            value={onConfirmChange ? confirmPassword : localConfirm}
            onChange={(e) => handleConfirmChange(e.target.value)}
            className={`h-11 rounded-xl border-border/80 bg-white/80 pl-10 text-sm backdrop-blur-sm ${
              displayError ? "border-destructive" : ""
            }`}
          />
        </div>
      </div>

      {displayError && (
        <p className="text-xs text-destructive">{displayError}</p>
      )}

      <p className="text-xs text-muted-foreground">
        密码要求：至少 8 位，含大小写字母和数字
      </p>
    </div>
  );
}
