"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function WelcomeFooter() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".hf-inner", { y: 16, autoAlpha: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
  }, { scope: containerRef });

  return (
    <footer
      ref={containerRef}
      className="hf-inner"
      style={{
        borderTop: "1px solid #eaeaea",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 13,
          color: "#999",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>© {new Date().getFullYear()} HotKey. All rights reserved.</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a
            href="mailto:support@hotkey.dev"
            style={{ color: "#999", textDecoration: "none" }}
          >
            联系我们
          </a>
          <a
            href="#"
            style={{ color: "#999", textDecoration: "none" }}
            onClick={(e) => e.preventDefault()}
          >
            隐私政策
          </a>
          <a
            href="#"
            style={{ color: "#999", textDecoration: "none" }}
            onClick={(e) => e.preventDefault()}
          >
            服务条款
          </a>
        </div>
      </div>
    </footer>
  );
}
