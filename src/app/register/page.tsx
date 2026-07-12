"use client";

import { useState, useRef } from "react";
import { Form, Input, Button, Typography, Flex } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import AuthShell from "@/components/auth/AuthShell";
import EmailVerificationStep from "@/components/auth/EmailVerificationStep";
import PasswordFields from "@/components/auth/PasswordFields";
import { register as apiRegister } from "@/services/auth";
import { useAuthStore } from "@/stores/authStore";

const { Text } = Typography;

type Step = "email" | "profile";

const inputStyle = {
  background: "#f5f5f5",
  border: "1px solid #eaeaea",
  borderRadius: 8,
  padding: "8px 12px",
};

export default function RegisterPage() {
  const [step, setStep] = useState<Step>("email");
  const [ticket, setTicket] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const loginAction = useAuthStore((s) => s.login);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".rg-content", { y: 20, autoAlpha: 0, duration: 0.5, ease: "power3.out" });
  }, { scope: containerRef, dependencies: [step] });

  const handleConfirmed = (tkt: string) => {
    setTicket(tkt);
    setStep("profile");
  };

  const handleRegister = async (values: {
    display_name: string;
    register_password: string;
  }) => {
    setLoading(true);
    setError("");
    try {
      await apiRegister({
        email,
        password: values.register_password,
        display_name: values.display_name,
      });
      // Auto-login after registration
      await loginAction({ email, password: values.register_password });
    } catch (err: any) {
      setError(err?.message || "注册失败，请稍后再试");
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
            <Form layout="vertical" onFinish={handleRegister} style={{ width: "100%" }}>
              <Flex vertical gap={16}>
                <Form.Item
                  name="display_name"
                  label="显示名称"
                  rules={[{ required: true, message: "请输入显示名称" }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: "#999" }} />}
                    placeholder="您的昵称"
                    size="large"
                    variant="filled"
                    style={inputStyle}
                  />
                </Form.Item>

                <PasswordFields prefix="register" />

                {error && (
                  <Text type="danger" style={{ fontSize: 12 }}>{error}</Text>
                )}

                <Button type="primary" size="large" block htmlType="submit" loading={loading}>
                  完成注册
                </Button>
              </Flex>
            </Form>
          )}
        </div>
      </AuthShell>
    </div>
  );
}
