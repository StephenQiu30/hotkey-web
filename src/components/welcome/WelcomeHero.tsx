"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WelcomeHero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".wh-badge", { y: -20, opacity: 0, duration: 0.6 })
      .from(".wh-title", { y: 40, opacity: 0, duration: 0.8 }, "-=0.2")
      .from(".wh-subtitle", { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
      .from(".wh-cta-group", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".wh-stats", { y: 16, opacity: 0, duration: 0.5 }, "-=0.2");
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden px-6 pt-32 pb-24 sm:pt-40 sm:pb-32"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-secondary/30" />

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Eyebrow badge */}
        <div className="wh-badge mb-10 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-5 py-1.5 text-sm text-muted-foreground backdrop-blur-md">
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
        <p className="wh-subtitle mx-auto mb-12 max-w-xl text-balance text-lg leading-relaxed text-muted-foreground sm:text-xl">
          一站式热点追踪平台，实时监控微博、知乎、B站等多渠道趋势，
          AI 智能分析推荐选题，让每一篇内容都踩在流量风口上。
        </p>

        {/* CTA Buttons */}
        <div className="wh-cta-group mb-16 flex flex-wrap items-center justify-center gap-4">
          <a href="/register">
            <Button size="lg" className="h-12 rounded-xl px-8 text-base shadow-lg shadow-primary/20">
              免费开始使用
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </a>
          <a href="#features">
            <Button
              variant="outline"
              size="lg"
              className="h-12 rounded-xl border-border bg-white/60 px-8 text-base backdrop-blur-sm"
            >
              了解更多
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="wh-stats mx-auto flex max-w-lg items-center justify-center gap-12 sm:gap-16">
          {[
            { value: "10+", label: "平台覆盖" },
            { value: "99%", label: "准确率" },
            { value: "实时", label: "数据更新" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
