"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Menu, Search, User, X } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/stores/authStore";

interface MenuItem { path: string; name: string; icon: React.ReactNode; }

export default function TopNav({ menuItems, title = "HotKey" }: { menuItems: MenuItem[]; title?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-black/95 backdrop-blur">
      <div className="flex h-[60px] items-center gap-5 px-5 lg:px-7">
        <Link href="/dashboard" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-foreground no-underline">
          <BrandLogo title={title} />
        </Link>
        <nav className="hidden h-full items-center md:flex">
          {menuItems.map((item) => {
            const active = pathname === item.path || (item.path !== "/dashboard" && pathname.startsWith(item.path));
            return <Link key={item.path} href={item.path} className={`relative flex h-full items-center gap-1.5 px-4 text-xs no-underline transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {item.icon}{item.name}{active && <span className="absolute inset-x-4 bottom-0 h-0.5 bg-foreground" />}
            </Link>;
          })}
        </nav>
        <div className="ml-auto hidden w-full max-w-[330px] items-center md:flex">
          <div className="flex h-8 w-full items-center gap-2 rounded-md border border-border bg-[#080808] px-3 text-xs text-muted-foreground">
            <Search className="h-3.5 w-3.5" /><span className="truncate">搜索事件、来源或报告</span><kbd className="ml-auto mono text-[10px]">⌘ K</kbd>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen((value) => !value)} className="ml-auto h-8 w-8 md:hidden" aria-label="切换导航">
          {mobileOpen ? <X /> : <Menu />}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 text-xs text-muted-foreground outline-none hover:text-foreground">
              <Avatar className="h-7 w-7"><AvatarFallback className="bg-foreground text-[10px] text-background">{user?.display_name?.slice(0, 1)?.toUpperCase() || <User className="h-3 w-3" />}</AvatarFallback></Avatar>
              <span className="hidden max-w-24 truncate lg:block">{user?.display_name || "账户"}</span><ChevronDown className="hidden h-3 w-3 lg:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-2"><p className="truncate text-xs font-medium">{user?.display_name || "账户"}</p><p className="truncate text-[11px] text-muted-foreground">{user?.email}</p></div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/profile"; }}><User className="mr-2 h-3.5 w-3.5" />账户信息</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive"><LogOut className="mr-2 h-3.5 w-3.5" />退出登录</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {mobileOpen && <nav className="border-t border-border px-3 py-2 md:hidden">{menuItems.map((item) => <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground no-underline hover:bg-secondary hover:text-foreground">{item.icon}{item.name}</Link>)}</nav>}
    </header>
  );
}
