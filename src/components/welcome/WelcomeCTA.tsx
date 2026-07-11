"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function WelcomeCTA() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".hc-content", { y: 30, autoAlpha: 0, duration: 0.8, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      style={{
        padding: "140px 24px",
        borderTop: "1px solid #eaeaea",
      }}
    >
      <div
        className="hc-content"
        style={{
          maxWidth: 640,
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: 36,
            fontWeight: 650,
            color: "#111",
            margin: "0 0 16px",
            letterSpacing: "-0.03em",
          }}
        >
          准备好开始创作了吗？
        </h2>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "#666",
            margin: "0 0 40px",
          }}
        >
          免费注册，即刻体验热点追踪、选题推荐与数据洞察
        </p>
        <a
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "14px 36px",
            background: "var(--ant-color-primary)",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          免费开始使用
        </a>
      </div>
    </section>
  );
}
