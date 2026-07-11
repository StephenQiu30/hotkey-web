"use client";

export default function WelcomeCTA() {
  return (
    <section
      style={{
        padding: "100px 24px",
        borderTop: "1px solid #eaeaea",
      }}
    >
      <div
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
            padding: "12px 32px",
            background: "#111",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 15,
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
          免费开始使用
        </a>
      </div>
    </section>
  );
}
