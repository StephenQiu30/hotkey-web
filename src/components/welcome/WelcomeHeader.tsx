"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { FireOutlined } from "@ant-design/icons";

export default function WelcomeHeader() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".hh-logo", { y: -20, autoAlpha: 0, duration: 0.7, ease: "power3.out" });
    gsap.from(".hh-nav", { y: -20, autoAlpha: 0, duration: 0.7, delay: 0.15, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <header
      ref={containerRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid #eaeaea",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 32px",
          height: 56,
        }}
      >
        <a
          href="/"
          className="hh-logo"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <FireOutlined style={{ fontSize: 20, color: "var(--ant-color-primary)" }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>
            HotKey
          </span>
        </a>

        <nav className="hh-nav" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a
            href="#features"
            style={{
              padding: "8px 16px",
              color: "#666",
              textDecoration: "none",
              fontSize: 14,
              borderRadius: 6,
            }}
          >
            功能
          </a>
          <a
            href="/login"
            style={{
              padding: "8px 16px",
              color: "#666",
              textDecoration: "none",
              fontSize: 14,
              borderRadius: 6,
            }}
          >
            登录
          </a>
          <a
            href="/register"
            style={{
              marginLeft: 8,
              padding: "8px 20px",
              background: "var(--ant-color-primary)",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            开始使用
          </a>
        </nav>
      </div>
    </header>
  );
}
