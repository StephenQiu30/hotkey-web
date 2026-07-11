"use client";

import { useState, useEffect } from "react";
import { Tag, Typography, Spin, Empty, Alert, Space } from "antd";
import { ProCard } from "@ant-design/pro-components";
import { FileTextOutlined } from "@ant-design/icons";
import { listMonitors } from "@/services/monitors";
import { listTopics } from "@/services/topics";

const { Title, Text, Paragraph } = Typography;

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
          setTopics(allTopics.sort((a, b) => (b.current_heat ?? 0) - (a.current_heat ?? 0)));
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTopics();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <ProCard title={<><FileTextOutlined style={{ marginRight: 8 }} />内容选题</>}>
        <Alert message="加载失败" description={error} type="error" showIcon />
      </ProCard>
    );
  }

  if (loading) {
    return (
      <ProCard title={<><FileTextOutlined style={{ marginRight: 8 }} />内容选题</>}>
        <div style={{ textAlign: "center", padding: 60 }}>
          <Spin size="large" />
        </div>
      </ProCard>
    );
  }

  return (
    <ProCard
      title={
        <>
          <FileTextOutlined style={{ marginRight: 8 }} />
          内容选题
        </>
      }
    >
      {topics.length === 0 ? (
        <Empty description="暂无选题数据，请先在设置中创建监控并等待数据采集" />
      ) : (
        <ProCard.Group gutter={[16, 16]}>
          {topics.map((topic) => (
            <ProCard
              key={topic.id}
              colSpan={{ xs: 24, sm: 12, lg: 8 }}
              size="small"
              hoverable
            >
              <Title level={5} style={{ fontSize: 14, marginTop: 0 }}>
                {topic.title}
              </Title>
              <Paragraph
                type="secondary"
                style={{ fontSize: 12, marginBottom: 8 }}
                ellipsis={{ rows: 2 }}
              >
                {topic.summary}
              </Paragraph>
              <Space size={4}>
                <Tag
                  color={
                    topic.trend_direction === "up"
                      ? "red"
                      : topic.trend_direction === "down"
                        ? "green"
                        : "default"
                  }
                  style={{ fontSize: 11 }}
                >
                  {topic.trend_direction === "up"
                    ? "↑ 上升"
                    : topic.trend_direction === "down"
                      ? "↓ 下降"
                      : "→ 平稳"}
                </Tag>
                <Tag color="blue" style={{ fontSize: 11 }}>
                  热度 {Math.round(topic.current_heat ?? 0)}
                </Tag>
                <Tag color="default" style={{ fontSize: 11 }}>
                  {(topic.post_count ?? 0)} 篇
                </Tag>
              </Space>
            </ProCard>
          ))}
        </ProCard.Group>
      )}
    </ProCard>
  );
}
