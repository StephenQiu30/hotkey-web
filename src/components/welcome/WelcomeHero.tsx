"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function WelcomeHero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".wh-line", { y: 30, opacity: 0, duration: 0.7 })
      .from(".wh-sub", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".wh-actions", { y: 20, opacity: 0, duration: 0.5 }, "-=0.2")
      .from(".wh-preview", { y: 40, opacity: 0, duration: 0.8, scale: 0.97 }, "-=0.1");
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative overflow-hidden px-4 pt-24 pb-20 sm:pt-32 sm:pb-28">
      {/* Decorative blur */}
      <div className="deco-blur left-1/3 top-0 h-96 w-96" />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Headline */}
        <h1 className="wh-line mb-3 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl">
          把握热点脉搏，
          <br />
          <span className="text-primary">创作爆款内容</span>
        </h1>

        {/* Sub */}
        <p className="wh-sub mx-auto mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          一站式热点追踪平台。实时监控微博、知乎、B站多渠道趋势，
          AI 智能分析推荐选题，让每一篇内容都踩在流量风口上。
        </p>

        {/* CTA */}
        <div className="wh-actions mb-14 flex items-center justify-center gap-3">
          <a href="/register">
            <Button className="h-9 rounded-md px-5 text-sm shadow-button">
              免费开始使用
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </a>
          <a href="#features">
            <Button variant="outline" className="h-9 rounded-md border-border px-5 text-sm">
              了解更多
            </Button>
          </a>
        </div>

        {/* Product Preview */}
        <div className="wh-preview mx-auto max-w-2xl">
          <div className="rounded-lg border border-border bg-card shadow-elevated">
            {/* Mockup top bar */}
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="text-xs font-medium text-muted-foreground">热点监控仪表盘</span>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  {["#007AFF", "#34C759", "#FF9500", "#FF3B30"].map((c) => (
                    <div key={c} className="h-3 w-3 rounded-full border border-black/20" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Mockup content */}
            <div className="p-4">
              <div className="mb-3 grid grid-cols-4 gap-2">
                {["实时热点", "高相关", "趋势上升", "待处理"].map((label, i) => (
                  <div key={label} className="rounded border border-border/60 bg-black/40 p-2.5 text-left">
                    <p className="mb-0.5 text-[10px] text-muted-foreground">{label}</p>
                    <p className="stat-value text-sm text-foreground">
                      {["247", "183", "42", "12"][i]}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                {["AI 大模型突破上下文窗口限制", "短视频平台调整算法推荐机制", "跨平台热点迁移趋势分析"].map((t) => (
                  <div key={t} className="flex items-center gap-2 rounded border border-border/30 bg-black/20 px-3 py-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="truncate text-xs text-muted-foreground">{t}</span>
                    <span className="stat-value ml-auto text-[11px] text-muted-foreground">
                      {Math.floor(Math.random() * 50 + 50)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
