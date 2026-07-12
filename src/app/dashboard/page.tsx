"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Card,
  Statistic,
  List,
  Tag,
  Typography,
  Button,
  Space,
  Empty,
  Alert,
  Spin,
  Descriptions,
  Flex,
} from "antd";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ProCard, ProList } from "@ant-design/pro-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FireOutlined,
  StarOutlined,
  StarFilled,
  ReloadOutlined,
  RiseOutlined,
  BarChartOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { listMonitors } from "@/services/monitors";
import { listPosts } from "@/services/content";
import { listTopics } from "@/services/topics";
import { getMonitorTrends } from "@/services/trends";
import { listNotifications } from "@/services/notifications";

const { Text, Title, Paragraph } = Typography;

type PageState = "loading" | "error" | "empty" | "data";

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const deliveryStatusColor: Record<string, string> = {
  delivered: "success",
  pending: "processing",
  skipped: "warning",
  failed: "error",
};

const deliveryStatusIcon: Record<string, React.ReactNode> = {
  delivered: <CheckCircleOutlined />,
  pending: <ClockCircleOutlined />,
  skipped: <CloseCircleOutlined />,
  failed: <CloseCircleOutlined />,
};

export default function DashboardPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [monitorName, setMonitorName] = useState("");
  const [posts, setPosts] = useState<HotKeyAPI.PostSummary[]>([]);
  const [topics, setTopics] = useState<HotKeyAPI.TopicSummary[]>([]);
  const [trends, setTrends] = useState<HotKeyAPI.TrendPoint[]>([]);
  const [notifications, setNotifications] = useState<
    HotKeyAPI.NotificationData[]
  >([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [topicRotation, setTopicRotation] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (pageState !== "data") return;
    gsap.from(".dp-item", {
      y: 24,
      autoAlpha: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: "power3.out",
    });
  }, { dependencies: [pageState], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedPostIds");
      if (raw) setSavedIds(new Set(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setPageState("loading");
      try {
        const monitorsRes = await listMonitors();
        const monitors = monitorsRes.data ?? [];
        if (monitors.length === 0) {
          if (!cancelled) setPageState("empty");
          return;
        }

        const active =
          monitors.find((m) => m.status === "active") ?? monitors[0];
        const mid = active.id!;
        if (!cancelled)
          setMonitorName(active.name ?? active.query_text ?? "监控");

        const [postsRes, topicsRes, trendsRes, notifRes] =
          await Promise.all([
            listPosts({ id: mid, limit: 50 }),
            listTopics({ id: mid }),
            getMonitorTrends({ id: mid }),
            listNotifications(),
          ]);

        if (!cancelled) {
          const p = postsRes.data ?? [];
          setPosts(p);
          if (p.length > 0) setSelectedId(p[0].id ?? null);
          setTopics(topicsRes.data ?? []);
          setTrends(trendsRes.data ?? []);
          setNotifications(notifRes.data ?? []);
          setPageState("data");
        }
      } catch (err: any) {
        if (!cancelled) {
          setErrorMsg(err?.message ?? "加载失败");
          setPageState("error");
        }
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) => (b.final_score ?? 0) - (a.final_score ?? 0),
      ),
    [posts],
  );

  const selected = useMemo(
    () => sortedPosts.find((p) => p.id === selectedId) ?? sortedPosts[0],
    [sortedPosts, selectedId],
  );

  const topicList = useMemo(() => {
    const t = topics.length > 0 ? topics : [];
    if (t.length < 2) return t;
    const pivot = topicRotation % t.length;
    return [...t.slice(pivot), ...t.slice(0, pivot)];
  }, [topics, topicRotation]);

  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const p of posts) {
      const key = p.author_handle || "未知";
      counts[key] = (counts[key] ?? 0) + 1;
      total++;
    }
    return Object.entries(counts)
      .map(([label, value]) => ({
        label,
        value: Math.round((value / total) * 100),
      }))
      .sort((a, b) => b.value - a.value);
  }, [posts]);

  const toggleSave = useCallback(
    (id: number) => {
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        localStorage.setItem("savedPostIds", JSON.stringify([...next]));
        return next;
      });
    },
    [],
  );

  const relevantCount = useMemo(
    () => posts.filter((p) => (p.relevance_score ?? 0) > 0.7).length,
    [posts],
  );

  const pendingNotifCount = useMemo(
    () => notifications.filter((n) => n.delivery_status === "pending").length,
    [notifications],
  );

  const trendMax = useMemo(
    () => Math.max(...trends.map((t) => t.heat_score ?? 0), 1),
    [trends],
  );

  if (pageState === "error") {
    return (
      <Card variant="outlined">
        <Alert
          message="加载失败"
          description={errorMsg}
          type="error"
          showIcon
          action={<Button onClick={() => window.location.reload()}>重试</Button>}
        />
      </Card>
    );
  }

  if (pageState === "loading") {
    return (
      <Card variant="outlined" styles={{ body: { textAlign: "center", padding: 80 } }}>
        <Spin size="large" />
      </Card>
    );
  }

  if (pageState === "empty") {
    return (
      <Card variant="outlined" styles={{ body: { textAlign: "center", padding: 80 } }}>
        <Empty description="暂无监控配置，请先在设置中创建监控">
          <Button type="primary" onClick={() => { window.location.href = "/dashboard/settings"; }}>
            去设置
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div ref={containerRef}>
      <Flex vertical gap={16}>
        {/* Header */}
        <div className="dp-item">
          <Card variant="outlined">
            <Title level={4} style={{ margin: 0, fontSize: 18 }}>
              公开源热点聚合 · AI 快速理解 · 内容选题生成
            </Title>
            <Text type="secondary">
              监控「{monitorName}」— 按热度、相关性和可创作价值排序
            </Text>
          </Card>
        </div>

        {/* Stats Row */}
        <div className="dp-item">
          <Flex gap={12} wrap="wrap">
            {[
              { title: "今日热点", value: posts.length, suffix: "条" },
              {
                title: "高相关热点",
                value: relevantCount,
                suffix: `/ ${posts.length}`,
              },
              {
                title: "已收藏",
                value: savedIds.size,
                prefix: <StarFilled style={{ color: "#faad14" }} />,
              },
              {
                title: "待处理通知",
                value: pendingNotifCount,
                suffix: "条",
              },
            ].map((s) => (
              <Card
                key={s.title}
                variant="outlined"
                style={{ minWidth: 180, flex: "1 1 0" }}
                styles={{ body: { padding: "20px 24px" } }}
              >
                <Statistic
                  title={s.title}
                  value={s.value}
                  suffix={s.suffix}
                  prefix={s.prefix}
                  valueStyle={{ fontSize: 28, fontWeight: 600, color: "#111" }}
                />
              </Card>
            ))}
          </Flex>
        </div>

        {/* Main Content: Post List + Detail */}
        <div className="dp-item">
          <Flex gap={12} wrap={false}>
            {/* Left: Hot Post List */}
            <ProCard
              ghost
              bordered
              bodyStyle={{ padding: "20px 0" }}
              title={
                <Space size={8}>
                  <FireOutlined style={{ color: "#888", fontSize: 16 }} />
                  <Text strong>
                    热点榜单
                  </Text>
                </Space>
              }
              extra={<Text type="secondary" style={{ fontSize: 12 }}>按综合评分排序</Text>}
              style={{ flex: 1 }}
            >
              <List
                dataSource={sortedPosts}
                renderItem={(item, index) => (
                  <List.Item
                    key={item.id}
                    onClick={() => setSelectedId(item.id ?? null)}
                    style={{
                      cursor: "pointer",
                      padding: "12px 20px",
                      margin: "0 0 2px",
                      background:
                        item.id === selected?.id ? "#f5f5f5" : "transparent",
                      borderLeft:
                        item.id === selected?.id
                          ? "3px solid var(--ant-color-primary)"
                          : "3px solid transparent",
                      transition: "all 0.1s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (item.id !== selected?.id)
                        e.currentTarget.style.background = "#fafafa";
                    }}
                    onMouseLeave={(e) => {
                      if (item.id !== selected?.id)
                        e.currentTarget.style.background = "transparent";
                    }}
                    extra={
                      item.id != null ? (
                        <Button
                          type="text"
                          size="small"
                          icon={
                            savedIds.has(item.id) ? (
                              <StarFilled style={{ color: "#faad14" }} />
                            ) : (
                              <StarOutlined />
                            )
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item.id!);
                          }}
                        />
                      ) : null
                    }
                  >
                    <List.Item.Meta
                      avatar={
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            border: "1px solid #eaeaea",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                            color: "#999",
                            fontSize: 12,
                          }}
                        >
                          {index + 1}
                        </div>
                      }
                      title={
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: item.id === selected?.id ? 600 : 400,
                          }}
                        >
                          {item.content_text?.slice(0, 80) ?? `Post #${item.id}`}
                        </Text>
                      }
                      description={
                        <div>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {(item.author_name || item.author_handle) ?? "未知"} ·{" "}
                            {item.published_at
                              ? new Date(item.published_at).toLocaleDateString("zh-CN")
                              : ""}
                          </Text>
                          <Flex gap={4} style={{ marginTop: 6 }}>
                            {item.final_score != null && (
                              <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>
                                评分 {Math.round(item.final_score * 100)}
                              </Tag>
                            )}
                            {item.heat_score != null && (
                              <Tag color="default" style={{ fontSize: 11, margin: 0 }}>
                                {Math.round(item.heat_score * 100)}
                              </Tag>
                            )}
                          </Flex>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </ProCard>

            {/* Right: Detail Panel */}
            <ProCard
              ghost
              bordered
              bodyStyle={{ padding: 20 }}
              title={
                <Text strong>
                  快速理解
                </Text>
              }
              extra={
                selected?.matched_keywords?.length ? (
                  <Space size={4}>
                    {selected.matched_keywords.map((kw) => (
                      <Tag key={kw} color="blue" style={{ fontSize: 11 }}>
                        {kw}
                      </Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    AI 摘要
                  </Text>
                )
              }
              style={{ flex: 1.4 }}
            >
              {selected ? (
                <Flex vertical gap={16}>
                  {/* Markdown content */}
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selected.content_text ?? "暂无内容"}
                    </ReactMarkdown>
                  </div>

                  {/* Engagement stats using Descriptions */}
                  <Descriptions
                    size="small"
                    column={6}
                    bordered
                    styles={{
                      label: { fontSize: 12, color: "#999", background: "#fafafa" },
                      content: { fontSize: 14, fontWeight: 600, color: "#111" },
                    }}
                  >
                    <Descriptions.Item label="阅读">{selected.view_count ?? "-"}</Descriptions.Item>
                    <Descriptions.Item label="点赞">{selected.like_count ?? "-"}</Descriptions.Item>
                    <Descriptions.Item label="回复">{selected.reply_count ?? "-"}</Descriptions.Item>
                    <Descriptions.Item label="转发">{selected.repost_count ?? "-"}</Descriptions.Item>
                    <Descriptions.Item label="引用">{selected.quote_count ?? "-"}</Descriptions.Item>
                    <Descriptions.Item label="新鲜度">
                      {selected.freshness_score != null
                        ? `${Math.round(selected.freshness_score * 100)}%`
                        : "-"}
                    </Descriptions.Item>
                  </Descriptions>

                  {/* Content Topics */}
                  {topicList.length > 0 ? (
                    <div>
                      <Flex justify="space-between" align="center" style={{ marginBottom: 12 }}>
                        <Text strong>内容选题</Text>
                        <Button
                          size="small"
                          icon={<ReloadOutlined />}
                          onClick={() => setTopicRotation((v) => v + 1)}
                        >
                          换一批
                        </Button>
                      </Flex>
                      <Flex gap={8} wrap="wrap">
                        {topicList.slice(0, 4).map((topic) => (
                          <Card
                            key={topic.id}
                            variant="outlined"
                            size="small"
                            hoverable
                            style={{ flex: "1 1 calc(50% - 4px)", minWidth: 180 }}
                          >
                            <Text strong style={{ fontSize: 13 }}>
                              {topic.title}
                            </Text>
                            <Paragraph
                              type="secondary"
                              style={{ fontSize: 12, margin: "4px 0 8px" }}
                              ellipsis={{ rows: 2 }}
                            >
                              {topic.summary}
                            </Paragraph>
                            <Flex gap={4}>
                              <Tag
                                color={
                                  topic.trend_direction === "up"
                                    ? "red"
                                    : topic.trend_direction === "down"
                                      ? "green"
                                      : "default"
                                }
                                style={{ fontSize: 11, lineHeight: "18px" }}
                              >
                                {topic.trend_direction === "up"
                                  ? "↑ 上升"
                                  : topic.trend_direction === "down"
                                    ? "↓ 下降"
                                    : "→ 平稳"}
                              </Tag>
                              <Tag color="blue" style={{ fontSize: 11, lineHeight: "18px" }}>
                                热度 {Math.round(topic.current_heat ?? 0)}
                              </Tag>
                            </Flex>
                          </Card>
                        ))}
                      </Flex>
                    </div>
                  ) : (
                    <Empty
                      description="暂无选题建议"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </Flex>
              ) : (
                <Empty
                  description="选择一个热点查看详情"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </ProCard>
          </Flex>
        </div>

        {/* Bottom: Trend + Source */}
        <div className="dp-item">
          <Flex gap={12}>
            {/* Trend Analysis */}
            <ProCard
              ghost
              bordered
              bodyStyle={{ padding: 20 }}
              title={
                <Space size={8}>
                  <RiseOutlined style={{ color: "#888", fontSize: 16 }} />
                  <Text strong>
                    趋势分析
                  </Text>
                </Space>
              }
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {trends.length > 0
                    ? `${formatTime(trends[0]?.time)} — ${formatTime(trends[trends.length - 1]?.time)}`
                    : "暂无数据"}
                </Text>
              }
              style={{ flex: 1 }}
            >
              {trends.length > 0 ? (
                <Flex
                  align="flex-end"
                  gap={4}
                  style={{ height: 160, paddingTop: 8 }}
                >
                  {trends.map((point, index) => {
                    const pct = ((point.heat_score ?? 0) / trendMax) * 100;
                    return (
                      <div
                        key={index}
                        style={{
                          flex: 1,
                          height: `${Math.max(pct, 4)}%`,
                          background: "var(--ant-color-primary)",
                          borderRadius: "4px 4px 0 0",
                          minHeight: 4,
                          opacity: 0.3 + (pct / 100) * 0.7,
                          position: "relative",
                          transition: "opacity 0.2s ease",
                        }}
                        title={`${formatTime(point.time)}: ${Math.round(point.heat_score ?? 0)}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = String(0.3 + (pct / 100) * 0.7);
                        }}
                      >
                        {trends.length <= 14 && (
                          <Text
                            style={{
                              position: "absolute",
                              bottom: -18,
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontSize: 10,
                              color: "#999",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatTime(point.time)}
                          </Text>
                        )}
                      </div>
                    );
                  })}
                </Flex>
              ) : (
                <Empty description="暂无趋势数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </ProCard>

            {/* Source Distribution */}
            <ProCard
              ghost
              bordered
              bodyStyle={{ padding: 20 }}
              title={
                <Space size={8}>
                  <BarChartOutlined style={{ color: "#888", fontSize: 16 }} />
                  <Text strong>
                    来源分布
                  </Text>
                </Space>
              }
              extra={<Text type="secondary" style={{ fontSize: 12 }}>公开源</Text>}
              style={{ flex: 1 }}
            >
              {sourceDistribution.length > 0 ? (
                <Flex vertical gap={16}>
                  {sourceDistribution.map((source) => (
                    <div key={source.label}>
                      <Flex justify="space-between" style={{ marginBottom: 6 }}>
                        <Text style={{ fontSize: 13 }}>{source.label}</Text>
                        <Text strong style={{ fontSize: 13 }}>
                          {source.value}%
                        </Text>
                      </Flex>
                      <div
                        style={{
                          height: 6,
                          background: "#f0f0f0",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${source.value}%`,
                            height: "100%",
                            background: "var(--ant-color-primary)",
                            borderRadius: 3,
                            opacity: 0.4 + (source.value / 100) * 0.6,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </Flex>
              ) : (
                <Empty description="暂无来源数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
            </ProCard>
          </Flex>
        </div>

        {/* Notifications */}
        <div className="dp-item">
          <ProCard
            ghost
            bordered
            bodyStyle={{ padding: 20 }}
            title={
              <Space size={8}>
                <BellOutlined style={{ color: "#888", fontSize: 16 }} />
                <Text strong>
                  通知列表
                </Text>
              </Space>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {notifications.length} 条未读
              </Text>
            }
          >
            {notifications.length > 0 ? (
              <ProList<HotKeyAPI.NotificationData>
                rowKey="id"
                dataSource={notifications}
                grid={{ gutter: 16, xs: 1, sm: 2 }}
                showActions="hover"
                metas={{
                  title: {
                    render: (_, item) => (
                      <Space size={8}>
                        <Tag
                          color={deliveryStatusColor[item.delivery_status ?? ""] ?? "default"}
                          icon={deliveryStatusIcon[item.delivery_status ?? ""]}
                          style={{ fontSize: 11 }}
                        >
                          {item.channel === "in_app" ? "站内" : item.channel ?? "未知"}
                        </Tag>
                        <Text>
                          {item.delivery_status === "pending"
                            ? "待发送"
                            : item.delivery_status === "delivered"
                              ? "已送达"
                              : item.delivery_status === "skipped"
                                ? "已跳过"
                                : item.delivery_status === "failed"
                                  ? "发送失败"
                                  : item.delivery_status ?? "未知"}
                        </Text>
                      </Space>
                    ),
                  },
                  description: {
                    render: (_, item) => (
                      <Flex align="center" gap={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.created_at ? new Date(item.created_at).toLocaleString("zh-CN") : ""}
                        </Text>
                        {item.delivery_status === "pending" && (
                          <Tag color="processing" style={{ fontSize: 11 }}>
                            排队中
                          </Tag>
                        )}
                      </Flex>
                    ),
                  },
                }}
              />
            ) : (
              <Empty description="暂无未读通知" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </ProCard>
        </div>
      </Flex>
    </div>
  );
}
