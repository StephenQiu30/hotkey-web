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

const { Text, Paragraph } = Typography;

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

function StatCard({
  title,
  value,
  suffix,
  prefix,
}: {
  title: string;
  value: string | number;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: "20px 24px",
        border: "1px solid #eaeaea",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "#666",
          marginBottom: 8,
          fontWeight: 500,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "#111",
          letterSpacing: "-0.02em",
          display: "flex",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        {prefix}
        {value}
        {suffix && (
          <span style={{ fontSize: 14, fontWeight: 400, color: "#999" }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

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

  if (pageState === "loading") {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (pageState === "empty") {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Empty description="暂无监控配置，请先在设置中创建监控">
          <Button
            type="primary"
            onClick={() => {
              window.location.href = "/dashboard/settings";
            }}
          >
            去设置
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div
        style={{
          border: "1px solid #eaeaea",
          borderRadius: 8,
          padding: "24px 28px",
        }}
      >
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#111",
            margin: "0 0 4px",
            letterSpacing: "-0.02em",
          }}
        >
          公开源热点聚合 · AI 快速理解 · 内容选题生成
        </h1>
        <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
          监控「{monitorName}」— 按热度、相关性和可创作价值排序
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard title="今日热点" value={posts.length} suffix="条" />
        <StatCard
          title="高相关热点"
          value={relevantCount}
          suffix={`/ ${posts.length}`}
        />
        <StatCard
          title="已收藏"
          value={savedIds.size}
          prefix={<StarFilled style={{ color: "#faad14", fontSize: 20 }} />}
        />
        <StatCard
          title="待处理通知"
          value={pendingNotifCount}
          suffix="条"
        />
      </div>

      {/* Main Content: Post List + Detail */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.4fr",
          gap: 12,
        }}
      >
        {/* Left: Hot Post List */}
        <ProCard
          ghost
          bordered
          bodyStyle={{ padding: "20px 0" }}
          title={
            <Space size={8}>
              <FireOutlined style={{ color: "#888", fontSize: 16 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                热点榜单
              </span>
            </Space>
          }
          extra={
            <span style={{ fontSize: 12, color: "#999" }}>
              按综合评分排序
            </span>
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
                  padding: "12px 20px",
                  margin: "0 0 2px",
                  background:
                    item.id === selected?.id ? "#f5f5f5" : "transparent",
                  borderLeft:
                    item.id === selected?.id
                      ? "3px solid #111"
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
                      {item.content_text?.slice(0, 80) ??
                        `Post #${item.id}`}
                    </Text>
                  }
                  description={
                    <div>
                      <span style={{ fontSize: 12, color: "#999" }}>
                        {(item.author_name || item.author_handle) ?? "未知"} ·{" "}
                        {item.published_at
                          ? new Date(item.published_at).toLocaleDateString(
                              "zh-CN",
                            )
                          : ""}
                      </span>
                      <div style={{ marginTop: 6 }}>
                        {item.final_score != null && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "1px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#1677FF",
                              background: "#f0f5ff",
                              marginRight: 4,
                            }}
                          >
                            评分 {Math.round(item.final_score * 100)}
                          </span>
                        )}
                        {item.heat_score != null && (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "1px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#666",
                              background: "#f5f5f5",
                              marginRight: 4,
                            }}
                          >
                            {Math.round(item.heat_score * 100)}
                          </span>
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
          ghost
          bordered
          bodyStyle={{ padding: 20 }}
          title={
            <Space size={8}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                快速理解
              </span>
            </Space>
          }
          extra={
            selected?.matched_keywords?.length ? (
              <Space size={4}>
                {selected.matched_keywords.map((kw) => (
                  <span
                    key={kw}
                    style={{
                      display: "inline-block",
                      padding: "1px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      color: "#1677FF",
                      background: "#f0f5ff",
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </Space>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  color: "#999",
                }}
              >
                AI 摘要
              </span>
            )
          }
        >
          {selected ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Markdown content */}
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selected.content_text ?? "暂无内容"}
                </ReactMarkdown>
              </div>

              {/* Engagement stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: 1,
                  border: "1px solid #eaeaea",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                {[
                  { label: "阅读", value: selected.view_count },
                  { label: "点赞", value: selected.like_count },
                  { label: "回复", value: selected.reply_count },
                  { label: "转发", value: selected.repost_count },
                  { label: "引用", value: selected.quote_count },
                  {
                    label: "新鲜度",
                    value: selected.freshness_score
                      ? `${Math.round(selected.freshness_score * 100)}%`
                      : "-",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    style={{
                      padding: "12px 8px",
                      textAlign: "center",
                      background: "#fafafa",
                    }}
                  >
                    <div
                      style={{ fontSize: 11, color: "#999", marginBottom: 4 }}
                    >
                      {s.label}
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "#111",
                      }}
                    >
                      {s.value ?? "-"}
                    </div>
                  </div>
                ))}
              </div>

              {/* Content Topics */}
              {topicList.length > 0 ? (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111",
                      }}
                    >
                      内容选题
                    </span>
                    <Button
                      size="small"
                      icon={<ReloadOutlined />}
                      onClick={() => setTopicRotation((v) => v + 1)}
                      style={{ fontSize: 12 }}
                    >
                      换一批
                    </Button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {topicList.slice(0, 4).map((topic) => (
                      <div
                        key={topic.id}
                        style={{
                          padding: 16,
                          border: "1px solid #eaeaea",
                          borderRadius: 8,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#111",
                            marginBottom: 4,
                          }}
                        >
                          {topic.title}
                        </div>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#666",
                            margin: "0 0 8px",
                            lineHeight: 1.5,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {topic.summary}
                        </p>
                        <Space size={4}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "1px 8px",
                              borderRadius: 4,
                              fontSize: 11,
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
                              padding: "1px 8px",
                              borderRadius: 4,
                              fontSize: 11,
                              color: "#666",
                              background: "#f5f5f5",
                            }}
                          >
                            {Math.round(topic.current_heat ?? 0)}
                          </span>
                        </Space>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "20px 0" }}>
                  <Empty
                    description="暂无选题建议"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                </div>
              )}
            </div>
          ) : (
            <Empty
              description="选择一个热点查看详情"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </ProCard>
      </div>

      {/* Bottom: Trend + Source */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {/* Trend Analysis */}
        <ProCard
          ghost
          bordered
          bodyStyle={{ padding: 20 }}
          title={
            <Space size={8}>
              <RiseOutlined style={{ color: "#888", fontSize: 16 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                趋势分析
              </span>
            </Space>
          }
          extra={
            <span style={{ fontSize: 12, color: "#999" }}>
              {trends.length > 0
                ? `${formatTime(trends[0]?.time)} — ${formatTime(trends[trends.length - 1]?.time)}`
                : "暂无数据"}
            </span>
          }
        >
          {trends.length > 0 ? (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 160,
                paddingTop: 8,
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
                      background: "#111",
                      borderRadius: "4px 4px 0 0",
                      minHeight: 4,
                      opacity: 0.15 + (pct / 100) * 0.85,
                      position: "relative",
                      transition: "opacity 0.2s ease",
                    }}
                    title={`${formatTime(point.time)}: ${Math.round(point.heat_score ?? 0)}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = String(
                        0.15 + (pct / 100) * 0.85,
                      );
                    }}
                  >
                    {trends.length <= 14 && (
                      <span
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
                      </span>
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
          ghost
          bordered
          bodyStyle={{ padding: 20 }}
          title={
            <Space size={8}>
              <BarChartOutlined style={{ color: "#888", fontSize: 16 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                来源分布
              </span>
            </Space>
          }
          extra={
            <span style={{ fontSize: 12, color: "#999" }}>公开源</span>
          }
        >
          {sourceDistribution.length > 0 ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {sourceDistribution.map((source) => (
                <div key={source.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 13, color: "#333" }}>
                      {source.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#111",
                      }}
                    >
                      {source.value}%
                    </span>
                  </div>
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
                        background: "#111",
                        borderRadius: 3,
                        opacity: 0.4 + (source.value / 100) * 0.6,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              description="暂无来源数据"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </ProCard>
      </div>

      {/* Notifications */}
      <ProCard
        ghost
        bordered
        bodyStyle={{ padding: 20 }}
        title={
          <Space size={8}>
            <BellOutlined style={{ color: "#888", fontSize: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
              通知列表
            </span>
          </Space>
        }
        extra={
          <span style={{ fontSize: 12, color: "#999" }}>
            {notifications.length} 条未读
          </span>
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
                      color={
                        deliveryStatusColor[
                          item.delivery_status ?? ""
                        ] ?? "default"
                      }
                      icon={deliveryStatusIcon[item.delivery_status ?? ""]}
                      style={{ fontSize: 11 }}
                    >
                      {item.channel === "in_app" ? "站内" : item.channel ?? "未知"}
                    </Tag>
                    <span style={{ fontSize: 13 }}>
                      {item.delivery_status === "pending"
                        ? "待发送"
                        : item.delivery_status === "delivered"
                          ? "已送达"
                          : item.delivery_status === "skipped"
                            ? "已跳过"
                            : item.delivery_status === "failed"
                              ? "发送失败"
                              : item.delivery_status ?? "未知"}
                    </span>
                  </Space>
                ),
              },
              description: {
                render: (_, item) => (
                  <div>
                    <span style={{ fontSize: 12, color: "#999" }}>
                      {item.created_at
                        ? new Date(item.created_at).toLocaleString("zh-CN")
                        : ""}
                    </span>
                    {item.delivery_status === "pending" && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "1px 8px",
                          borderRadius: 4,
                          fontSize: 11,
                          color: "#1677FF",
                          background: "#f0f5ff",
                          marginLeft: 8,
                        }}
                      >
                        排队中
                      </span>
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
