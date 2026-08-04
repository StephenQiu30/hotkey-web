"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FileSearch, LogOut, Menu, Settings2, User, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/lib/domainEnums";

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

export default function TopNav({
  menuItems,
  adminMenuItems = [],
  title = "HotKey",
}: {
  menuItems: MenuItem[];
  adminMenuItems?: MenuItem[];
  title?: string;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const canManage = user?.role === UserRole.Admin || user?.role === UserRole.Editor;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header data-top-nav className="sticky top-0 z-50 border-b border-border bg-white/90 shadow-[0_1px_12px_rgba(30,64,104,.04)] backdrop-blur-xl">
      <div className="flex h-[68px] min-w-0 items-center gap-3 px-4 sm:gap-4 sm:px-5 lg:px-7 xl:gap-5">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center gap-2 text-sm font-bold text-foreground no-underline"
        >
          <BrandLogo title={title} markClassName="h-5 w-5" />
        </Link>
        <nav
          aria-label="主导航"
          className="hidden h-full shrink-0 items-center xl:flex"
        >
          {menuItems.map((item) => {
            const active =
              pathname === item.path ||
              (item.path !== "/dashboard" && pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-medium no-underline transition-colors 2xl:px-4 ${active ? "bg-blue-50 text-blue-700" : "text-muted-foreground hover:bg-slate-50 hover:text-foreground"}`}
              >
                {item.icon}
                {item.name}
                {active && (
                  <span className="absolute inset-x-3 -bottom-[16px] h-0.5 rounded-full bg-blue-600" />
                )}
              </Link>
            );
          })}
        </nav>
        {canManage && adminMenuItems.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="管理"
                className="hidden h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-slate-50 hover:text-foreground xl:flex"
              >
                <Settings2 className="h-3.5 w-3.5" />
                管理
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              {adminMenuItems.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link href={item.path} className="text-xs no-underline">
                    {item.icon}
                    {item.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
        <Link
          href="/dashboard/contents"
          aria-label="查看采集数据"
          className="ml-auto hidden h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-slate-50 px-3 text-xs text-muted-foreground no-underline transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 md:flex md:max-w-[220px]"
        >
          <FileSearch className="h-3.5 w-3.5" />
          <span className="truncate">查看采集数据</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((value) => !value)}
          className="ml-auto h-8 w-8 shrink-0 xl:hidden"
          aria-label="切换导航"
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 text-xs text-muted-foreground outline-none hover:text-foreground">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-blue-100 text-[10px] font-semibold text-blue-700">
                  {user?.display_name?.slice(0, 1)?.toUpperCase() || (
                    <User className="h-3 w-3" />
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 truncate 2xl:block">
                {user?.display_name || "账户"}
              </span>
              <ChevronDown className="hidden h-3 w-3 2xl:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-2">
              <p className="truncate text-xs font-medium">
                {user?.display_name || "账户"}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/dashboard/profile";
              }}
            >
              <User className="mr-2 h-3.5 w-3.5" />
              账户信息
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive"
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {mobileOpen && (
        <nav
          aria-label="折叠导航"
          className="border-t border-border bg-white px-3 py-2 xl:hidden"
        >
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-muted-foreground no-underline hover:bg-blue-50 hover:text-blue-700"
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          {canManage && adminMenuItems.length > 0 ? (
            <div className="mt-1 border-t border-border pt-1">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.08em] text-muted-foreground">管理</p>
              {adminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-muted-foreground no-underline hover:bg-blue-50 hover:text-blue-700"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>
          ) : null}
        </nav>
      )}
    </header>
  );
}
