import Link from "next/link";

export default function WelcomeCTA() {
  return (
    <section
      style={{
        textAlign: "center",
        padding: "80px 24px",
        background: "linear-gradient(135deg, #1677FF 0%, #0958d9 100%)",
      }}
    >
      <h2
        style={{
          fontSize: 32,
          fontWeight: 600,
          color: "#fff",
          margin: "0 0 16px",
        }}
      >
        准备好提升你的创作效率了吗？
      </h2>
      <p
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,0.8)",
          margin: "0 0 32px",
        }}
      >
        免费使用，即刻开始追踪热点
      </p>
      <Link
        href="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "14px 40px",
          background: "#fff",
          color: "#1677FF",
          borderRadius: 8,
          textDecoration: "none",
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        免费开始使用 →
      </Link>
    </section>
  );
}
