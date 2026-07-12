"use client";

import { Form, Input, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface PasswordFieldsProps {
  prefix?: string;
}

/**
 * Password input fields with policy criteria display.
 *
 * Uses `autoComplete="new-password"` so password managers create
 * a new entry rather than offering existing credentials.
 */
export default function PasswordFields({ prefix = "password" }: PasswordFieldsProps) {
  return (
    <>
      <Form.Item
        label="密码"
        name={`${prefix}_password`}
        rules={[
          { required: true, message: "请输入密码" },
          { min: 8, message: "密码至少 8 位" },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
            message: "密码需包含大小写字母和数字",
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#999" }} />}
          placeholder="至少 8 位，含大小写字母和数字"
          size="large"
          autoComplete="new-password"
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
        label="确认密码"
        name={`${prefix}_password_confirm`}
        dependencies={[`${prefix}_password`]}
        rules={[
          { required: true, message: "请确认密码" },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue(`${prefix}_password`) === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("两次输入的密码不一致"));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined style={{ color: "#999" }} />}
          placeholder="再次输入密码"
          size="large"
          autoComplete="new-password"
          variant="filled"
          style={{
            background: "#f5f5f5",
            border: "1px solid #eaeaea",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        />
      </Form.Item>

      <Text type="secondary" style={{ fontSize: 12, display: "block", marginTop: -12, marginBottom: 8 }}>
        密码要求：至少 8 位，含大小写字母和数字
      </Text>
    </>
  );
}
