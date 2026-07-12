"use client";

import { Card, Flex, Typography } from "antd";

const { Text } = Typography;

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        minHeight: "100vh",
        background: "#fff",
        padding: "24px",
      }}
    >
      <Card
        variant="outlined"
        styles={{ body: { padding: "40px 32px" } }}
        style={{ width: "100%", maxWidth: 400 }}
      >
        <Flex vertical gap={4} style={{ marginBottom: 32, textAlign: "center" }}>
          <Text strong style={{ fontSize: 22, letterSpacing: "-0.02em" }}>
            {title}
          </Text>
          <Text type="secondary" style={{ fontSize: 14 }}>
            {subtitle}
          </Text>
        </Flex>
        {children}
      </Card>
    </Flex>
  );
}
