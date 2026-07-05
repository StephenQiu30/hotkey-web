"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Statistic,
  List,
  Tag,
  Typography,
  Button,
  Space,
  Empty,
  Alert,
  Spin,
} from "antd";
import {
  ProCard,
  ProDescriptions,
  ProList,
} from "@ant-design/pro-components";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  FireOutlined,
  StarOutlined,
  StarFilled,
  ReloadOutlined,
  RiseOutlined,
  BarChartOutlined,
  BranchesOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";
import { listMonitors } from "@/services/hotkey/hotkey-server/monitors";
import { listPosts } from "@/services/hotkey/hotkey-server/content";
import { listTopics } from "@/services/hotkey/hotkey-server/topics";
import { getMonitorTrends } from "@/services/hotkey/hotkey-server/trends";
import { listNotifications } from "@/services/hotkey/hotkey-server/notifications";

const { Title, Text, Paragraph } = Typography;

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
  const [notifications, setNotifications] = useState<HotKeyAPI.NotificationData[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [topicRotation, setTopicRotation] = useState(0);

  // Load saved favorites from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedPostIds");
      if (raw) setSavedIds(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
  }, []);

  // Fetch all data
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

        const active = monitors.find((m) => m.status === "active") ?? monitors[0];
        const mid = active.id!;
        if (!cancelled) setMonitorName(active.name ?? active.query_text ?? "监控");

        const [postsRes, topicsRes, trendsRes, notifRes] = await Promise.all([
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
    return () => { cancelled = true; };
  }, []);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)),
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
      .map(([label, value]) => ({ label, value: Math.round((value / total) * 100) }))
      .sort((a, b) => b.value - a.value);
  }, [posts]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem("savedPostIds", JSON.stringify([...next]));
      return next;
    });
  };

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

  // Error state
  if (pageState === "error") {
    return (
      <Alert
        message="加载失败"
        description={errorMsg}
        type="error"
        showIcon
        action={<Button onClick={() => window.location.reload()}>重试</Button>}
      />
    );
  }

  // Loading state
  if (pageState === "loading") {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  // Empty state — no monitors configured
  if (pageState === "empty") {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Empty description="暂无监控配置，请先在设置中创建监控">
          <Button type="primary" onClick={() => { window.location.href = "/dashboard/settings"; }}>
            去设置
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <ProCard
        style={{
          background: "linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          公开源热点聚合 · AI 快速理解 · 内容选题生成
        </Title>
        <Text type="secondary" style={{ marginTop: 4, display: "block" }}>
          监控「{monitorName}」— 按热度、相关性和可创作价值排序
        </Text>
      </ProCard>

      {/* Metrics Row */}
      <ProCard.Group gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <ProCard colSpan={{ xs: 12, sm: 6 }}>
          <Statistic title="今日热点" value={posts.length} suffix="条" />
        </ProCard>
        <ProCard colSpan={{ xs: 12, sm: 6 }}>
          <Statistic
            title="高相关热点"
            value={relevantCount}
            suffix={`/ ${posts.length}`}
          />
        </ProCard>
        <ProCard colSpan={{ xs: 12, sm: 6 }}>
          <Statistic
            title="已收藏"
            value={savedIds.size}
            prefix={<StarFilled style={{ color: "#faad14" }} />}
          />
        </ProCard>
        <ProCard colSpan={{ xs: 12, sm: 6 }}>
          <Statistic title="待处理通知" value={pendingNotifCount} suffix="条" />
        </ProCard>
      </ProCard.Group>

      {/* Main Content: Post List + Detail */}
      <ProCard.Group gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Left: Hot Post List */}
        <ProCard
          colSpan={{ xs: 24, lg: 10 }}
          title={
            <Space>
              <FireOutlined style={{ color: "#1677FF" }} />
              热点榜单
            </Space>
          }
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              按综合评分排序
            </Text>
          }
        >
          <List
            dataSource={sortedPosts}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                onClick={() => setSelectedId(item.id ?? null)}
                style={{
                  cursor: "pointer",
                  padding: "10px 12px",
                  borderRadius: 6,
                  background: item.id === selected?.id ? "#e6f4ff" : undefined,
                  border:
                    item.id === selected?.id
                      ? "1px solid #91caff"
                      : "1px solid transparent",
                  marginBottom: 8,
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
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        background: "#f0f5ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        color: "#1677FF",
                        fontSize: 13,
                      }}
                    >
                      {index + 1}
                    </div>
                  }
                  title={
                    <Text strong style={{ fontSize: 13 }}>
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
                      <div style={{ marginTop: 4 }}>
                        {item.heat_score != null && (
                          <Tag color="blue" style={{ fontSize: 11, lineHeight: "18px" }}>
                            热度 {Math.round(item.heat_score * 100)}
                          </Tag>
                        )}
                        {item.relevance_score != null && (
                          <Tag color="geekblue" style={{ fontSize: 11, lineHeight: "18px" }}>
                            相关 {Math.round(item.relevance_score * 100)}
                          </Tag>
                        )}
                        {item.final_score != null && (
                          <Tag color="default" style={{ fontSize: 11, lineHeight: "18px" }}>
                            评分 {Math.round(item.final_score * 100)}
                          </Tag>
                        )}
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </ProCard>

        {/* Right: Detail Panel */}
        <ProCard
          colSpan={{ xs: 24, lg: 14 }}
          title={
            <Space>
              <BranchesOutlined style={{ color: "#1677FF" }} />
              快速理解
            </Space>
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
              <Tag color="blue">AI 摘要</Tag>
            )
          }
        >
          {selected ? (
            <>
              {/* Markdown-rendered content */}
              <div className="markdown-body" style={{ marginBottom: 16 }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selected.content_text ?? "暂无内容"}
                </ReactMarkdown>
              </div>

              {/* Engagement stats */}
              <ProDescriptions
                column={3}
                size="small"
                columns={[
                  { title: "阅读", dataIndex: "view_count", valueType: "digit" },
                  { title: "点赞", dataIndex: "like_count", valueType: "digit" },
                  { title: "回复", dataIndex: "reply_count", valueType: "digit" },
                  { title: "转发", dataIndex: "repost_count", valueType: "digit" },
                  { title: "引用", dataIndex: "quote_count", valueType: "digit" },
                  {
                    title: "新鲜度",
                    dataIndex: "freshness_score",
                    render: (val: any) =>
                      val != null ? `${Math.round(val * 100)}%` : "-",
                  },
                ]}
                dataSource={selected}
              />

              {/* Content Topics */}
              {topicList.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text strong>内容选题</Text>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => setTopicRotation((v) => v + 1)}
                    >
                      换一批
                    </Button>
                  </div>
                  <ProCard.Group gutter={[12, 12]}>
                    {topicList.slice(0, 4).map((topic) => (
                      <ProCard
                        key={topic.id}
                        colSpan={{ xs: 24, sm: 12 }}
                        size="small"
                      >
                        <Text strong style={{ fontSize: 13 }}>
                          {topic.title}
                        </Text>
                        <Paragraph
                          type="secondary"
                          style={{
                            fontSize: 12,
                            marginTop: 4,
                            marginBottom: 4,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
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
                        </Space>
                      </ProCard>
                    ))}
                  </ProCard.Group>
                </div>
              )}

              {topicList.length === 0 && (
                <div style={{ marginTop: 16 }}>
                  <Empty
                    description="暂无选题建议"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </>
          ) : (
            <Empty
              description="选择一个热点查看详情"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </ProCard>
      </ProCard.Group>

      {/* Bottom: Trend + Source */}
      <ProCard.Group gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Trend Analysis */}
        <ProCard
          colSpan={{ xs: 24, lg: 12 }}
          title={
            <Space>
              <RiseOutlined style={{ color: "#1677FF" }} />
              趋势分析
            </Space>
          }
          extra={
            <Text type="secondary">
              {trends.length > 0
                ? `${formatTime(trends[0]?.time)} — ${formatTime(trends[trends.length - 1]?.time)}`
                : "暂无数据"}
            </Text>
          }
        >
          {trends.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 160,
              }}
            >
              {trends.map((point, index) => {
                const pct = ((point.heat_score ?? 0) / trendMax) * 100;
                return (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: `${Math.max(pct, 4)}%`,
                      background: "linear-gradient(to top, #91caff, #1677FF)",
                      borderRadius: "4px 4px 0 0",
                      minHeight: 8,
                      position: "relative",
                    }}
                    title={`${formatTime(point.time)}: ${Math.round(point.heat_score ?? 0)}`}
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
            </div>
          ) : (
            <Empty
              description="暂无趋势数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </ProCard>

        {/* Source Distribution */}
        <ProCard
          colSpan={{ xs: 24, lg: 12 }}
          title={
            <Space>
              <BarChartOutlined style={{ color: "#1677FF" }} />
              来源分布
            </Space>
          }
          extra={<Text type="secondary">公开源</Text>}
        >
          {sourceDistribution.length > 0 ? (
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {sourceDistribution.map((source) => (
                <div key={source.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <Text style={{ fontSize: 13 }}>{source.label}</Text>
                    <Text strong>{source.value}%</Text>
                  </div>
                  <div
                    style={{
                      height: 8,
                      background: "#f0f0f0",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${source.value}%`,
                        height: "100%",
                        background: "#1677FF",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              ))}
            </Space>
          ) : (
            <Empty
              description="暂无来源数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </ProCard>
      </ProCard.Group>

      {/* Notifications */}
      <ProCard
        title={
          <Space>
            <BellOutlined style={{ color: "#1677FF" }} />
            通知列表
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
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("zh-CN")
                        : ""}
                    </Text>
                    {item.delivery_status === "pending" && (
                      <Tag color="processing" style={{ marginLeft: 8, fontSize: 11 }}>
                        排队中
                      </Tag>
                    )}
                  </div>
                ),
              },
            }}
          />
        ) : (
          <Empty
            description="暂无未读通知"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </ProCard>
    </div>
  );
}
