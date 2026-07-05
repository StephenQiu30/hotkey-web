"use client";

import { useState, useMemo } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  List,
  Tag,
  Button,
  Rate,
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
} from "@ant-design/icons";
import { useAuthStore } from "@/stores/authStore";

const { Title, Text, Paragraph } = Typography;

// Demo data - will be replaced with real API calls
const demoHotspots = [
  {
    id: 101,
    title: "AI agent 工作流成为创作者工具新热点",
    author: "GitHub Trending",
    snippet: "多个开源项目开始围绕 agent 工作流提供模板、调度和内容生产插件。",
    trendScore: 88,
    rankScore: 91,
    clusterId: "ai-agent-workflow",
    saved: true,
    aiAnalysis: {
      summary: "AI agent 工具链正在从开发者圈扩散到内容生产流程。",
      quickUnderstanding: [
        "热度来自开源工具集中发布。",
        "创作者可把它转化为效率工具教程。",
        "适合做系列化选题。",
      ],
      topicIdeas: [
        {
          title: "3 分钟看懂 AI agent 工作流为什么又火了",
          angle: "从创作者日常生产效率切入，拆解新工具链的可复制价值。",
          format: "短视频脚本",
          rationale: "适合快速承接技术圈热度",
        },
        {
          title: "普通创作者如何用 agent 搭一个热点监控台",
          angle: "用低门槛案例解释工具组合、素材流和选题判断。",
          format: "图文教程",
          rationale: "能自然引导收藏、关注和后续系列内容",
        },
      ],
    },
  },
  {
    id: 102,
    title: "搜索 API 聚合让小团队也能做热点雷达",
    author: "Hacker News",
    snippet: "公开搜索和 RSS 源组合降低了热点采集门槛。",
    trendScore: 66,
    rankScore: 82,
    clusterId: "public-source-radar",
    saved: false,
    aiAnalysis: null,
  },
  {
    id: 103,
    title: "小程序提醒成为热点跟进的轻量入口",
    author: "RSS",
    snippet: "内容团队希望在手机端快速查看收藏和提醒状态。",
    trendScore: 58,
    rankScore: 74,
    clusterId: "miniapp-alert",
    saved: false,
    aiAnalysis: null,
  },
];

const trendPoints = [34, 42, 40, 58, 64, 73, 88];
const sourceDistribution = [
  { label: "GitHub Trending", value: 46 },
  { label: "Hacker News", value: 32 },
  { label: "RSS", value: 22 },
];

