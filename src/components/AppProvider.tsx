"use client";

import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";

export default function AppProvider({ children }: { children: React.ReactNode }) {
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
