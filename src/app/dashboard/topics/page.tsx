"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Typography,
  Spin,
  Empty,
  Alert,
  Button,
  Flex,
} from "antd";
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
      <Card bordered>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={<Button onClick={() => window.location.reload()}>重试</Button>}
        />
      </Card>
    );
  }

  if (loading) {
    return (
      <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
        <Spin size="large" />
      </Card>
    );
  }

  return (
    <Flex vertical gap={16}>
      <Card bordered>
        <Flex align="center" gap={8}>
          <FileTextOutlined style={{ fontSize: 16, color: "#888" }} />
          <Text strong>内容选题</Text>
        </Flex>
      </Card>

      {topics.length === 0 ? (
        <Card bordered styles={{ body: { textAlign: "center", padding: 80 } }}>
          <Empty description="暂无选题数据，请先在设置中创建监控并等待数据采集" />
        </Card>
      ) : (
        <Flex gap={12} wrap="wrap">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              bordered
              hoverable
              size="small"
              style={{ flex: "1 1 300px" }}
            >
              <Flex vertical gap={12}>
                <Text strong style={{ fontSize: 15 }}>
                  {topic.title}
                </Text>
                <Paragraph
                  type="secondary"
                  style={{ fontSize: 13, margin: 0 }}
                  ellipsis={{ rows: 2 }}
                >
                  {topic.summary}
                </Paragraph>
                <Flex gap={6} wrap="wrap">
                  <Tag
                    color={
                      topic.trend_direction === "up"
                        ? "red"
                        : topic.trend_direction === "down"
                          ? "green"
                          : "default"
                    }
                    style={{ fontSize: 11, lineHeight: "20px" }}
                  >
                    {topic.trend_direction === "up"
                      ? "↑ 上升"
                      : topic.trend_direction === "down"
                        ? "↓ 下降"
                        : "→ 平稳"}
                  </Tag>
                  <Tag color="blue" style={{ fontSize: 11, lineHeight: "20px" }}>
                    热度 {Math.round(topic.current_heat ?? 0)}
                  </Tag>
                  <Tag style={{ fontSize: 11, lineHeight: "20px" }}>
                    {(topic.post_count ?? 0)} 篇
                  </Tag>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