export default function DashboardPage() {
  const [hotspots] = useState(demoHotspots);
  const [selectedId, setSelectedId] = useState(demoHotspots[0]?.id ?? 0);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set([101]));
  const [topicRotation, setTopicRotation] = useState(0);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const selected = useMemo(
    () => hotspots.find((h) => h.id === selectedId) ?? hotspots[0],
    [hotspots, selectedId]
  );

  const topicIdeas = useMemo(() => {
    const ideas = selected?.aiAnalysis?.topicIdeas ?? [];
    if (ideas.length < 2) return ideas;
    const pivot = topicRotation % ideas.length;
    return [...ideas.slice(pivot), ...ideas.slice(0, pivot)];
  }, [selected, topicRotation]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (error) {
    return (
      <Alert
        message="加载失败"
        description={error}
        type="error"
        showIcon
        action={<Button onClick={() => window.location.reload()}>重试</Button>}
      />
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 80 }}>
        <Spin size="large" />
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
          聚合 GitHub Trending、Hacker News 与 RSS 等公开源，按趋势、相关性和可创作价值排序
        </Text>
      </div>

      {/* Metrics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="今日热点" value={128} suffix={<Text type="secondary">+24%</Text>} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="高相关热点" value={36} suffix={<Text type="secondary">+11%</Text>} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="已收藏" value={savedIds.size} prefix={<StarFilled style={{ color: "#faad14" }} />} />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic title="待提醒" value={7} suffix={<Text type="secondary">今日</Text>} />
          </Card>
        </Col>
      </Row>

      {/* Main Content: Hotspot List + Detail */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <FireOutlined style={{ color: "#1677FF" }} />
                <span>热点榜单</span>
              </Space>
            }
            extra={<Button type="text" icon={<BarChartOutlined />}>排行</Button>}
          >
            <List
              dataSource={hotspots}
              renderItem={(item, index) => (
                <List.Item
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  style={{
                    cursor: "pointer",
                    padding: "10px 12px",
                    borderRadius: 6,
                    background: item.id === selectedId ? "#e6f4ff" : undefined,
                    border:
                      item.id === selectedId ? "1px solid #91caff" : "1px solid transparent",
                    marginBottom: 8,
                  }}
                  extra={
                    <Button
                      type="text"
                      size="small"
                      icon={savedIds.has(item.id) ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
                      onClick={(e) => { e.stopPropagation(); toggleSave(item.id); }}
                    />
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
                        {item.title}
                      </Text>
                    }
                    description={
                      <div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.snippet}
                        </Text>
                        <div style={{ marginTop: 4 }}>
                          <Tag color="default" style={{ fontSize: 11, lineHeight: "18px" }}>
                            {item.author}
                          </Tag>
                          <Tag color="blue" style={{ fontSize: 11, lineHeight: "18px" }}>
                            热度 {item.trendScore}
                          </Tag>
                          <Tag color="geekblue" style={{ fontSize: 11, lineHeight: "18px" }}>
                            排行 {item.rankScore}
                          </Tag>
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
            extra={<Tag color="blue">AI 摘要</Tag>}
          >
            {selected ? (
              <>
                <Title level={5}>{selected.title}</Title>
                <Paragraph type="secondary">
                  {selected.aiAnalysis?.summary ?? selected.snippet}
                </Paragraph>

                {selected.aiAnalysis?.quickUnderstanding && (
                  <>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>
                      快速理解
                    </Text>
                    <Space direction="vertical" style={{ width: "100%" }}>
                      {selected.aiAnalysis.quickUnderstanding.map((item) => (
                        <div
                          key={item}
                          style={{
                            padding: "6px 12px",
                            background: "#f0f5ff",
                            borderRadius: 6,
                            fontSize: 13,
                            color: "#1677FF",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </Space>
                  </>
                )}

                {selected.aiAnalysis?.topicIdeas && (
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
                        生成选题
                      </Button>
                    </div>
                    <Row gutter={[12, 12]}>
                      {topicIdeas.map((idea) => (
                        <Col span={12} key={idea.title}>
                          <Card size="small" style={{ height: "100%" }}>
                            <Text strong style={{ fontSize: 13 }}>
                              {idea.title}
                            </Text>
                            <Paragraph
                              type="secondary"
                              style={{ fontSize: 12, marginTop: 4, marginBottom: 4 }}
                            >
                              {idea.angle}
                            </Paragraph>
                            <Tag color="blue" style={{ fontSize: 11, lineHeight: "18px" }}>
                              {idea.format}
                            </Tag>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {!selected.aiAnalysis && (
                  <Empty description="暂无 AI 分析" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </>
            ) : (
              <Empty description="选择一个热点查看详情" image={Empty.PRESENTED_IMAGE_SIMPLE} />
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
            extra={<Text type="secondary">7 日</Text>}
          >
            <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 160 }}>
              {trendPoints.map((value, index) => (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: `${value}%`,
                    background: "linear-gradient(to top, #91caff, #1677FF)",
                    borderRadius: "4px 4px 0 0",
                    minHeight: 16,
                  }}
                />
              ))}
            </div>
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
          </Card>
        </Col>
      </Row>

      <div>
        <Card
          title={
            <Space>
              <StarOutlined style={{ color: "#1677FF" }} />
              <span>通知列表</span>
            </Space>
          }
          extra={<Button type="text" icon={<FireOutlined />}>通知配置</Button>}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card size="small" type="inner">
                <Space>
                  <Tag color="default">邮件</Tag>
                  <Text>SMTP 未配置时保留站内通知记录</Text>
                </Space>
                <div style={{ marginTop: 4 }}>
                  <Tag color="warning">已跳过</Tag>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card size="small" type="inner">
                <Space>
                  <Tag color="blue">站内</Tag>
                  <Text>Report #30 待发送</Text>
                </Space>
                <div style={{ marginTop: 4 }}>
                  <Tag color="processing">排队中</Tag>
                </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
