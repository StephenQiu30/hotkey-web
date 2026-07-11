"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function WelcomeHero() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".hh-badge", { y: -16, autoAlpha: 0, duration: 0.5, delay: 0.15, ease: "power2.out" });
    gsap.from(".hh-title", { y: 30, autoAlpha: 0, duration: 0.6, delay: 0.3, ease: "power2.out" });
    gsap.from(".hh-desc", { y: 20, autoAlpha: 0, duration: 0.5, delay: 0.5, ease: "power2.out" });
    gsap.from(".hh-btn", { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.1, delay: 0.65, ease: "power2.out" });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      style={{
        padding: "120px 24px 80px",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        {/* Eyebrow badge */}
        <div
          className="hh-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 14px",
            border: "1px solid #eaeaea",
            borderRadius: 100,
            fontSize: 13,
            color: "#666",
            marginBottom: 32,
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--ant-color-primary)",
            }}
          />
          内容创作者热点平台
        </div>

        <h1
          className="hh-title"
          style={{
            fontSize: 56,
            fontWeight: 650,
            lineHeight: 1.1,
            color: "#111",
            margin: "0 0 24px",
            letterSpacing: "-0.03em",
          }}
        >
          把握热点脉搏
          <br />
          创作爆款内容
        </h1>

        <p
          className="hh-desc"
          style={{
            fontSize: 18,
            lineHeight: 1.7,
            color: "#666",
            margin: "0 auto 40px",
            maxWidth: 560,
          }}
        >
          一站式热点追踪平台，实时监控微博、知乎、B站等多渠道趋势，
          AI 智能分析推荐选题，让每一篇内容都踩在流量风口上。
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <a
            href="/login"
            className="hh-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 28px",
              background: "var(--ant-color-primary)",
              color: "#fff",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "-0.01em",
            }}
          >
            免费开始使用
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              style={{ marginLeft: 6 }}
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="#features"
            className="hh-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 28px",
              border: "1px solid #eaeaea",
              color: "#444",
              borderRadius: 8,
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 500,
            }}
          >
            了解更多
          </a>
        </div>
      </div>
    </section>
  );
}
