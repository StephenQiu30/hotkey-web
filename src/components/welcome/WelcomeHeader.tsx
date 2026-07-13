"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";

export default function WelcomeHeader() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".wh-header-inner", {
      y: -20,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  return (
    <header
      ref={containerRef}
      className="sticky top-0 z-50 border-b border-border/50 bg-white/70 backdrop-blur-xl"
    >
      <div className="wh-header-inner mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <a
          href="/"
          className="flex items-center gap-2 text-foreground no-underline"
        >
          <Flame className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold tracking-tight">HotKey</span>
        </a>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <a
            href="#features"
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            功能
          </a>
          <a
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            登录
          </a>
          <div className="ml-2">
            <a href="/register">
              <Button size="sm" className="rounded-lg">
                开始使用
              </Button>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
