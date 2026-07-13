"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Menu, X, User, LogOut, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/authStore";

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
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

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    window.location.href = "/login";
  };

  const handleProfile = () => {
    window.location.href = "/dashboard/profile";
  };

  // User info from auth store
  const user = useAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-foreground no-underline"
          >
            <Flame className="h-5 w-5 text-primary" />
            <span className="text-base font-semibold tracking-tight">{title}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {menuItems.map((item) => {
              const isActive = pathname === item.path ||
                (item.path !== "/dashboard" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium no-underline transition-all duration-200 ${
                    isActive
                      ? "bg-secondary text-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: User Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* User avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="outline-none">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {user?.display_name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-foreground">
                  {user?.display_name || "用户"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                个人信息
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/settings"; }} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                disabled={loggingOut}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loggingOut ? "退出中..." : "退出登录"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav className="border-t border-border/50 bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path ||
                (item.path !== "/dashboard" && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium no-underline transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
