"use client";

import { useState, useEffect, useRef } from "react";
import { Form, Button, Typography, Alert, Flex } from "antd";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import AuthShell from "@/components/auth/AuthShell";
import PasswordFields from "@/components/auth/PasswordFields";
import { resetPassword } from "@/services/auth";
import { errorMessage } from "@/lib/authErrors";

const { Text } = Typography;

export default function ResetPasswordPage() {
  const [ticket, setTicket] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".rp-content", { y: 20, autoAlpha: 0, duration: 0.5, ease: "power3.out" });
  }, { scope: containerRef });

  useEffect(() => {
    // Read the verification ticket from sessionStorage (set by forgot-password page)
    const stored = sessionStorage.getItem("verification_ticket");
    if (!stored) {
      window.location.href = "/forgot-password";
      return;
    }
    setTicket(stored);
    // Clear immediately — ticket is in-memory only
    sessionStorage.removeItem("verification_ticket");
  }, []);

  const handleReset = async (values: { reset_password: string }) => {
    if (!ticket) return;
    setLoading(true);
    setError("");
    try {
      await resetPassword({
        reset_token: ticket,
        new_password: values.reset_password,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(errorMessage(err.code));
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
        <Flex vertical gap={16} align="center">
          <Alert type="success" message="密码重置成功" showIcon />
          <Button type="primary" size="large" href="/login">
            前往登录
          </Button>
        </Flex>
        <div className="rp-content" />
      </AuthShell>
    );
  }

  return (
    <div ref={containerRef}>
      <AuthShell title="设置新密码" subtitle="请输入新密码">
        <div className="rp-content">
          <Form layout="vertical" onFinish={handleReset} style={{ width: "100%" }}>
            <Flex vertical gap={16}>
              <PasswordFields prefix="reset" />

              {error && (
                <Text type="danger" style={{ fontSize: 12 }}>{error}</Text>
              )}

              <Button type="primary" size="large" block htmlType="submit" loading={loading}>
                重置密码
              </Button>
            </Flex>
          </Form>
        </div>
      </AuthShell>
    </div>
  );
}
