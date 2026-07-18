"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, BookOpen, Check, FileText, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getEvents,
  getEventsId,
  getEventsIdContents,
  getEventsIdHeat,
  getEventsIdIntelligence,
  postEventsIdIntelligenceExtract,
  postEventsIdIntelligenceSummaryRegenerate,
} from "@/services/hotkey/hotkey-server/events";
import { getContentsId } from "@/services/hotkey/hotkey-server/contents";
import { getContents } from "@/services/hotkey/hotkey-server/contents";
import { getCollectionRuns } from "@/services/hotkey/hotkey-server/collectionRuns";
import { getMonitors } from "@/services/hotkey/hotkey-server/monitors";
import { getOperationsOverview } from "@/services/hotkey/hotkey-server/operations";
import { getReports, postReportsIdBuild, postReportsIdPreview } from "@/services/hotkey/hotkey-server/reports";
import { EventAction, ReportAction, WorkspaceTab } from "@/lib/domainEnums";
import { EmptyWorkspace } from "@/components/dashboard/EmptyWorkspace";

const formatDateTime = (value?: string) => value
  ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
  : "—";

const score = (value?: number) => value == null ? "—" : Math.round(value).toString();

export default function DashboardPage() {
  const [events, setEvents] = useState<HotKeyAPI.EventResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [selected, setSelected] = useState<HotKeyAPI.EventResponse>();
  const [heat, setHeat] = useState<HotKeyAPI.HeatResponse>();
  const [intelligence, setIntelligence] = useState<HotKeyAPI.EventIntelligenceResponse>();
  const [contents, setContents] = useState<HotKeyAPI.ContentResponse[]>([]);
  const [reports, setReports] = useState<HotKeyAPI.ReportResponse[]>([]);
  const [monitors, setMonitors] = useState<HotKeyAPI.MonitorResponse[]>([]);
  const [overview, setOverview] = useState<HotKeyAPI.RuntimeOverview>();
  const [collectionRuns, setCollectionRuns] = useState<HotKeyAPI.CollectionRunResponse[]>([]);
  const [collectedContents, setCollectedContents] = useState<HotKeyAPI.ContentResponse[]>([]);
  const [tab, setTab] = useState<WorkspaceTab>(WorkspaceTab.Evidence);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [action, setAction] = useState<
    EventAction | ReportAction.Build | ReportAction.Preview
  >();
  const [error, setError] = useState<string>();

  const loadWorkspace = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const [eventResult, reportResult, monitorResult, overviewResult, runResult, contentResult] = await Promise.all([
        getEvents({ limit: 50 }),
        getReports({ limit: 20 }),
        getMonitors({ limit: 100 }),
        getOperationsOverview().catch(() => undefined),
        getCollectionRuns({ limit: 50 }),
        getContents({ limit: 50 }),
      ]);
      const nextEvents = eventResult.data?.items ?? [];
      setEvents(nextEvents);
      setReports(reportResult.data?.items ?? []);
      setMonitors(monitorResult.data?.items ?? []);
      setOverview(overviewResult?.data);
      setCollectionRuns(runResult.data?.items ?? []);
      setCollectedContents(contentResult.data?.items ?? []);
      setSelectedId((current) => current ?? nextEvents[0]?.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "工作台加载失败");
    } finally { setLoading(false); }
  }, []);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    try {
      const eventResult = await getEventsId({ id });
      setSelected(eventResult.data);
      const [heatResult, intelligenceResult, memberResult] = await Promise.allSettled([
        getEventsIdHeat({ id }),
        getEventsIdIntelligence({ id }),
        getEventsIdContents({ id }),
      ]);
      setHeat(heatResult.status === "fulfilled" ? heatResult.value.data : undefined);
      setIntelligence(
        intelligenceResult.status === "fulfilled"
          ? intelligenceResult.value.data
          : undefined,
      );
      const members =
        memberResult.status === "fulfilled"
          ? (memberResult.value.data?.items ?? [])
          : [];
      const contentResults = await Promise.allSettled(
        members.slice(0, 8).filter((member) => member.content_id != null).map((member) => getContentsId({ id: member.content_id! })),
      );
      setContents(contentResults.flatMap((result) => result.status === "fulfilled" && result.value.data ? [result.value.data] : []));
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "事件详情加载失败");
    } finally { setDetailLoading(false); }
  }, []);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);
  useEffect(() => { if (selectedId != null) loadDetail(selectedId); }, [loadDetail, selectedId]);

  const sortedEvents = useMemo(() => [...events].sort((a, b) => (b.heat_score ?? 0) - (a.heat_score ?? 0)), [events]);
  const chartData = useMemo(() => sortedEvents.slice(0, 6).map((event) => ({
    name: event.title_zh?.slice(0, 8) || `#${event.id}`,
    heat: event.heat_score ?? 0,
  })).reverse(), [sortedEvents]);
  const relatedReport = reports.find((report) => report.monitor_id != null) ?? reports[0];

  const runEventAction = async (kind: EventAction) => {
    if (selectedId == null) return;
    setAction(kind);
    try {
      if (kind === EventAction.Summary) await postEventsIdIntelligenceSummaryRegenerate({ id: selectedId });
      else await postEventsIdIntelligenceExtract({ id: selectedId });
      await loadDetail(selectedId);
      toast.success(kind === EventAction.Summary ? "事件摘要已重新生成" : "事件实体与声明已重新提取");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "操作失败"); }
    finally { setAction(undefined); }
  };

  const runReportAction = async (kind: ReportAction.Build | ReportAction.Preview) => {
    if (relatedReport?.id == null) return;
    setAction(kind);
    try {
      if (kind === ReportAction.Build) await postReportsIdBuild({ id: relatedReport.id });
      else await postReportsIdPreview({ id: relatedReport.id });
      await loadWorkspace();
      toast.success(kind === ReportAction.Build ? "报告构建任务已提交" : "报告预览已刷新");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "报告操作失败"); }
    finally { setAction(undefined); }
  };

  if (loading) return <div className="flex min-h-[calc(100vh-60px)] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (error) return <div className="app-page"><div className="panel p-10 text-center"><p className="text-sm text-destructive">{error}</p><Button onClick={loadWorkspace} variant="outline" className="mt-4">重新加载</Button></div></div>;
  if (!events.length)
    return <EmptyWorkspace monitors={monitors} overview={overview} collectionRuns={collectionRuns} collectedContents={collectedContents} />;

  return (
    <div className="grid min-h-[calc(100vh-60px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_460px]">
      <section className="min-w-0 border-r border-border px-5 py-7 lg:px-11">
        <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between">
          <div><p className="text-lg font-semibold">Editorial Intelligence Canvas</p><p className="mt-1 text-xs text-muted-foreground">发现事件，验证证据，生成可发布报告</p></div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date())}</span><span>·</span><span>事件 {events.length}</span><Button size="icon" variant="ghost" onClick={loadWorkspace} className="h-7 w-7"><RefreshCw className="h-3.5 w-3.5" /></Button></div>
        </div>

        <div className="py-7">
          <div className="flex items-center gap-2"><h1 className="text-sm font-semibold">今日值得关注</h1><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /><span className="text-xs text-muted-foreground">{sortedEvents.length} 个事件</span></div>
          {detailLoading || !selected ? <div className="flex h-56 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : <>
            <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-semibold leading-tight">{selected.title_zh || selected.title_en || `事件 #${selected.id}`}</h2><Badge variant="outline" className="border-blue-500/40 bg-blue-500/10 text-blue-400">{selected.trend_status || "事件"}</Badge></div><p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{selected.summary || "该事件尚未生成摘要，可在右侧重新生成事件情报。"}</p></div>
              <a href="/dashboard/reports"><Button className="shrink-0 gap-2">进入报告 <ArrowUpRight className="h-3.5 w-3.5" /></Button></a>
            </div>
            <div className="mt-6 grid grid-cols-2 divide-x divide-border border-y border-border py-4 sm:grid-cols-4">
              {[{ label: "热度", value: score(heat?.heat_score ?? selected.heat_score), tone: "signal-text" }, { label: "趋势", value: score(heat?.trend_score ?? selected.trend_score), tone: "signal-text" }, { label: "确认来源", value: heat?.source_count == null ? "—" : `${heat.source_count} 个`, tone: "signal-text" }, { label: "内容证据", value: heat?.content_count == null ? "—" : `${heat.content_count} 条`, tone: "success-text" }].map((item) => <div key={item.label} className="px-4 first:pl-0"><p className="text-xs text-muted-foreground">{item.label}</p><p className={`mono mt-2 text-xl font-medium ${item.tone}`}>{item.value}</p></div>)}
            </div>
          </>}
        </div>

        <div className="flex gap-7 border-b border-border">
          {([[WorkspaceTab.Signal, "信号"], [WorkspaceTab.Evidence, "证据"], [WorkspaceTab.Report, "报告"]] as const).map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`relative pb-3 text-sm ${tab === value ? "text-blue-400" : "text-muted-foreground hover:text-foreground"}`}>{label}{tab === value && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500" />}</button>)}
        </div>

        {tab === WorkspaceTab.Evidence && <div className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_240px]">
          <div><h3 className="text-sm font-medium">证据叙事（按时间）</h3><div className="mt-5 border-l border-border pl-5">{contents.length ? contents.map((content) => <article key={content.id} className="relative border-b border-border py-4 first:pt-0"><span className="absolute -left-[25px] top-5 h-2 w-2 rounded-full border-2 border-blue-500 bg-black" /><div className="flex flex-wrap items-center gap-2 text-xs"><span className="signal-text mono">{formatDateTime(content.published_at)}</span><span className="font-medium">{content.source_name || content.source_type || "来源"}</span><span className="ml-auto text-muted-foreground">{content.language}</span></div><p className="mt-2 text-sm font-medium leading-6">{content.title || content.external_id || `内容 #${content.id}`}</p><div className="mt-2 flex gap-4 text-xs text-muted-foreground"><span>浏览 {content.metrics?.view_count ?? "—"}</span><span>互动 {(content.metrics?.like_count ?? 0) + (content.metrics?.comment_count ?? 0) + (content.metrics?.share_count ?? 0)}</span>{content.canonical_url && <a href={content.canonical_url} target="_blank" rel="noreferrer" className="ml-auto text-blue-400">查看来源</a>}</div></article>) : <p className="py-10 text-sm text-muted-foreground">该事件暂时没有可读取的内容证据。</p>}</div></div>
          <div className="panel h-fit p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-medium">事件热度对比</h3><span className="text-xs text-muted-foreground">Top 6</span></div><div className="mt-4 h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} tick={{ fill: "#777", fontSize: 10 }} /><Tooltip contentStyle={{ background: "#0a0a0a", border: "1px solid #242424", borderRadius: 6, fontSize: 11 }} /><Bar dataKey="heat" fill="#3b82f6" radius={[0, 3, 3, 0]} /></BarChart></ResponsiveContainer></div></div>
        </div>}

        {tab === WorkspaceTab.Signal && <div className="divide-y divide-border py-2">{sortedEvents.slice(0, 12).map((event, index) => <button key={event.id} onClick={() => setSelectedId(event.id)} className={`grid w-full grid-cols-[32px_minmax(0,1fr)_80px] items-center gap-3 py-4 text-left ${event.id === selectedId ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}><span className="mono text-xs">{String(index + 1).padStart(2, '0')}</span><span><span className="block truncate text-sm font-medium">{event.title_zh || event.title_en || `事件 #${event.id}`}</span><span className="mt-1 block text-xs text-muted-foreground">{formatDateTime(event.last_seen_at)} · {event.lifecycle_status}</span></span><span className="mono text-right text-sm signal-text">{score(event.heat_score)}</span></button>)}</div>}

        {tab === WorkspaceTab.Report && <div className="py-6">{reports.length ? <div className="divide-y divide-border">{reports.slice(0, 8).map((report) => <a key={report.id} href="/dashboard/reports" className="grid grid-cols-[minmax(0,1fr)_100px] gap-4 py-4 text-foreground no-underline"><span><span className="block text-sm font-medium">{report.title || `报告 #${report.id}`}</span><span className="mt-1 block text-xs text-muted-foreground">{report.summary || `${report.type || "报告"} · ${formatDateTime(report.generated_at)}`}</span></span><span className="text-right text-xs text-muted-foreground">{report.status}</span></a>)}</div> : <p className="py-10 text-sm text-muted-foreground">暂时没有可用报告。</p>}</div>}

        <div className="border-t border-border py-5"><h3 className="text-sm font-medium">其他高潜事件</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{sortedEvents.slice(1,4).map((event, index) => <button key={event.id} onClick={() => setSelectedId(event.id)} className="flex min-w-0 items-center gap-3 border-r border-border pr-3 text-left last:border-0"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-foreground text-xs font-semibold text-background">{index + 1}</span><span className="min-w-0"><span className="block truncate text-xs font-medium">{event.title_zh || event.title_en}</span><span className="mono mt-1 block text-[11px] text-muted-foreground">热度 {score(event.heat_score)} · 趋势 {score(event.trend_score)}</span></span></button>)}</div></div>
      </section>

      <aside className="bg-[#030303] px-5 py-7 lg:px-7">
        <div className="flex items-start justify-between border-b border-border pb-5"><div><h2 className="text-base font-semibold">事件情报与报告</h2><p className="mt-1 text-xs text-muted-foreground">所有操作均由后端任务执行</p></div><Sparkles className="h-4 w-4 text-muted-foreground" /></div>
        <div className="py-6"><p className="text-xs font-medium">已验证声明</p><div className="mt-3 space-y-2">{intelligence?.claims?.length ? intelligence.claims.slice(0,4).map((claim) => <div key={claim.id ?? claim.claim_hash} className="panel p-3"><div className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" /><p className="text-xs leading-5">{claim.normalized_claim}</p></div><div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{claim.evidence?.length ?? 0} 条证据</span><span className="mono">置信度 {claim.confidence == null ? "—" : Math.round(claim.confidence * 100)}</span></div></div>) : <div className="panel p-5 text-xs text-muted-foreground">暂无已验证声明，可重新提取事件情报。</div>}</div></div>
        <div className="border-t border-border py-6"><p className="text-xs font-medium">情报任务</p><div className="mt-3 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => runEventAction(EventAction.Extract)} disabled={!!action} className="gap-2 text-xs">{action === EventAction.Extract ? <Loader2 className="animate-spin" /> : <BookOpen />}提取实体</Button><Button onClick={() => runEventAction(EventAction.Summary)} disabled={!!action} className="gap-2 text-xs">{action === EventAction.Summary ? <Loader2 className="animate-spin" /> : <Sparkles />}重新生成摘要</Button></div></div>
        <div className="border-t border-border py-6"><div className="flex items-center justify-between"><p className="text-xs font-medium">关联报告</p><a href="/dashboard/reports" className="text-[11px] text-blue-400">查看全部</a></div>{relatedReport ? <div className="panel mt-3 p-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /><p className="truncate text-sm font-medium">{relatedReport.title || `报告 #${relatedReport.id}`}</p></div><p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{relatedReport.summary || "该报告尚未生成摘要。"}</p><div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground"><span>{relatedReport.type}</span><span>{relatedReport.status}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => runReportAction(ReportAction.Preview)} disabled={!!action} className="text-xs">预览</Button><Button onClick={() => runReportAction(ReportAction.Build)} disabled={!!action} className="text-xs">构建报告</Button></div></div> : <div className="panel mt-3 p-5 text-xs text-muted-foreground">后端尚未生成报告记录。</div>}</div>
        <div className="border-t border-border pt-5 text-[11px] leading-5 text-muted-foreground"><p>事件 ID：{selected?.id ?? "—"}</p><p>情报实体：{intelligence?.entities?.length ?? 0}</p><p>最近计算：{formatDateTime(heat?.captured_at || selected?.calculated_at)}</p></div>
      </aside>
    </div>
  );
}
