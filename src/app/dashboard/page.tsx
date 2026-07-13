"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Flame,
  Star,
  TrendingUp,
  BarChart3,
  Bell,
  CheckCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listMonitors } from "@/services/monitors";
import { listPosts } from "@/services/content";
import { listTopics } from "@/services/topics";
import { getMonitorTrends } from "@/services/trends";
import { listNotifications } from "@/services/notifications";

type PageState = "loading" | "error" | "empty" | "data";

function formatTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

const statusBadgeVariant = (status?: string) => {
  switch (status) {
    case "delivered": return "default" as const;
    case "pending": return "secondary" as const;
    case "skipped": return "outline" as const;
    case "failed": return "destructive" as const;
    default: return "outline" as const;
  }
};

const statusLabel: Record<string, string> = {
  delivered: "已送达",
  pending: "待发送",
  skipped: "已跳过",
  failed: "发送失败",
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
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (pageState !== "data") return;
    gsap.from(".dp-item", {
      y: 24,
      opacity: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: "power3.out",
    });
  }, { dependencies: [pageState], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("savedPostIds");
      if (raw) setSavedIds(new Set(JSON.parse(raw)));
    } catch { /* ignore */ }
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

  if (pageState === "error") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-destructive">{errorMsg}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (pageState === "loading") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (pageState === "empty") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
          <Flame className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">暂无监控配置，请先在设置中创建监控</p>
          <Button onClick={() => { window.location.href = "/dashboard/settings"; }}>
            去设置
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="space-y-4">
      {/* Header */}
      <div className="dp-item">
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-1 text-lg font-bold tracking-tight">
              公开源热点聚合 · AI 快速理解 · 内容选题生成
            </h3>
            <p className="text-sm text-muted-foreground">
              监控「{monitorName}」— 按热度、相关性和可创作价值排序
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="dp-item grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { title: "今日热点", value: posts.length, suffix: "条" },
          { title: "高相关热点", value: relevantCount, suffix: `/ ${posts.length}` },
          { title: "已收藏", value: savedIds.size },
          { title: "待处理通知", value: pendingNotifCount, suffix: "条" },
        ].map((s) => (
          <Card key={s.title}>
            <CardContent className="p-5">
              <p className="mb-1 text-xs font-medium text-muted-foreground">{s.title}</p>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {s.value}
                {s.suffix && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{s.suffix}</span>}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content: Post List + Detail */}
      <div className="dp-item">
        <div className="flex gap-3">
          {/* Left: Hot Post List */}
          <div className="flex-1 rounded-xl border border-border/60 bg-card shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">热点榜单</span>
              </div>
              <span className="text-xs text-muted-foreground">按综合评分排序</span>
            </div>

            {/* Post list */}
            <div className="divide-y divide-border/40">
              {sortedPosts.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id ?? null)}
                  className={`flex cursor-pointer items-start gap-3 px-5 py-3 transition-colors hover:bg-secondary/50 ${
                    item.id === selected?.id ? "border-l-[3px] border-primary bg-secondary/30" : "border-l-[3px] border-transparent"
                  }`}
                >
                  {/* Rank */}
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/60 text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-snug ${item.id === selected?.id ? "font-semibold" : ""}`}>
                      {item.content_text?.slice(0, 80) ?? `Post #${item.id}`}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {(item.author_name || item.author_handle) ?? "未知"}
                        {item.published_at ? ` · ${new Date(item.published_at).toLocaleDateString("zh-CN")}` : ""}
                      </span>
                      {item.final_score != null && (
                        <Badge variant="default" className="text-[10px]">
                          评分 {Math.round(item.final_score * 100)}
                        </Badge>
                      )}
                      {item.heat_score != null && (
                        <Badge variant="outline" className="text-[10px]">
                          {Math.round(item.heat_score * 100)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Save button */}
                  {item.id != null && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSave(item.id!); }}
                      className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
                    >
                      {savedIds.has(item.id) ? (
                        <Star className="h-4 w-4 fill-primary text-primary" />
                      ) : (
                        <Star className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="flex-[1.4] rounded-xl border border-border/60 bg-card shadow-sm">
            {/* Detail header */}
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <span className="text-sm font-semibold">快速理解</span>
              {selected?.matched_keywords?.length ? (
                <div className="flex flex-wrap gap-1">
                  {selected.matched_keywords.map((kw) => (
                    <Badge key={kw} variant="default" className="text-[10px]">{kw}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">AI 摘要</span>
              )}
            </div>

            {/* Detail content */}
            <div className="space-y-4 p-5">
              {selected ? (
                <>
                  {/* Markdown content */}
                  <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-primary prose-p:text-foreground/80">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selected.content_text ?? "暂无内容"}
                    </ReactMarkdown>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { label: "阅读", value: selected.view_count ?? "-" },
                      { label: "点赞", value: selected.like_count ?? "-" },
                      { label: "回复", value: selected.reply_count ?? "-" },
                      { label: "转发", value: selected.repost_count ?? "-" },
                      { label: "引用", value: selected.quote_count ?? "-" },
                      { label: "新鲜度", value: selected.freshness_score != null ? `${Math.round(selected.freshness_score * 100)}%` : "-" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-lg border border-border/60 bg-secondary/30 p-2 text-center"
                      >
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Content Topics */}
                  {topicList.length > 0 ? (
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold">内容选题</span>
                        <Button variant="outline" size="sm" onClick={() => setTopicRotation((v) => v + 1)}>
                          <RefreshCw className="mr-1 h-3 w-3" />
                          换一批
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {topicList.slice(0, 4).map((topic) => (
                          <Card key={topic.id} className="hover:bg-secondary/30">
                            <CardContent className="p-3">
                              <p className="mb-1 text-sm font-semibold leading-snug">{topic.title}</p>
                              <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                {topic.summary}
                              </p>
                              <div className="flex gap-1">
                                <Badge
                                  variant={topic.trend_direction === "up" ? "destructive" : topic.trend_direction === "down" ? "secondary" : "outline"}
                                  className="text-[10px]"
                                >
                                  {topic.trend_direction === "up" ? "↑ 上升" : topic.trend_direction === "down" ? "↓ 下降" : "→ 平稳"}
                                </Badge>
                                <Badge variant="outline" className="text-[10px]">
                                  热度 {Math.round(topic.current_heat ?? 0)}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      暂无选题建议
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  选择一个热点查看详情
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Trend + Source */}
      <div className="dp-item">
        <div className="flex gap-3">
          {/* Trend Analysis */}
          <div className="flex-1 rounded-xl border border-border/60 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">趋势分析</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {trends.length > 0
                  ? `${formatTime(trends[0]?.time)} — ${formatTime(trends[trends.length - 1]?.time)}`
                  : "暂无数据"}
              </span>
            </div>
            <div className="p-5">
              {trends.length > 0 ? (
                <div className="flex items-end gap-1" style={{ height: 160 }}>
                  {trends.map((point, index) => {
                    const pct = ((point.heat_score ?? 0) / trendMax) * 100;
                    return (
                      <div
                        key={index}
                        className="relative flex-1 rounded-t-sm transition-opacity hover:opacity-100"
                        style={{
                          height: `${Math.max(pct, 4)}%`,
                          minHeight: 4,
                          background: "var(--color-primary)",
                          opacity: 0.3 + (pct / 100) * 0.7,
                        }}
                        title={`${formatTime(point.time)}: ${Math.round(point.heat_score ?? 0)}`}
                      >
                        {trends.length <= 14 && (
                          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground">
                            {formatTime(point.time)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">暂无趋势数据</div>
              )}
            </div>
          </div>

          {/* Source Distribution */}
          <div className="flex-1 rounded-xl border border-border/60 bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">来源分布</span>
              </div>
              <span className="text-xs text-muted-foreground">公开源</span>
            </div>
            <div className="p-5">
              {sourceDistribution.length > 0 ? (
                <div className="space-y-4">
                  {sourceDistribution.map((source) => (
                    <div key={source.label}>
                      <div className="mb-1.5 flex justify-between text-xs">
                        <span>{source.label}</span>
                        <span className="font-semibold">{source.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${source.value}%`,
                            background: "var(--color-primary)",
                            opacity: 0.4 + (source.value / 100) * 0.6,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">暂无来源数据</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="dp-item">
        <div className="rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">通知列表</span>
            </div>
            <span className="text-xs text-muted-foreground">{notifications.length} 条未读</span>
          </div>
          <div className="p-5">
            {notifications.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-card p-3 hover:bg-secondary/30"
                  >
                    {item.delivery_status === "pending" ? (
                      <Clock className="h-5 w-5 shrink-0 text-primary" />
                    ) : (
                      <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadgeVariant(item.delivery_status)} className="text-[10px]">
                          {item.channel === "in_app" ? "站内" : item.channel ?? "未知"}
                        </Badge>
                        <span className="text-sm">{statusLabel[item.delivery_status ?? ""] ?? item.delivery_status}</span>
                      </div>
                      {item.created_at && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleString("zh-CN")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">暂无未读通知</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
