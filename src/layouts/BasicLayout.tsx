"use client";

import TopNav from "@/components/dashboard/TopNav";

interface MenuItem { path: string; name: string; icon: React.ReactNode; }

export default function BasicLayout({ children, menuItems, title = "HotKey" }: {
  children: React.ReactNode;
  menuItems: MenuItem[];
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopNav menuItems={menuItems} title={title} />
      <main>{children}</main>
    </div>
  );
}
