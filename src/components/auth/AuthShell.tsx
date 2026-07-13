"use client";

import { Flame } from "lucide-react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-secondary/20" />

      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-white p-8 shadow-sm">
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
