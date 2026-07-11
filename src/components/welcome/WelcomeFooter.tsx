"use client";

export default function WelcomeFooter() {
  return (
    <footer
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
