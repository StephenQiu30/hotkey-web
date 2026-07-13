"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layers, Sparkles, BarChart3, Radio } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    title: "多平台热点追踪",
    description: "实时监控微博、知乎、B站、小红书等主流平台热点趋势变化。",
    icon: Layers,
  },
  {
    title: "AI 内容选题",
    description: "AI 智能分析热点关联话题，评估创作价值和流量潜力。",
    icon: Sparkles,
  },
  {
    title: "数据趋势报告",
    description: "自动生成可视化趋势报告，支持日/周维度，热点评分一目了然。",
    icon: BarChart3,
  },
  {
    title: "7×24 实时监控",
    description: "自定义关键词和监控范围，全天候持续追踪热点动态。",
    icon: Radio,
  },
];

export default function WelcomeFeatures() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".wf-card", {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out",
      scrollTrigger: { trigger: "#features", start: "top 80%" },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} id="features" className="border-t border-border/50 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <span className="section-eyebrow">Features</span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            强大功能，<span className="text-primary">简单交付</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            为内容创作者量身打造的全链路热点工具
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="wf-card card-border rounded-lg border border-border bg-card p-5"
              >
                <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded border border-border bg-black/40">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold tracking-tight">{f.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">{f.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
