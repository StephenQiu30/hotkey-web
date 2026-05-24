/// <reference path="../src/services/hotkey/hotkey-server/typings.d.ts" />

import { CreatorWorkbench, type HotspotItem } from "@/components/CreatorWorkbench";

const p0Sections = ["HotKey", "热点榜单", "快速理解", "内容选题", "收藏关注", "趋势分析", "来源分布"];

const topicIdeas: HotKeyAPI.TopicIdeaRead[] = [
  {
    title: "3 分钟看懂 AI agent 工作流为什么又火了",
    angle: "从创作者日常生产效率切入，拆解新工具链的可复制价值。",
    format: "短视频脚本",
    rationale: "适合快速承接技术圈热度，并转成普通用户能理解的内容。",
  },
  {
    title: "普通创作者如何用 agent 搭一个热点监控台",
    angle: "用低门槛案例解释工具组合、素材流和选题判断。",
    format: "图文教程",
    rationale: "能自然引导收藏、关注和后续系列内容。",
  },
];

const initialHotspots: (HotKeyAPI.HotspotRead & HotspotItem)[] = [
  {
    id: 101,
    title: "AI agent 工作流成为创作者工具新热点",
    url: "https://example.com/agent-workflow",
    source_id: 1,
    keyword_id: 1,
    author: "GitHub Trending",
    snippet: "多个开源项目开始围绕 agent 工作流提供模板、调度和内容生产插件。",
    published_at: "2026-05-24T09:00:00Z",
    fetched_at: "2026-05-24T09:20:00Z",
    status: "active",
    cluster_id: "ai-agent-workflow",
    rank_score: 91,
    trend_score: 78,
    raw_payload: {},
    created_at: "2026-05-24T09:20:00Z",
    updated_at: "2026-05-24T09:20:00Z",
    ai_analysis: {
      id: 1,
      hotspot_id: 101,
      is_real: true,
      relevance_score: "92.00",
      relevance_reason: "与创作者工具和自动化内容生产高度相关。",
      keyword_mentioned: true,
      importance: "high",
      summary: "AI agent 工具链正在从开发者圈扩散到内容生产流程。",
      quick_understanding: ["热度来自开源工具集中发布。", "创作者可把它转化为效率工具教程。", "适合做系列化选题。"],
      topic_ideas: topicIdeas,
      model_name: "local-fallback",
      raw_response: {},
      created_at: "2026-05-24T09:20:00Z",
      updated_at: "2026-05-24T09:20:00Z",
    },
    saved: true,
  },
  {
    id: 102,
    title: "搜索 API 聚合让小团队也能做热点雷达",
    url: "https://example.com/search-api-radar",
    source_id: 2,
    keyword_id: 2,
    author: "Hacker News",
    snippet: "公开搜索和 RSS 源组合降低了热点采集门槛。",
    published_at: "2026-05-24T08:10:00Z",
    fetched_at: "2026-05-24T08:30:00Z",
    status: "active",
    cluster_id: "public-source-radar",
    rank_score: 82,
    trend_score: 66,
    raw_payload: {},
    created_at: "2026-05-24T08:30:00Z",
    updated_at: "2026-05-24T08:30:00Z",
    ai_analysis: null,
    saved: false,
  },
  {
    id: 103,
    title: "小程序提醒成为热点跟进的轻量入口",
    url: "https://example.com/miniapp-alert",
    source_id: 3,
    keyword_id: 3,
    author: "RSS",
    snippet: "内容团队希望在手机端快速查看收藏和提醒状态。",
    published_at: "2026-05-24T07:40:00Z",
    fetched_at: "2026-05-24T07:50:00Z",
    status: "active",
    cluster_id: "miniapp-alert",
    rank_score: 74,
    trend_score: 58,
    raw_payload: {},
    created_at: "2026-05-24T07:50:00Z",
    updated_at: "2026-05-24T07:50:00Z",
    ai_analysis: null,
    saved: false,
  },
];

const trendPoints = [34, 42, 40, 58, 64, 73, 88];

// Generated client source: src/services/hotkey/hotkey-server
export default function CreatorWorkbenchPage() {
  void p0Sections;
  return <CreatorWorkbench initialHotspots={initialHotspots} trendPoints={trendPoints} />;
}
