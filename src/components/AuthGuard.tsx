"use client";

import { useAuthStore } from "@/stores/authStore";
import { Spin, Flex } from "antd";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);

  if (status === "initializing") {
    return (
      <Flex
        align="center"
        justify="center"
        style={{ minHeight: "100vh", background: "#fff" }}
      >
        <Spin size="large" />
      </Flex>
    );
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  return <>{children}</>;
}
