"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  Settings2,
  User,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { UserRole } from "@/lib/domainEnums";

interface MenuItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

function isActivePath(pathname: string, path: string) {
  return path === "/dashboard"
    ? pathname === path
    : pathname === path || pathname.startsWith(`${path}/`);
}

export default function TopNav({
  menuItems,
  adminMenuItems = [],
  title = "HotKey",
  alertCount = 0,
}: {
  menuItems: MenuItem[];
  adminMenuItems?: MenuItem[];
  title?: string;
  alertCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [query, setQuery] = useState("");
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const canManage =
    user?.role === UserRole.Admin || user?.role === UserRole.Editor;

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = query.trim();
    router.push(
      normalized
        ? `/dashboard/events?q=${encodeURIComponent(normalized)}`
        : "/dashboard/events",
    );
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header
      data-top-nav
      className="sticky top-0 z-50 border-b border-border/90 bg-white/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[72px] max-w-[1536px] min-w-0 items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center text-base font-bold tracking-[-.025em] text-slate-950 no-underline"
        >
          <BrandLogo title={title} markClassName="h-5 w-5" />
        </Link>

        <div className="hidden h-9 shrink-0 items-center gap-2 rounded-lg border border-border bg-white px-3 text-xs font-medium text-slate-700 xl:flex">
          <BriefcaseBusiness className="h-4 w-4 text-slate-500" />
          <span>演示工作区</span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>

        <NavigationMenu
          aria-label="主导航"
          className="hidden h-full max-w-none flex-none justify-start lg:flex"
        >
          <NavigationMenuList className="h-full gap-1">
            {menuItems.map((item) => {
              const active = isActivePath(pathname, item.path);
              return (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuLink asChild active={active}>
                    <Link
                      href={item.path}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-[72px] items-center px-3 text-sm font-medium text-slate-600 no-underline transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset",
                        active && "text-blue-700",
                      )}
                    >
                      <span className="hidden">{item.icon}</span>
                      {item.name}
                      {active ? (
                        <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-blue-600" />
                      ) : null}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <form
          role="search"
          onSubmit={handleSearch}
          className="ml-auto hidden h-10 min-w-0 flex-1 items-center rounded-lg border border-border bg-slate-50/80 px-3 transition-colors focus-within:border-blue-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 md:flex md:max-w-[320px]"
        >
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="search"
            aria-label="搜索事件或监控"
            placeholder="搜索事件或监控"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-full min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </form>

        <Link
          href="/dashboard/alerts"
          aria-label={
            alertCount > 0 ? `告警，${alertCount} 条待处理` : "告警"
          }
          className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 no-underline transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <Bell className="h-[18px] w-[18px]" />
          {alertCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-blue-600" />
          ) : null}
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((value) => !value)}
          className="h-9 w-9 shrink-0 lg:hidden"
          aria-label="切换导航"
        >
          {mobileOpen ? <X /> : <Menu />}
        </Button>

        <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
          <DropdownMenuTrigger
            aria-label="账户菜单"
            data-nav-menu-trigger="account"
            onClick={() => setAccountOpen((value) => !value)}
            className="inline-flex h-9 items-center gap-1.5 rounded-full p-0.5 text-xs text-slate-600 outline-none transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-600 data-[state=open]:bg-slate-100"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-50 text-[11px] font-semibold text-blue-700">
                {user?.display_name?.slice(0, 1)?.toUpperCase() || (
                  <User className="h-3.5 w-3.5" />
                )}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="hidden h-3.5 w-3.5 sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium text-slate-900">
                {user?.display_name || "账户"}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                账户信息
              </Link>
            </DropdownMenuItem>
            {canManage && adminMenuItems.length > 0 ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[11px] font-medium text-muted-foreground">
                  工作区管理
                </DropdownMenuLabel>
                {adminMenuItems.map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <Link href={item.path}>
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mobileOpen ? (
        <nav
          aria-label="折叠导航"
          className="border-t border-border bg-white px-4 py-3 lg:hidden"
        >
          <form role="search" onSubmit={handleSearch} className="mb-2 flex gap-2 md:hidden">
            <input
              type="search"
              aria-label="移动端搜索事件或监控"
              placeholder="搜索事件或监控"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-slate-50 px-3 text-sm outline-none focus:border-blue-300"
            />
            <Button type="submit" size="icon" aria-label="搜索">
              <Search />
            </Button>
          </form>
          {menuItems.map((item) => {
            const active = isActivePath(pathname, item.path);
            return (
              <Link
                key={item.path}
                href={item.path}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 no-underline hover:bg-blue-50 hover:text-blue-700",
                  active && "bg-blue-50 text-blue-700",
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
          {canManage ? (
            <Link
              href="/dashboard/sources"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-3 border-t border-border px-3 pt-4 text-sm text-slate-600 no-underline"
            >
              <Settings2 className="h-4 w-4" />
              工作区管理
            </Link>
          ) : null}
        </nav>
      ) : null}
    </header>
  );
}
