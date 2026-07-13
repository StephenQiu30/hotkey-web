"use client";

import { Flame } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="deco-blur left-0 top-0 h-[400px] w-[400px]" />
      <div className="deco-blur bottom-0 right-0 h-[300px] w-[300px]" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <a href="/" className="mb-4 inline-flex items-center gap-1.5 text-foreground no-underline">
            <Flame className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold tracking-tight">HotKey</span>
          </a>
          <h1 className="mt-4 text-lg font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-card">
          {children}
        </div>
      </div>
    </div>
  );
}
