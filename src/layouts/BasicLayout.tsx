"use client";

import TopNav from "@/components/dashboard/TopNav";

interface MenuItem { path: string; name: string; icon: React.ReactNode; }

interface BasicLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  title?: string;
}

export default function BasicLayout({ children, menuItems, title = "HotKey" }: BasicLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav menuItems={menuItems} title={title} />
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
