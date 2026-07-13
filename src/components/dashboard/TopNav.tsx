"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, X, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

interface MenuItem {
  path: string; name: string; icon: React.ReactNode;
}

interface TopNavProps {
  menuItems: MenuItem[];
  title?: string;
}

export default function TopNav({ menuItems, title = "HotKey" }: TopNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const user = useAuthStore((s) => s.user);

  const handleLogout = async () => { setLoggingOut(true); await logout(); window.location.href = "/login"; };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <Link href="/dashboard" className="flex items-center gap-1.5 text-foreground no-underline">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">{title}</span>
          </Link>
          <nav className="hidden items-center gap-0.5 md:flex">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
              return (
                <Link key={item.path} href={item.path}
                  className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium no-underline transition-colors ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="h-7 w-7 cursor-pointer">
                  <AvatarFallback className="bg-primary text-[10px] text-primary-foreground">
                    {user?.display_name?.charAt(0)?.toUpperCase() || <User className="h-3 w-3" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium">{user?.display_name || "用户"}</p>
                <p className="text-[11px] text-muted-foreground">{user?.email || ""}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/profile"; }} className="cursor-pointer text-xs">
                <User className="mr-2 h-3.5 w-3.5" /> 个人信息
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/settings"; }} className="cursor-pointer text-xs">
                <Settings className="mr-2 h-3.5 w-3.5" /> 设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={loggingOut} className="cursor-pointer text-xs text-destructive">
                <LogOut className="mr-2 h-3.5 w-3.5" /> {loggingOut ? "退出中..." : "退出登录"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-2 md:hidden">
          <div className="flex flex-col gap-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
              return (
                <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}
                  className={`inline-flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium no-underline ${
                    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}>
                  {item.icon} {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
