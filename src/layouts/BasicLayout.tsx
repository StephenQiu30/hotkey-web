"use client";

import TopNav from "@/components/dashboard/TopNav";

interface MenuItem { path: string; name: string; icon: React.ReactNode; }

export default function BasicLayout({ children, menuItems, adminMenuItems = [], title = "HotKey" }: {
  children: React.ReactNode;
  menuItems: MenuItem[];
  adminMenuItems?: MenuItem[];
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav menuItems={menuItems} adminMenuItems={adminMenuItems} title={title} />
      <main>{children}</main>
    </div>
  );
}
