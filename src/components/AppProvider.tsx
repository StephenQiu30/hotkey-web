"use client";

import { useEffect, useRef } from "react";
import { ConfigProvider, App as AntApp, Spin, Flex } from "antd";
import zhCN from "antd/locale/zh_CN";
import { useAuthStore } from "@/stores/authStore";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initialize();
  }, [initialize]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        cssVar: true,
        token: {
          colorPrimary: "#1677FF",
          borderRadius: 8,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
          fontSizeHeading1: 48,
          fontSizeHeading2: 36,
          fontSizeHeading3: 24,
          fontSizeHeading4: 20,
        },
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
