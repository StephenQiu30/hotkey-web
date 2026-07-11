"use client";

import { useState, useEffect } from "react";
import { Tag, Typography, Spin, Empty, Alert, Space, Button } from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { listMonitors } from "@/services/monitors";
import { listTopics } from "@/services/topics";

const { Text, Paragraph } = Typography;

export default function TopicsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<HotKeyAPI.TopicSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function fetchTopics() {
      setLoading(true);
      setError(null);
      try {
        const monitorsRes = await listMonitors();
        const monitors = monitorsRes.data ?? [];
        const allTopics: HotKeyAPI.TopicSummary[] = [];

        for (const m of monitors) {
          if (m.id == null) continue;
          const topicsRes = await listTopics({ id: m.id });
          allTopics.push(...(topicsRes.data ?? []));
        }
        if (!cancelled) {
          setTopics(
            allTopics.sort(
              (a, b) => (b.current_heat ?? 0) - (a.current_heat ?? 0),
            ),
          );
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTopics();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div style={{ border: "1px solid #eaeaea", borderRadius: 8, padding: 24 }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => window.location.reload()}>重试</Button>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ border: "1px solid #eaeaea", borderRadius: 8, padding: 60, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: "#111",
          }}
        >
          <FileTextOutlined style={{ fontSize: 16, color: "#888" }} />
          内容选题
        </div>
      </div>

      {topics.length === 0 ? (
        <div
          style={{
            border: "1px solid #eaeaea",
            borderRadius: 8,
            padding: 60,
            textAlign: "center",
          }}
        >
          <Empty description="暂无选题数据，请先在设置中创建监控并等待数据采集" />
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 12,
          }}
        >
          {topics.map((topic) => (
            <div
              key={topic.id}
              style={{
                padding: 24,
                border: "1px solid #eaeaea",
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.4,
                }}
              >
                {topic.title}
              </div>
              <Paragraph
                style={{
                  fontSize: 13,
                  color: "#666",
                  margin: 0,
                  lineHeight: 1.6,
                }}
                ellipsis={{ rows: 2 }}
              >
                {topic.summary}
              </Paragraph>
              <Space size={6}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    color:
                      topic.trend_direction === "up"
                        ? "#cf1322"
                        : topic.trend_direction === "down"
                          ? "#389e0d"
                          : "#666",
                    background:
                      topic.trend_direction === "up"
                        ? "#fff1f0"
                        : topic.trend_direction === "down"
                          ? "#f6ffed"
                          : "#f5f5f5",
                    fontWeight: 500,
                  }}
                >
                  {topic.trend_direction === "up"
                    ? "↑ 上升"
                    : topic.trend_direction === "down"
                      ? "↓ 下降"
                      : "→ 平稳"}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "#666",
                    background: "#f5f5f5",
                    fontWeight: 500,
                  }}
                >
                  热度 {Math.round(topic.current_heat ?? 0)}
                </span>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: 4,
                    fontSize: 12,
                    color: "#666",
                    background: "#f5f5f5",
                    fontWeight: 500,
                  }}
                >
                  {(topic.post_count ?? 0)} 篇
                </span>
              </Space>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
