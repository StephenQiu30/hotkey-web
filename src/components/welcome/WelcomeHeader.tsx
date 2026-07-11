"use client";

import { FireOutlined } from "@ant-design/icons";

export default function WelcomeHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
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
          padding: "0 24px",
          height: 56,
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <FireOutlined style={{ fontSize: 20, color: "#1677FF" }} />
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>
            HotKey
          </span>
        </a>

        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a
            href="#features"
            style={{
              padding: "8px 16px",
              color: "#666",
              textDecoration: "none",
              fontSize: 14,
              borderRadius: 6,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#666";
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
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f5f5f5";
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#666";
            }}
          >
            登录
          </a>
          <a
            href="/login"
            style={{
              marginLeft: 8,
              padding: "8px 20px",
              background: "#111",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#000";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#111";
            }}
          >
            开始使用
          </a>
        </nav>
      </div>
    </header>
  );
}
