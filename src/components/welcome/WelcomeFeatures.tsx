"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const features = [
  {
    title: "多平台热点追踪",
    description: "实时监控微博、知乎、B站、小红书等主流平台热点趋势变化，聚合全网热门内容。",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 7L12 12L22 7L12 2Z"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M2 17L12 22L22 17"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M2 12L12 17L22 12"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "AI 内容选题",
    description: "AI 智能分析热点关联话题，评估创作价值和流量潜力，推荐最优内容方向。",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" stroke="#111" strokeWidth="1.5" />
        <path
          d="M12 8V2"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12 22V16"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 12H22"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M2 12H8"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "数据趋势报告",
    description: "自动生成可视化趋势报告，支持日/周维度，热点评分和关联分析一目了然。",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="13"
          width="4"
          height="8"
          rx="1"
          stroke="#111"
          strokeWidth="1.5"
        />
        <rect
          x="10"
          y="9"
          width="4"
          height="12"
          rx="1"
          stroke="#111"
          strokeWidth="1.5"
        />
        <rect
          x="17"
          y="5"
          width="4"
          height="16"
          rx="1"
          stroke="#111"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    title: "7×24 实时监控",
    description: "自定义关键词和监控范围，全天候持续追踪，第一时间发现与您相关的热点动态。",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#111" strokeWidth="1.5" />
        <path
          d="M12 7V12L15 15"
          stroke="#111"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function WelcomeFeatures() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".hf-title", { y: 24, autoAlpha: 0, duration: 0.6, ease: "power3.out" });
    gsap.from(".hf-card", {
      y: 40,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.15,
      delay: 0.25,
      ease: "power3.out",
    });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      id="features"
      style={{
        padding: "140px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <div className="hf-title" style={{ textAlign: "center", marginBottom: 80 }}>
          <h2
            style={{
              fontSize: 36,
              fontWeight: 650,
              color: "#111",
              margin: "0 0 16px",
              letterSpacing: "-0.03em",
            }}
          >
            强大功能，简单交付
          </h2>
          <p
            style={{
              fontSize: 16,
              color: "#666",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            为内容创作者量身打造的全链路热点工具
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 2,
            background: "#eaeaea",
            border: "1px solid #eaeaea",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              className="hf-card"
              style={{
                background: "#fff",
                padding: 48,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: "1px solid #eaeaea",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "#666",
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
