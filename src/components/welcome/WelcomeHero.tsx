"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function WelcomeHero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".wh-badge", { y: -20, opacity: 0, duration: 0.6 })
      .from(".wh-title", { y: 40, opacity: 0, duration: 0.8 }, "-=0.2")
      .from(".wh-subtitle", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".wh-cta-group", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".wh-stats", { y: 16, opacity: 0, duration: 0.5 }, "-=0.2")
      .from(".wh-mockup", { y: 30, opacity: 0, duration: 0.7, scale: 0.95 }, "-=0.1");
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden px-6 pt-32 pb-28 sm:pt-40 sm:pb-36"
    >
      {/* Dot grid pattern */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />

      {/* Large decorative blur elements */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 600, height: 600,
          top: "-20%", left: "50%",
          transform: "translateX(-50%)",
          background: "var(--color-primary)",
          borderRadius: "50%",
          filter: "blur(120px)",
          opacity: 0.06,
        }}
      />
      <div
        className="pointer-events-none absolute"
        style={{
          width: 300, height: 300,
          bottom: "5%", right: "5%",
          background: "var(--color-primary)",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.05,
        }}
      />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Eyebrow badge */}
        <div className="wh-badge mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-5 py-1.5 text-sm text-muted-foreground backdrop-blur-md shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          内容创作者热点平台
        </div>

        {/* Main headline */}
        <h1 className="wh-title mx-auto mb-6 max-w-3xl text-balance text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
          把握热点脉搏
          <br />
          <span className="text-primary">
            创作爆款内容
          </span>
        </h1>

        {/* Subtitle */}
        <p className="wh-subtitle mx-auto mb-10 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
          一站式热点追踪平台，实时监控微博、知乎、B站等多渠道趋势，
          AI 智能分析推荐选题，让每一篇内容都踩在流量风口上。
        </p>

        {/* CTA Buttons */}
        <div className="wh-cta-group mb-14 flex flex-wrap items-center justify-center gap-4">
          <a href="/register">
            <Button
              size="lg"
              className="h-12 rounded-xl px-8 text-base shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-[0_0_24px_rgba(0,122,255,0.25)] hover:scale-[1.02] active:scale-[0.98]"
            >
              免费开始使用
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </a>
          <a href="#features">
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-border bg-background/60 px-8 text-base backdrop-blur-sm transition-all duration-300 hover:bg-background/80 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              了解更多
            </Button>
          </a>
        </div>

        {/* Stats — modern glass cards */}
        <div className="wh-stats mx-auto mb-16 inline-flex items-center gap-2 rounded-2xl border border-border/50 bg-card/60 p-2 backdrop-blur-md shadow-sm">
          {[
            { value: "10+", label: "平台覆盖" },
            { value: "99%", label: "准确率" },
            { value: "实时", label: "数据更新" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`rounded-xl px-6 py-4 text-center transition-all duration-300 hover:bg-secondary/50 ${
                i > 0 ? "border-l border-border/40" : ""
              }`}
            >
              <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-0.5 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Floating preview mockup */}
        <div className="wh-mockup mx-auto max-w-2xl">
          <div className="animate-float rounded-2xl border border-border/40 bg-card p-5 shadow-elevated">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-primary/70" />
                <div className="h-2 w-20 rounded-full bg-muted" />
              </div>
              <div className="flex gap-1.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-secondary/70 p-3">
                <div className="mb-1 h-2 w-12 rounded bg-muted-foreground/20" />
                <div className="h-5 w-16 rounded bg-primary/20" />
              </div>
              <div className="rounded-lg bg-secondary/70 p-3">
                <div className="mb-1 h-2 w-12 rounded bg-muted-foreground/20" />
                <div className="h-5 w-14 rounded bg-primary/20" />
              </div>
              <div className="rounded-lg bg-secondary/70 p-3">
                <div className="mb-1 h-2 w-12 rounded bg-muted-foreground/20" />
                <div className="h-5 w-12 rounded bg-primary/20" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-2 flex-1 rounded bg-muted" />
              <div className="h-2 w-16 rounded bg-primary/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
