const features = [
  {
    title: "热点趋势追踪",
    description: "实时追踪微博、知乎、B站等多渠道热点趋势变化，不错过每一个流量风口",
    icon: "📊",
  },
  {
    title: "智能内容选题",
    description: "AI 智能分析热点关联话题，推荐最具创作价值的内容方向",
    icon: "🎯",
  },
  {
    title: "实时数据报告",
    description: "自动生成热点趋势报告，可视化数据洞察，支持日报和周报一键导出",
    icon: "📈",
  },
  {
    title: "多平台监控",
    description: "自定义监控关键词和平台，7×24 小时持续追踪，第一时间发现热点",
    icon: "🔍",
  },
];

export default function WelcomeFeatures() {
  return (
    <section
      id="features"
      style={{
        padding: "80px 24px",
        background: "#f8f9fa",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: 32,
            fontWeight: 600,
            color: "#1a1a1a",
            margin: "0 0 12px",
          }}
        >
          核心功能
        </h2>
        <p
          style={{
            textAlign: "center",
            fontSize: 16,
            color: "#666",
            margin: "0 0 48px",
          }}
        >
          为内容创作者打造的全链路热点工具
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 32,
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#1a1a1a",
                  margin: "0 0 8px",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#666",
                  margin: 0,
                }}
              >
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
