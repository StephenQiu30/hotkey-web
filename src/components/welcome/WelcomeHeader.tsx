"use client";

import { Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/ThemeToggle";

export default function WelcomeHeader() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex h-12 max-w-5xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-1.5 text-foreground no-underline">
          <Flame className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold tracking-tight">HotKey</span>
        </a>
        <nav className="flex items-center gap-1">
          <ThemeToggle />
          <a href="/login" className="rounded-md px-3 py-1.5 text-xs text-muted-foreground no-underline transition-colors hover:text-foreground">
            登录
          </a>
          <a href="/register">
            <Button size="sm" className="h-7 rounded-md px-3 text-xs font-medium">
              开始使用
            </Button>
          </a>
        </nav>
      </div>
    </header>
  );
}
