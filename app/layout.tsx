import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HotKey 创作者工作台",
  description: "热点监测、快速理解和内容选题生成工作台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
