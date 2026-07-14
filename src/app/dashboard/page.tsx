"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Flame, Star, TrendingUp, BarChart3, Bell, CheckCircle, Clock, RefreshCw,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
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
  delivered: "已送达", pending: "待发送", skipped: "已跳过", failed: "发送失败",
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
    gsap.from(".dp-item", { y: 16, opacity: 0, duration: 0.4, stagger: 0.08, ease: "power3.out" });
  }, { dependencies: [pageState], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    try { const raw = localStorage.getItem("savedPostIds"); if (raw) setSavedIds(new Set(JSON.parse(raw))); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setPageState("loading");
      try {
        const monitorsRes = await listMonitors();
        const monitors = monitorsRes.data ?? [];
        if (monitors.length === 0) { if (!cancelled) setPageState("empty"); return; }
        const active = monitors.find((m) => m.status === "active") ?? monitors[0];
        const mid = active.id!;
        if (!cancelled) setMonitorName(active.name ?? active.query_text ?? "监控");
        const [postsRes, topicsRes, trendsRes, notifRes] = await Promise.all([
          listPosts({ id: mid, limit: 50 }), listTopics({ id: mid }),
          getMonitorTrends({ id: mid }), listNotifications(),
        ]);
        if (!cancelled) {
          const p = postsRes.data ?? []; setPosts(p);
          if (p.length > 0) setSelectedId(p[0].id ?? null);
          setTopics(topicsRes.data ?? []); setTrends(trendsRes.data ?? []);
          setNotifications(notifRes.data ?? []); setPageState("data");
        }
      } catch (err: any) { if (!cancelled) { setErrorMsg(err?.message ?? "加载失败"); setPageState("error"); } }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const sortedPosts = useMemo(() => [...posts].sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0)), [posts]);

  const selected = useMemo(() => sortedPosts.find((p) => p.id === selectedId) ?? sortedPosts[0], [sortedPosts, selectedId]);

  const topicList = useMemo(() => {
    const t = topics.length > 0 ? topics : [];
    if (t.length < 2) return t;
    const pivot = topicRotation % t.length;
    return [...t.slice(pivot), ...t.slice(0, pivot)];
  }, [topics, topicRotation]);

  const sourceDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const p of posts) { const key = p.author_handle || "未知"; counts[key] = (counts[key] ?? 0) + 1; total++; }
    return Object.entries(counts).map(([label, value]) => ({ label, value: Math.round((value / total) * 100) }))
      .sort((a, b) => b.value - a.value);
  }, [posts]);

  const toggleSave = (id: number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("savedPostIds", JSON.stringify([...next]));
      return next;
    });
  };

  const relevantCount = useMemo(() => posts.filter((p) => (p.relevance_score ?? 0) > 0.7).length, [posts]);
  const pendingNotifCount = useMemo(() => notifications.filter((n) => n.delivery_status === "pending").length, [notifications]);

  if (pageState === "error") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <Flame className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground/80">{errorMsg}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="h-8 text-xs">重试</Button>
        </div>
      </div>
    );
  }
  if (pageState === "loading") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }
  if (pageState === "empty") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Flame className="h-5 w-5 text-primary/60" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/80">暂无监控配置</p>
            <p className="mt-1 text-xs text-muted-foreground/60">请先在设置中创建监控</p>
          </div>
          <Button size="sm" onClick={() => { window.location.href = "/dashboard/settings"; }} className="h-8 text-xs">去设置</Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-3">
      {/* Header */}
      <div className="dp-item"><Card className="gradient-border-top overflow-hidden rounded-lg border-border/60"><CardContent className="relative p-5">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <span className="section-dot" />
            <span className="text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground">热点工作台</span>
          </div>
          <h3 className="mt-2 text-base font-semibold tracking-tight">公开源热点聚合 · AI 快速理解 · 内容选题生成</h3>
          <p className="mt-1 text-sm text-muted-foreground/80">监控「<span className="font-medium text-foreground/90">{monitorName}</span>」— 按热度、相关性和可创作价值排序</p>
        </div>
      </CardContent></Card></div>

      {/* Stats Row */}
      <div className="dp-item grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { title: "今日热点", value: posts.length, suffix: "条", desc: "实时抓取聚合" },
          { title: "高相关热点", value: relevantCount, suffix: `/${posts.length}`, desc: "相关性 > 0.7" },
          { title: "已收藏", value: savedIds.size, suffix: "篇", desc: "我的精选内容" },
          { title: "待处理通知", value: pendingNotifCount, suffix: "条", desc: "待发送通知" },
        ].map((s) => (
          <Card key={s.title} className="group relative overflow-hidden rounded-lg border-border/60 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_0_1px_rgba(0,122,255,0.15)]">
            <CardContent className="relative p-4">
              <div className="absolute -right-8 -top-8 h-16 w-16 rounded-full bg-primary/[0.03] transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
              <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground">{s.title}</p>
              <div className="flex items-baseline gap-1.5">
                <span className="stat-value-premium">{s.value}</span>
                {s.suffix && <span className="text-xs font-normal text-muted-foreground/60">{s.suffix}</span>}
              </div>
              <p className="mt-1 text-xs text-muted-foreground/40">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content: Post List + Detail */}
      <div className="dp-item"><div className="flex gap-3 flex-col lg:flex-row">
        {/* Left: Post List */}
        <div className="flex-1 rounded-lg border border-border/60 bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
            <div className="flex items-center gap-2"><Flame className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-semibold">热点榜单</span></div>
            <span className="text-xs text-muted-foreground/60">按综合评分排序</span>
          </div>
          <div className="divide-y divide-border/40">
            {sortedPosts.map((item, index) => (
              <div key={item.id} onClick={() => setSelectedId(item.id ?? null)}
                className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition-all duration-200 hover:bg-secondary/20 ${
                  item.id === selected?.id ? "border-l-2 border-primary bg-gradient-to-r from-primary/[0.04] to-transparent" : "border-l-2 border-transparent hover:border-primary/20"
                }`}>
                <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-bold ${
                  index === 0 ? "rank-gold" : index === 1 ? "rank-silver" : index === 2 ? "rank-bronze"
                  : "border border-border/40 text-muted-foreground bg-black/30"
                }`}>{index + 1}</div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm leading-snug ${item.id === selected?.id ? "font-semibold text-foreground" : "text-foreground/80 group-hover:text-foreground/90"}`}>{item.content_text?.slice(0, 80) ?? `Post #${item.id}`}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground/60">{(item.author_name || item.author_handle) ?? "未知"}{item.published_at ? ` · ${new Date(item.published_at).toLocaleDateString("zh-CN")}` : ""}</span>
                    {item.final_score != null && <Badge variant="default" className="h-5 text-xs px-1.5 font-semibold leading-none">{Math.round(item.final_score * 100)}</Badge>}
                    {item.heat_score != null && <Badge variant="outline" className="h-5 text-xs px-1.5 leading-none text-muted-foreground/80">{Math.round(item.heat_score * 100)}</Badge>}
                  </div>
                </div>
                {item.id != null && (
                  <button onClick={(e) => { e.stopPropagation(); toggleSave(item.id!); }}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground/40 transition-colors hover:bg-secondary/40 hover:text-primary">
                    {savedIds.has(item.id) ? <Star className="h-3.5 w-3.5 fill-primary text-primary" /> : <Star className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Detail Panel */}
        <div className="flex-[1.4] rounded-lg border border-border/60 bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
            <div className="flex items-center gap-2"><span className="section-dot" /><span className="text-sm font-semibold">快速理解</span></div>
            <div className="flex flex-wrap gap-1.5">
              {selected?.matched_keywords?.length ? selected.matched_keywords.map((kw) => <Badge key={kw} variant="default" className="h-5 text-xs px-2 font-medium">{kw}</Badge>)
                : <span className="text-xs text-muted-foreground/60">AI 摘要</span>}
            </div>
          </div>
          <div className="space-y-4 p-5">
            {selected ? (
              <>
                <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-a:text-primary prose-p:text-foreground/80 prose-headings:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content_text ?? "暂无内容"}</ReactMarkdown>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {[{ label: "阅读", value: selected.view_count ?? "-" }, { label: "点赞", value: selected.like_count ?? "-" },
                    { label: "回复", value: selected.reply_count ?? "-" }, { label: "转发", value: selected.repost_count ?? "-" },
                    { label: "引用", value: selected.quote_count ?? "-" },
                    { label: "新鲜度", value: selected.freshness_score != null ? `${Math.round(selected.freshness_score * 100)}%` : "-" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-md border border-border/40 bg-black/20 p-3 text-center transition-colors hover:border-primary/20">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground/60 uppercase">{stat.label}</p>
                      <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums">{stat.value}</p>
                    </div>
                  ))}
                </div>
                {topicList.length > 0 ? (
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2"><span className="section-dot" /><span className="text-sm font-semibold">内容选题</span></div>
                      <Button variant="outline" size="sm" onClick={() => setTopicRotation((v) => v + 1)} className="h-7 gap-1 text-xs px-2.5"><RefreshCw className="h-3 w-3" />换一批</Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      {topicList.slice(0, 4).map((topic) => (
                        <Card key={topic.id} className="group relative overflow-hidden rounded-lg border-border/50 transition-all duration-200 hover:border-primary/30 hover:shadow-[0_0_0_1px_rgba(0,122,255,0.12)]"><CardContent className="p-3.5">
                          <div className="absolute -right-6 -top-6 h-12 w-12 rounded-full bg-primary/[0.03] transition-all duration-500 group-hover:bg-primary/[0.06] group-hover:scale-150" />
                          <p className="relative mb-1.5 text-sm font-semibold leading-snug">{topic.title}</p>
                          <p className="relative mb-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground/80">{topic.summary}</p>
                          <div className="relative flex gap-1.5">
                            <Badge variant={topic.trend_direction === "up" ? "destructive" : topic.trend_direction === "down" ? "secondary" : "outline"} className="h-5 text-xs px-2 leading-none">
                              {topic.trend_direction === "up" ? "↑ 上升" : topic.trend_direction === "down" ? "↓ 下降" : "→ 平稳"}
                            </Badge>
                            <Badge variant="outline" className="h-5 text-xs px-2 leading-none text-muted-foreground/80">热度 {Math.round(topic.current_heat ?? 0)}</Badge>
                          </div>
                        </CardContent></Card>
                      ))}
                    </div>
                  </div>
                ) : <div className="py-8 text-center text-xs text-muted-foreground/60">暂无选题建议</div>}
              </>
            ) : <div className="py-10 text-center text-xs text-muted-foreground/60">选择一个热点查看详情</div>}
          </div>
        </div>
      </div></div>

      {/* Trend + Source */}
      <div className="dp-item"><div className="flex gap-3 flex-col lg:flex-row">
        {/* Trend */}
        <div className="flex-1 rounded-lg border border-border/60 bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
            <div className="flex items-center gap-2"><TrendingUp className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-semibold">趋势分析</span></div>
            <span className="text-xs text-muted-foreground/60">{trends.length > 0 ? `${formatTime(trends[0]?.time)} — ${formatTime(trends[trends.length - 1]?.time)}` : "暂无数据"}</span>
          </div>
          <div className="p-5">
            {trends.length > 0 ? (
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={trends.map(p => ({ ...p, timeLabel: formatTime(p.time) }))} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} interval="preserveStartEnd" />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(17,17,17,0.9)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "var(--color-foreground)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                      }}
                      formatter={(value: any) => [`${Math.round(Number(value))}`, "热度"]}
                      labelStyle={{ color: "var(--color-muted-foreground)" }}
                    />
                    <Area type="monotone" dataKey="heat_score" stroke="var(--color-primary)" strokeWidth={2} fill="url(#trendGradient)" dot={false} activeDot={{ r: 4, fill: "var(--color-primary)", strokeWidth: 2, stroke: "var(--color-background)" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="py-8 text-center text-xs text-muted-foreground/60">暂无趋势数据</div>}
          </div>
        </div>
        {/* Source */}
        <div className="flex-1 rounded-lg border border-border/60 bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
            <div className="flex items-center gap-2"><BarChart3 className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-semibold">来源分布</span></div>
            <span className="text-xs text-muted-foreground/60">公开源</span>
          </div>
          <div className="p-5">
            {sourceDistribution.length > 0 ? (
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={sourceDistribution} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: -8 }} barCategoryGap={8}>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }} width={50} />
                    <Tooltip
                      contentStyle={{
                        background: "rgba(17,17,17,0.9)",
                        backdropFilter: "blur(8px)",
                        WebkitBackdropFilter: "blur(8px)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "var(--color-foreground)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                      }}
                      formatter={(value: any) => [`${value}%`, "占比"]}
                    />
                    <Bar dataKey="value" radius={[0, 3, 3, 0]} fill="var(--color-primary)" opacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="py-8 text-center text-xs text-muted-foreground/60">暂无来源数据</div>}
          </div>
        </div>
      </div></div>

      {/* Notifications */}
      <div className="dp-item">
        <div className="rounded-lg border border-border/60 bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-3.5">
            <div className="flex items-center gap-2"><Bell className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm font-semibold">通知列表</span></div>
            <span className="text-xs text-muted-foreground/60">{notifications.length} 条未读</span>
          </div>
          <div className="p-5">
            {notifications.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2">
                {notifications.map((item) => (
                  <div key={item.id} className="group flex items-center gap-3 rounded-lg border border-border/40 bg-black/20 p-3 transition-all duration-200 hover:border-primary/25 hover:bg-primary/[0.03] hover:shadow-[0_0_0_1px_rgba(0,122,255,0.08)]">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      item.delivery_status === "pending" ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-400"
                    }`}>
                      {item.delivery_status === "pending" ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusBadgeVariant(item.delivery_status)} className="h-5 text-xs px-1.5 leading-none">{item.channel === "in_app" ? "站内" : item.channel ?? "未知"}</Badge>
                        <span className="text-xs text-muted-foreground/80">{statusLabel[item.delivery_status ?? ""] ?? item.delivery_status}</span>
                      </div>
                      {item.created_at && <p className="mt-1 text-xs text-muted-foreground/50">{new Date(item.created_at).toLocaleString("zh-CN")}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : <div className="py-8 text-center text-xs text-muted-foreground/60">暂无未读通知</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
