"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function WelcomeCTA() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".wc-content", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
      },
    });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden border-t border-border/50 px-6 py-28 sm:py-36"
    >
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />

      {/* Decorative blurs */}
      <div className="deco-blur left-1/4 top-0 h-64 w-64" />
      <div className="deco-blur-sm bottom-0 right-1/3 h-48 w-48" />

      {/* Glass card container */}
      <div className="wc-content relative mx-auto max-w-xl rounded-2xl border border-border/40 bg-card/60 p-10 sm:p-14 text-center backdrop-blur-xl shadow-elevated">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/5 px-4 py-1.5 text-sm text-primary animate-glow">
          <Sparkles className="h-3.5 w-3.5" />
          完全免费，即刻开始
        </div>

        <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          准备好开始创作了吗？
        </h2>

        <p className="mb-10 text-lg leading-relaxed text-muted-foreground">
          免费注册，即刻体验热点追踪、选题推荐与数据洞察
        </p>

        <a href="/register">
          <Button
            size="lg"
            className="h-14 rounded-xl px-10 text-base shadow-xl shadow-primary/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,122,255,0.3)] hover:scale-[1.03] active:scale-[0.97]"
          >
            免费开始使用
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </div>
    </section>
  );
}
