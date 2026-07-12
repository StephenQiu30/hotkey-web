"use client";

import { useState, useEffect, useCallback } from "react";
import { Input, Button, Typography, Flex } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { sendVerification, confirmVerification } from "@/services/auth";

const { Text } = Typography;

interface EmailVerificationStepProps {
  purpose: "register" | "reset_password";
  onConfirmed: (ticket: string, email: string) => void;
}

type Step = "send" | "confirm";

const inputStyle = {
  background: "#f5f5f5",
  border: "1px solid #eaeaea",
  borderRadius: 8,
  padding: "8px 12px",
};

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
      setSendError(err.message ?? "操作失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [email, purpose, code, onConfirmed]);

  if (step === "send") {
    return (
      <Flex vertical gap={16}>
        <label style={{ fontWeight: 500, fontSize: 14, color: "#111" }}>
          邮箱
        </label>
        <Input
          prefix={<MailOutlined style={{ color: "#999" }} />}
          placeholder="name@example.com"
          size="large"
          autoComplete="email"
          variant="filled"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setSendError(""); }}
          status={sendError ? "error" : undefined}
          style={inputStyle}
        />
        {sendError && (
          <Text type="danger" style={{ fontSize: 12 }}>{sendError}</Text>
        )}
        <Button type="primary" size="large" block loading={loading} onClick={handleSend}>
          发送验证码
        </Button>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={16}>
      <Text type="secondary" style={{ fontSize: 13, textAlign: "center" }}>
        验证码已发送至 <Text strong>{email}</Text>
      </Text>

      <label style={{ fontWeight: 500, fontSize: 14, color: "#111" }}>
        验证码
      </label>
      <Input
        placeholder="输入 6 位验证码"
        size="large"
        maxLength={6}
        inputMode="numeric"
        autoComplete="one-time-code"
        variant="filled"
        value={code}
        onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setSendError(""); }}
        status={sendError ? "error" : undefined}
        style={{
          ...inputStyle,
          textAlign: "center",
          fontFamily: "monospace",
          fontSize: 20,
          letterSpacing: 8,
        }}
      />
      {sendError && (
        <Text type="danger" style={{ fontSize: 12 }}>{sendError}</Text>
      )}

      <Button type="primary" size="large" block loading={loading} disabled={code.length !== 6} onClick={handleConfirm}>
        验证
      </Button>

      <Button
        type="link"
        block
        disabled={countdown > 0}
        onClick={handleSend}
        style={{ color: countdown > 0 ? "#999" : "var(--ant-color-primary)" }}
      >
        {countdown > 0 ? `${countdown}秒后可重新发送` : "重新发送验证码"}
      </Button>
    </Flex>
  );
}
