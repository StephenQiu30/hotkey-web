import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import AppProvider from "@/components/AppProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotKey - 内容创作者热点工作台",
  description: "一站式热点追踪平台，助力内容创作者把握流量脉搏",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AntdRegistry>
          <AppProvider>{children}</AppProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
