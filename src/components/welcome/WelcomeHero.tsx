"use client";

export default function WelcomeHero() {
  return (
    <section
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
