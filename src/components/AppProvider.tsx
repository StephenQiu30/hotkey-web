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
          borderRadius: 6,
        },
      }}
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
