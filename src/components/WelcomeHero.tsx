import Link from "next/link";

export default function WelcomeHero() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "80px 24px 60px",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <h1
        style={{
          fontSize: 48,
          fontWeight: 700,
          lineHeight: 1.2,
          color: "#1a1a1a",
          margin: "0 0 20px",
          letterSpacing: "-0.02em",
        }}
      >
        热点监控 · 内容创作 · 数据洞察
      </h1>
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.6,
          color: "#666",
          margin: "0 auto 40px",
          maxWidth: 600,
        }}
      >
        一站式热点追踪平台，助力内容创作者把握流量脉搏，做出爆款内容
      </p>
      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 32px",
            background: "#1677FF",
            color: "#fff",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          立即开始
        </Link>
        <a
          href="#features"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 32px",
            background: "#f5f5f5",
            color: "#333",
            borderRadius: 8,
            textDecoration: "none",
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          了解更多 →
        </a>
      </div>
    </section>
  );
}
