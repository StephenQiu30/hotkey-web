"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { EventEvidenceTimeline } from "@/components/dashboard/EventEvidenceTimeline";
import { EventHeatComparison } from "@/components/dashboard/EventHeatComparison";

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
  const [evidenceTotal, setEvidenceTotal] = useState(0);
  const [evidenceFailures, setEvidenceFailures] = useState(0);
  const [evidenceUnavailable, setEvidenceUnavailable] = useState(false);
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
    setContents([]);
    setEvidenceTotal(0);
    setEvidenceFailures(0);
    setEvidenceUnavailable(false);
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
      if (memberResult.status === "rejected") {
        setEvidenceUnavailable(true);
        return;
      }
      const members = memberResult.value.data?.items ?? [];
      setEvidenceTotal(members.length);
      const memberContentIds = members.flatMap((member) =>
        member.content_id == null ? [] : [member.content_id],
      );
      const contentResults = await Promise.allSettled(
        memberContentIds.map((contentId) => getContentsId({ id: contentId })),
      );
      const readableContents = contentResults.flatMap((result) =>
        result.status === "fulfilled" && result.value.data ? [result.value.data] : [],
      );
      setContents(readableContents);
      setEvidenceFailures(members.length - readableContents.length);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "事件详情加载失败");
    } finally { setDetailLoading(false); }
  }, []);

  useEffect(() => { loadWorkspace(); }, [loadWorkspace]);
  useEffect(() => { if (selectedId != null) loadDetail(selectedId); }, [loadDetail, selectedId]);

  const sortedEvents = useMemo(() => [...events].sort((a, b) => (b.heat_score ?? 0) - (a.heat_score ?? 0)), [events]);
  const recentReport = reports[0];

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
    if (recentReport?.id == null) return;
    setAction(kind);
    try {
      if (kind === ReportAction.Build) await postReportsIdBuild({ id: recentReport.id });
      else await postReportsIdPreview({ id: recentReport.id });
      await loadWorkspace();
      toast.success(kind === ReportAction.Build ? "报告构建任务已提交" : "报告预览已刷新");
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "报告操作失败"); }
    finally { setAction(undefined); }
  };

  if (loading) return <div className="flex min-h-[calc(100vh-68px)] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>;
  if (error) return <div className="app-page"><div className="panel p-10 text-center"><p className="text-sm text-destructive">{error}</p><Button onClick={loadWorkspace} variant="outline" className="mt-4">重新加载</Button></div></div>;
  if (!events.length)
    return <EmptyWorkspace monitors={monitors} overview={overview} collectionRuns={collectionRuns} collectedContents={collectedContents} />;

  return (
    <div data-testid="dashboard-shell" className="app-page !py-0">
      <div data-testid="dashboard-workspace" className="grid min-h-[calc(100vh-68px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 px-1 py-7 sm:px-5 lg:px-8 xl:border-r xl:border-border">
          <div className="flex flex-col gap-4 pb-7 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-[-.035em] text-slate-950">热点态势中心</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />监控运行中
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">追踪正在加速的事件，验证来源证据，形成可交付情报</p>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-white px-3 py-2 text-xs text-muted-foreground shadow-sm">
              <span>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(new Date())}</span>
              <span className="h-3 w-px bg-border" />
              <span>{events.length} 个活跃事件</span>
              <Button aria-label="刷新工作台数据" title="刷新工作台数据" size="icon" variant="ghost" onClick={loadWorkspace} className="h-7 w-7 text-blue-700"><RefreshCw className="h-3.5 w-3.5" /></Button>
            </div>
          </div>

          <div className="panel overflow-hidden border-blue-100 shadow-[0_12px_40px_rgba(30,83,160,.07)]">
            <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/70 px-5 py-3.5 sm:px-6">
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" /><p className="text-xs font-semibold text-blue-800">今日首要关注</p></div>
              <span className="text-[11px] text-blue-700">按综合热度排序 · {sortedEvents.length} 个事件</span>
            </div>
            {detailLoading || !selected ? (
              <div className="flex h-72 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
            ) : (
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl font-bold leading-tight tracking-[-.025em] text-slate-950">{selected.title_zh || selected.title_en || `事件 #${selected.id}`}</h2>
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">{selected.trend_status || "持续追踪"}</Badge>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{selected.summary || "该事件尚未生成摘要，可使用右侧 AI 情报助手生成最新研判。"}</p>
                  </div>
                  <Button asChild className="shrink-0 gap-2"><a href="/dashboard/reports">进入报告 <ArrowUpRight className="h-3.5 w-3.5" /></a></Button>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "综合热度", value: score(heat?.heat_score ?? selected.heat_score), tone: "text-blue-700", meta: "实时评分" },
                    { label: "上升趋势", value: score(heat?.trend_score ?? selected.trend_score), tone: "text-blue-700", meta: "近 24 小时" },
                    { label: "确认来源", value: heat?.source_count == null ? "—" : `${heat.source_count}`, tone: "text-slate-900", meta: "独立信源" },
                    { label: "内容证据", value: heat?.content_count == null ? "—" : `${heat.content_count}`, tone: "text-emerald-700", meta: "可追溯内容" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-border bg-slate-50/70 p-3.5">
                      <p className="text-[11px] text-muted-foreground">{item.label}</p>
                      <p className={`mono mt-1.5 text-2xl font-semibold ${item.tone}`}>{item.value}</p>
                      <p className="mt-1 text-[9px] text-muted-foreground">{item.meta}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 inline-flex gap-1 rounded-xl border border-border bg-white p-1 shadow-sm">
            {([[WorkspaceTab.Signal, "信号"], [WorkspaceTab.Evidence, "证据"], [WorkspaceTab.Report, "报告"]] as const).map(([value, label]) => (
              <button key={value} onClick={() => setTab(value)} className={`rounded-lg px-4 py-2 text-xs font-medium transition-colors ${tab === value ? "bg-blue-600 text-white shadow-sm" : "text-muted-foreground hover:bg-blue-50 hover:text-blue-700"}`}>{label}</button>
            ))}
          </div>

          {tab === WorkspaceTab.Evidence && <EventEvidenceTimeline contents={contents} failedCount={evidenceFailures} totalCount={evidenceTotal} unavailable={evidenceUnavailable} />}

          {tab === WorkspaceTab.Signal && (
            <div className="space-y-6 py-6">
              <EventHeatComparison events={sortedEvents} />
              <div className="panel divide-y divide-border px-5">
                {sortedEvents.slice(0, 12).map((event, index) => (
                  <button key={event.id} onClick={() => setSelectedId(event.id)} className={`grid w-full grid-cols-[32px_minmax(0,1fr)_80px] items-center gap-3 py-4 text-left ${event.id === selectedId ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                    <span className="mono text-xs text-blue-600">{String(index + 1).padStart(2, "0")}</span>
                    <span><span className="block truncate text-sm font-medium">{event.title_zh || event.title_en || `事件 #${event.id}`}</span><span className="mt-1 block text-xs text-muted-foreground">{formatDateTime(event.last_seen_at)} · {event.lifecycle_status}</span></span>
                    <span className="mono text-right text-sm font-semibold text-blue-700">{score(event.heat_score)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === WorkspaceTab.Report && <div className="py-6">{reports.length ? <div className="panel divide-y divide-border px-5">{reports.slice(0, 8).map((report) => <a key={report.id} href="/dashboard/reports" className="grid grid-cols-[minmax(0,1fr)_100px] gap-4 py-4 text-foreground no-underline"><span><span className="block text-sm font-medium">{report.title || `报告 #${report.id}`}</span><span className="mt-1 block text-xs text-muted-foreground">{report.summary || `${report.type || "报告"} · ${formatDateTime(report.generated_at)}`}</span></span><span className="text-right text-xs text-muted-foreground">{report.status}</span></a>)}</div> : <p className="panel py-10 text-center text-sm text-muted-foreground">暂时没有可用报告。</p>}</div>}

          <div className="border-t border-border py-6">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">其他高潜事件</h3><span className="text-[11px] text-muted-foreground">点击切换关注事件</span></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {sortedEvents.slice(1, 4).map((event, index) => (
                <button key={event.id} onClick={() => setSelectedId(event.id)} className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-white p-3 text-left shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50/50">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700">{index + 1}</span>
                  <span className="min-w-0"><span className="block truncate text-xs font-medium">{event.title_zh || event.title_en}</span><span className="mono mt-1 block text-[10px] text-muted-foreground">热度 {score(event.heat_score)} · 趋势 {score(event.trend_score)}</span></span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="static max-h-none overflow-visible border-t border-border bg-transparent px-1 py-7 sm:px-5 xl:sticky xl:top-[84px] xl:max-h-[calc(100vh-100px)] xl:self-start xl:overflow-y-auto xl:border-t-0 xl:px-6">
          <div className="panel overflow-hidden">
            <div className="flex items-start justify-between border-b border-blue-100 bg-blue-50/70 p-5">
              <div><p className="eyebrow">AI COPILOT</p><h2 className="mt-1.5 text-base font-semibold">AI 情报助手</h2><p className="mt-1 text-xs text-muted-foreground">基于事件证据生成实时研判</p></div>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm"><Sparkles className="h-4 w-4" /></span>
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold">已验证声明</p>
              <div className="mt-3 space-y-2">
                {intelligence?.claims?.length ? intelligence.claims.slice(0, 4).map((claim) => (
                  <div key={claim.id ?? claim.claim_hash} className="rounded-xl border border-border bg-slate-50/60 p-3">
                    <div className="flex items-start gap-2"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" /><p className="text-xs leading-5">{claim.normalized_claim}</p></div>
                    <div className="mt-2 flex justify-between text-[10px] text-muted-foreground"><span>{claim.evidence?.length ?? 0} 条证据</span><span className="mono">置信度 {claim.confidence == null ? "—" : Math.round(claim.confidence * 100)}</span></div>
                  </div>
                )) : <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/40 p-5 text-xs leading-5 text-muted-foreground">暂无已验证声明，可重新提取事件情报。</div>}
              </div>
            </div>
            <div className="border-t border-border p-5"><p className="text-xs font-semibold">情报任务</p><div className="mt-3 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => runEventAction(EventAction.Extract)} disabled={!!action} className="gap-2 text-xs">{action === EventAction.Extract ? <Loader2 className="animate-spin" /> : <BookOpen />}提取实体</Button><Button onClick={() => runEventAction(EventAction.Summary)} disabled={!!action} className="gap-2 text-xs">{action === EventAction.Summary ? <Loader2 className="animate-spin" /> : <Sparkles />}生成摘要</Button></div></div>
            <div className="border-t border-border p-5"><div className="flex items-center justify-between"><p className="text-xs font-semibold">最近报告</p><a href="/dashboard/reports" className="text-[11px] font-medium text-blue-700">查看全部</a></div>{recentReport ? <div className="mt-3 rounded-xl border border-border p-4"><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /><p className="truncate text-sm font-medium">{recentReport.title || `报告 #${recentReport.id}`}</p></div><p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{recentReport.summary || "该报告尚未生成摘要。"}</p><div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground"><span>{recentReport.type}</span><span>{recentReport.status}</span></div><div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => runReportAction(ReportAction.Preview)} disabled={!!action} className="text-xs">预览</Button><Button onClick={() => runReportAction(ReportAction.Build)} disabled={!!action} className="text-xs">构建报告</Button></div></div> : <div className="mt-3 rounded-xl border border-dashed border-border p-5 text-xs text-muted-foreground">后端尚未生成报告记录。</div>}</div>
            <div className="grid grid-cols-3 border-t border-border bg-slate-50/70 px-5 py-4 text-center text-[10px] text-muted-foreground"><div><p className="mono text-sm font-semibold text-slate-800">{selected?.id ?? "—"}</p><p className="mt-1">事件 ID</p></div><div className="border-x border-border"><p className="mono text-sm font-semibold text-slate-800">{intelligence?.entities?.length ?? 0}</p><p className="mt-1">情报实体</p></div><div><p className="mono text-[11px] font-semibold text-slate-800">{formatDateTime(heat?.captured_at || selected?.calculated_at)}</p><p className="mt-1">最近计算</p></div></div>
          </div>
        </aside>
      </div>
    </div>
  );
}
