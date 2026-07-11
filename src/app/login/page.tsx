"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, App } from "antd";
import { MailOutlined, LockOutlined, FireOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { login } from "@/services/auth";

const { Text } = Typography;

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { message } = App.useApp();

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const res = await login({
        email: values.email,
        password: values.password,
      });
      if (res.data?.token && res.data?.user) {
        const user = res.data.user;
        setAuth(res.data.token, {
          email: user.email ?? values.email,
          displayName: user.display_name,
        });
        message.success(`欢迎回来，${user.display_name || user.email}`);
        window.location.href = "/dashboard";
      } else {
        throw new Error("登录响应缺少 token 或用户信息");
      }
    } catch (err: any) {
      message.error(err?.message || "登录失败，请检查邮箱和密码");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
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
        <div style={{ textAlign: "center", marginBottom: 40 }}>
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
          <Text style={{ color: "#666", fontSize: 14 }}>
            内容创作者热点工作台
          </Text>
        </div>

        {/* Form */}
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
            rules={[{ required: true, message: "请输入邮箱" }]}
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
        </Form>

        <div
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
