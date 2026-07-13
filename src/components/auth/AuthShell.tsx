"use client";

import { Flame } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />
      {/* Decorative blurs */}
      <div className="deco-blur right-0 top-0 h-[350px] w-[350px]" />
      <div className="deco-blur-sm bottom-0 left-0 h-[200px] w-[200px]" />

      <div className="relative w-full max-w-sm rounded-2xl border border-border/50 bg-white/70 p-8 backdrop-blur-xl shadow-elevated">
        {/* Logo */}
        <div className="mb-6 text-center">
          <a
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-foreground no-underline"
          >
            <Flame className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">HotKey</span>
          </a>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}
