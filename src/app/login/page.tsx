"use client";

import { useState, useRef } from "react";
import { Form, Input, Button, Typography, App } from "antd";
import { MailOutlined, LockOutlined, FireOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuthStore } from "@/stores/authStore";
import { errorMessage } from "@/lib/authErrors";
import { safeRedirect } from "@/lib/safeRedirect";

const { Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const loginAction = useAuthStore((s) => s.login);
  const router = useRouter();
  const { message } = App.useApp();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".lg-logo-title", { y: -20, autoAlpha: 0, duration: 0.7, ease: "power3.out" });
    gsap.from(".lg-heading", { y: -10, autoAlpha: 0, duration: 0.5, delay: 0.15, ease: "power3.out" });
    gsap.from(".lg-subtitle", { y: -10, autoAlpha: 0, duration: 0.5, delay: 0.25, ease: "power3.out" });
    gsap.from(".lg-form", { y: 20, autoAlpha: 0, duration: 0.6, delay: 0.4, ease: "power3.out" });
    gsap.from(".lg-footer", { autoAlpha: 0, duration: 0.4, delay: 0.65, ease: "power3.out" });
  }, { scope: containerRef });

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      await loginAction({ email: values.email, password: values.password });
      message.success("欢迎回来");
      const params = new URLSearchParams(window.location.search);
      router.push(safeRedirect(params.get("redirect")));
    } catch (err: any) {
      const msg = errorMessage(err?.code);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          padding: "0 24px",
        }}
      >
        {/* Logo + Title */}
        <div className="lg-logo-title" style={{ textAlign: "center", marginBottom: 40 }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              color: "inherit",
              marginBottom: 24,
            }}
          >
            <FireOutlined style={{ fontSize: 24, color: "var(--ant-color-primary)" }} />
            <span
              style={{
                fontSize: 20,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              HotKey
            </span>
          </a>
          <h1
            className="lg-heading"
            style={{
              fontSize: 22,
              fontWeight: 600,
              color: "#111",
              margin: "0 0 8px",
              letterSpacing: "-0.02em",
            }}
          >
            登录工作台
          </h1>
          <Text className="lg-subtitle" style={{ color: "#666", fontSize: 14 }}>
            内容创作者热点工作台
          </Text>
        </div>

        {/* Form */}
        <div className="lg-form">
          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            style={{ width: "100%" }}
          >
            <Form.Item
              name="email"
              label={<span style={{ fontWeight: 500, fontSize: 14, color: "#111" }}>邮箱</span>}
              rules={[
                { required: true, message: "请输入邮箱" },
                { type: "email", message: "邮箱格式不正确" },
              ]}
            >
              <Input
                prefix={<MailOutlined style={{ color: "#999" }} />}
                placeholder="name@example.com"
                size="large"
                variant="filled"
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #eaeaea",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 500, fontSize: 14, color: "#111" }}>密码</span>}
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#999" }} />}
                placeholder="输入密码"
                size="large"
                variant="filled"
                style={{
                  background: "#f5f5f5",
                  border: "1px solid #eaeaea",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 28 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                进入工作台
              </Button>
            </Form.Item>

            <div
              style={{
                marginTop: 20,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <a
                href="/forgot-password"
                style={{ color: "#666", textDecoration: "none", fontSize: 13 }}
              >
                忘记密码？
              </a>
              <Text style={{ fontSize: 13, color: "#999" }}>
                还没有账号？{" "}
                <a href="/register" style={{ color: "var(--ant-color-primary)", textDecoration: "none" }}>
                  创建账号
                </a>
              </Text>
            </div>
          </Form>
        </div>

        <div
          className="lg-footer"
          style={{
            textAlign: "center",
            marginTop: 32,
            fontSize: 13,
            color: "#999",
          }}
        >
          <a href="/" style={{ color: "#666", textDecoration: "none" }}>
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
