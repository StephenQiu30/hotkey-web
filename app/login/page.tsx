"use client";

import { useState } from "react";
import { Card, Form, Input, Button, Typography, App } from "antd";
import { MailOutlined, LockOutlined, FireOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { login } from "@/services/hotkey/hotkey-server/auth";

const { Title, Text } = Typography;

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
        background: "#f0f5ff",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          <FireOutlined
            style={{ fontSize: 36, color: "#1677FF", marginBottom: 16 }}
          />
          <Title level={3} style={{ margin: 0 }}>
            HotKey
          </Title>
          <Text type="secondary">内容创作者热点工作台</Text>
        </div>

        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: "请输入邮箱" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="name@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="********"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
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
      </Card>
    </div>
  );
}
