import Link from "next/link";
import { FireOutlined } from "@ant-design/icons";

export default function WelcomeHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 48px",
        maxWidth: 1200,
        margin: "0 auto",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FireOutlined style={{ fontSize: 24, color: "#1677FF" }} />
        <span style={{ fontSize: 18, fontWeight: 600, color: "#1a1a1a" }}>
          HotKey
        </span>
      </div>
      <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <Link
          href="/login"
          style={{ color: "#666", textDecoration: "none", fontSize: 14 }}
        >
          登录
        </Link>
        <Link
          href="/login"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "8px 20px",
            background: "#1677FF",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          开始使用 →
        </Link>
      </nav>
    </header>
  );
}
