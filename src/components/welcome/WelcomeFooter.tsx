"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function WelcomeFooter() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".wf-footer-inner", {
      y: 16,
      opacity: 0,
      duration: 0.5,
      delay: 0.2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 95%",
      },
    });
  }, { scope: containerRef });

  return (
    <footer
      ref={containerRef}
      className="border-t border-border/50 px-6 py-8"
    >
      <div className="wf-footer-inner mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} HotKey. All rights reserved.</span>
        <div className="flex gap-6">
          <a
            href="mailto:support@hotkey.dev"
            className="text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            联系我们
          </a>
          <a
            href="#"
            className="text-muted-foreground no-underline transition-colors hover:text-foreground"
            onClick={(e) => e.preventDefault()}
          >
            隐私政策
          </a>
          <a
            href="#"
            className="text-muted-foreground no-underline transition-colors hover:text-foreground"
            onClick={(e) => e.preventDefault()}
          >
            服务条款
          </a>
        </div>
      </div>
    </footer>
  );
}
