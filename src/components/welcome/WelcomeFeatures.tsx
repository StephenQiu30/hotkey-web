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
    description:
      "实时监控微博、知乎、B站、小红书等主流平台热点趋势变化，聚合全网热门内容。",
    icon: Layers,
  },
  {
    title: "AI 内容选题",
    description:
      "AI 智能分析热点关联话题，评估创作价值和流量潜力，推荐最优内容方向。",
    icon: Sparkles,
  },
  {
    title: "数据趋势报告",
    description:
      "自动生成可视化趋势报告，支持日/周维度，热点评分和关联分析一目了然。",
    icon: BarChart3,
  },
  {
    title: "7×24 实时监控",
    description:
      "自定义关键词和监控范围，全天候持续追踪，第一时间发现与您相关的热点动态。",
    icon: Radio,
  },
];

export default function WelcomeFeatures() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".wf-title", {
      y: 24,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#features",
        start: "top 80%",
      },
    });

    gsap.from(".wf-card", {
      y: 40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: "power3.out",
      scrollTrigger: {
        trigger: "#features",
        start: "top 75%",
      },
    });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      id="features"
      className="relative px-6 py-32 sm:py-40"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 bg-secondary/20" />

      <div className="relative mx-auto max-w-5xl">
        {/* Section header */}
        <div className="wf-title mb-20 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            强大功能，<span className="text-primary">简单交付</span>
          </h2>
          <p className="mx-auto max-w-lg text-lg text-muted-foreground">
            为内容创作者量身打造的全链路热点工具
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article
                key={feature.title}
                className="wf-card group rounded-2xl border border-border/60 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-3 text-lg font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
