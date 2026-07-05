"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  List,
  Tag,
  Button,
  Space,
  Spin,
  Empty,
  Alert,
} from "antd";
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
      <div
        style={{
          background: "linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          公开源热点聚合 · AI 快速理解 · 内容选题生成
        </Title>
        <Text type="secondary" style={{ marginTop: 4, display: "block" }}>
          监控「{monitorName}」— 按热度、相关性和可创作价值排序
        </Text>
      </div>

      {/* Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="今日热点"
              value={posts.length}
              suffix={
                <Text type="secondary" style={{ fontSize: 13 }}>
                  条
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="高相关热点"
              value={relevantCount}
              suffix={
                <Text type="secondary" style={{ fontSize: 13 }}>
                  / {posts.length}
                </Text>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="已收藏"
              value={savedIds.size}
              prefix={<StarFilled style={{ color: "#faad14" }} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="待处理通知"
              value={pendingNotifCount}
              suffix={
                <Text type="secondary" style={{ fontSize: 13 }}>
                  条
                </Text>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content: Post List + Detail */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: "#1677FF" }} />
                <span>热点榜单</span>
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
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <BranchesOutlined style={{ color: "#1677FF" }} />
                <span>快速理解</span>
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
                <Title level={5}>{selected.content_text?.slice(0, 100) ?? ""}</Title>
                <Paragraph type="secondary">
                  {selected.content_text ?? "暂无内容"}
                </Paragraph>

                <div style={{ marginTop: 12 }}>
                  <Row gutter={[16, 8]}>
                    {selected.view_count != null && (
                      <Col span={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          阅读 {selected.view_count}
                        </Text>
                      </Col>
                    )}
                    {selected.like_count != null && (
                      <Col span={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          点赞 {selected.like_count}
                        </Text>
                      </Col>
                    )}
                    {selected.reply_count != null && (
                      <Col span={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          回复 {selected.reply_count}
                        </Text>
                      </Col>
                    )}
                    {selected.repost_count != null && (
                      <Col span={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          转发 {selected.repost_count}
                        </Text>
                      </Col>
                    )}
                    {selected.quote_count != null && (
                      <Col span={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          引用 {selected.quote_count}
                        </Text>
                      </Col>
                    )}
                    {selected.freshness_score != null && (
                      <Col span={8}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          新鲜度 {Math.round(selected.freshness_score * 100)}
                        </Text>
                      </Col>
                    )}
                  </Row>
                </div>

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
                    <Row gutter={[12, 12]}>
                      {topicList.slice(0, 4).map((topic) => (
                        <Col span={12} key={topic.id}>
                          <Card size="small" style={{ height: "100%" }}>
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
                          </Card>
                        </Col>
                      ))}
                    </Row>
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
          </Card>
        </Col>
      </Row>

      {/* Bottom: Trend + Source + Notifications */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <RiseOutlined style={{ color: "#1677FF" }} />
                <span>趋势分析</span>
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
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BarChartOutlined style={{ color: "#1677FF" }} />
                <span>来源分布</span>
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
          </Card>
        </Col>
      </Row>

      {/* Notifications */}
      <div>
        <Card
          title={
            <Space>
              <BellOutlined style={{ color: "#1677FF" }} />
              <span>通知列表</span>
            </Space>
          }
          extra={
            <Text type="secondary" style={{ fontSize: 12 }}>
              {notifications.length} 条未读
            </Text>
          }
        >
          {notifications.length > 0 ? (
            <Row gutter={[16, 16]}>
              {notifications.map((n) => (
                <Col xs={24} sm={12} key={n.id}>
                  <Card size="small" type="inner">
                    <Space>
                      <Tag
                        color={deliveryStatusColor[n.delivery_status ?? ""] ?? "default"}
                        icon={deliveryStatusIcon[n.delivery_status ?? ""]}
                        style={{ fontSize: 11 }}
                      >
                        {n.channel === "in_app" ? "站内" : n.channel ?? "未知"}
                      </Tag>
                      <Text>
                        {n.delivery_status === "pending"
                          ? "待发送"
                          : n.delivery_status === "delivered"
                            ? "已送达"
                            : n.delivery_status === "skipped"
                              ? "已跳过"
                              : n.delivery_status === "failed"
                                ? "发送失败"
                                : n.delivery_status ?? "未知"}
                      </Text>
                    </Space>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {n.created_at
                          ? new Date(n.created_at).toLocaleString("zh-CN")
                          : ""}
                      </Text>
                      {n.delivery_status === "pending" && (
                        <Tag color="processing" style={{ marginLeft: 8, fontSize: 11 }}>
                          排队中
                        </Tag>
                      )}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty
              description="暂无未读通知"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
