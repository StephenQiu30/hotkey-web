"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { EventAction, ReportAction, UserRole, WorkspaceTab } from "@/lib/domainEnums";
import { useAuthStore } from "@/stores/authStore";
import { EmptyWorkspace } from "@/components/dashboard/EmptyWorkspace";
import { EventEvidenceTimeline } from "@/components/dashboard/EventEvidenceTimeline";
import { EventHeatComparison } from "@/components/dashboard/EventHeatComparison";

const formatDateTime = (value?: string) => value
  ? new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value))
  : "—";

const score = (value?: number) => value == null ? "—" : Math.round(value).toString();

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const canManageOperations = user?.role === UserRole.Editor || user?.role === UserRole.Admin;
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
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [action, setAction] = useState<
    EventAction | ReportAction.Build | ReportAction.Preview
  >();
  const [error, setError] = useState<string>();

  const loadWorkspace = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const runtimeRequest = canManageOperations
        ? Promise.allSettled([
            getOperationsOverview(),
            getCollectionRuns({ limit: 50 }),
          ])
        : undefined;
      const [eventResult, reportResult, monitorResult, contentResult] = await Promise.all([
        getEvents({ limit: 50 }),
        getReports({ limit: 20 }),
        getMonitors({ limit: 100 }),
        getContents({ limit: 50 }),
      ]);
      const nextEvents = eventResult.data?.items ?? [];
      setEvents(nextEvents);
      setReports(reportResult.data?.items ?? []);
      setMonitors(monitorResult.data?.items ?? []);
      setCollectedContents(contentResult.data?.items ?? []);
      if (runtimeRequest) {
        const [overviewResult, runResult] = await runtimeRequest;
        setOverview(overviewResult.status === "fulfilled" ? overviewResult.value.data : undefined);
        setCollectionRuns(runResult.status === "fulfilled" ? runResult.value.data?.items ?? [] : []);
      } else {
        setOverview(undefined);
        setCollectionRuns([]);
      }
      setSelectedId((current) => current ?? nextEvents[0]?.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "工作台加载失败");
    } finally { setLoading(false); }
  }, [canManageOperations]);

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
    <div data-testid="dashboard-shell" className="app-page !max-w-none !p-0">
      <div
        data-testid="dashboard-workspace"
        className="grid min-h-[calc(100vh-68px)] grid-cols-1 bg-white xl:grid-cols-[minmax(0,1.16fr)_minmax(420px,.84fr)]"
      >
        <section className="min-w-0 px-5 py-7 sm:px-8 lg:px-10 xl:px-12">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="secondary" className="gap-1.5 rounded-md bg-emerald-50 font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />监控运行中
            </Badge>
            <span>{new Intl.DateTimeFormat("zh-CN", { dateStyle: "long" }).format(new Date())}</span>
            <span>{events.length} 个活跃事件</span>
            <Button aria-label="刷新工作台数据" title="刷新工作台数据" size="icon" variant="ghost" onClick={loadWorkspace} className="ml-auto h-8 w-8 text-blue-700">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Separator className="mt-5" />

          {detailLoading || !selected ? (
            <div className="flex min-h-[520px] items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-blue-600" /></div>
          ) : (
            <>
              <article className="py-8 sm:py-10">
                <p className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />今日重点事件
                </p>
                <div className="mt-5 flex flex-col gap-6 2xl:flex-row 2xl:items-start 2xl:justify-between">
                  <div className="min-w-0 max-w-3xl">
                    <h1 className="text-[2rem] font-bold leading-[1.28] tracking-[-.035em] text-slate-950 sm:text-[2.35rem]">
                      {selected.title_zh || selected.title_en || `事件 #${selected.id}`}
                    </h1>
                    <Badge variant="outline" className="mt-4 border-blue-200 bg-blue-50 text-blue-700">
                      {selected.trend_status || "持续追踪"}
                    </Badge>
                    <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-600">
                      {selected.summary || "该事件正在持续聚合公开来源。HotKey 会在证据可用后补充中文摘要与关键结论。"}
                    </p>
                  </div>
                  <Button asChild className="self-start shrink-0 gap-2 2xl:mt-1">
                    <a href="/dashboard/reports">查看完整报告 <ArrowUpRight className="h-3.5 w-3.5" /></a>
                  </Button>
                </div>

                <Separator className="mt-7" />
                <div className="flex flex-wrap gap-x-6 gap-y-3 py-4 text-xs text-muted-foreground">
                  <span>首次发现 {formatDateTime(selected.first_seen_at)}</span>
                  <span>最近更新 {formatDateTime(selected.last_seen_at)}</span>
                  <span>独立来源 {heat?.source_count ?? "—"}</span>
                  <span>证据内容 {evidenceTotal || heat?.content_count || "—"}</span>
                  <span className="font-medium text-blue-700">热度 {score(heat?.heat_score ?? selected.heat_score)}</span>
                </div>
                <Separator />

                <section className="py-7" aria-labelledby="why-it-matters-heading">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h2 id="why-it-matters-heading" className="text-base font-semibold text-slate-950">为什么重要</h2>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    事件仍在快速演化，可能影响行业判断与后续报道方向。右侧证据按来源与发布时间展示，帮助你区分已确认信息和暂不可读内容。
                  </p>
                </section>
                <Separator />

                {intelligence?.entities?.length ? (
                  <section className="py-6" aria-labelledby="entities-heading">
                    <h2 id="entities-heading" className="text-sm font-semibold text-slate-950">涉及实体</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {intelligence.entities.slice(0, 5).map((entity) => (
                        <Badge key={entity.relation_id ?? entity.entity_id ?? entity.entity_key} variant="secondary" className="gap-2 rounded-md bg-slate-50 px-2.5 py-1.5 font-medium text-slate-600">
                          <UserRound className="h-3.5 w-3.5 text-slate-500" />
                          {entity.canonical_name || entity.entity_key || "未命名实体"}
                          {entity.entity_type ? <span className="text-[10px] text-muted-foreground">{entity.entity_type}</span> : null}
                        </Badge>
                      ))}
                    </div>
                  </section>
                ) : null}
              </article>

              <div className="inline-flex border-b border-border">
                {([[WorkspaceTab.Signal, "信号"], [WorkspaceTab.Evidence, "证据"], [WorkspaceTab.Report, "报告"]] as const).map(([value, label]) => (
                  <Button key={value} variant="ghost" onClick={() => setTab(value)} className={`h-auto rounded-none border-b-2 px-4 py-3 text-sm ${tab === value ? "border-blue-600 text-blue-700 hover:bg-transparent hover:text-blue-700" : "border-transparent text-muted-foreground hover:bg-transparent hover:text-foreground"}`}>
                    {label}
                  </Button>
                ))}
              </div>

              {tab === WorkspaceTab.Evidence ? (
                <div className={`mt-5 flex items-start gap-3 rounded-lg border px-4 py-3 ${evidenceFailures > 0 || evidenceUnavailable ? "border-amber-200 bg-amber-50/70 text-amber-800" : "border-emerald-100 bg-emerald-50/60 text-emerald-800"}`}>
                  {evidenceFailures > 0 || evidenceUnavailable ? <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" /> : <Check className="mt-0.5 h-4 w-4 shrink-0" />}
                  <div>
                    <p className="text-sm font-medium">{evidenceFailures > 0 || evidenceUnavailable ? "部分证据暂不可读" : "证据已完成加载"}</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">已读取 {contents.length} 条，共 {evidenceTotal} 条；详细来源与阅读入口见右侧。</p>
                  </div>
                </div>
              ) : null}

              {tab === WorkspaceTab.Signal ? (
                <div className="space-y-6 py-6">
                  <EventHeatComparison events={sortedEvents} />
                  <div className="divide-y divide-border border-y border-border">
                    {sortedEvents.slice(0, 8).map((event, index) => (
                      <Button key={event.id} variant="ghost" onClick={() => setSelectedId(event.id)} className={`grid h-auto w-full grid-cols-[32px_minmax(0,1fr)_64px] items-center gap-3 rounded-none px-0 py-4 text-left hover:bg-transparent ${event.id === selectedId ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <span className="mono text-xs text-blue-600">{String(index + 1).padStart(2, "0")}</span>
                        <span className="min-w-0"><span className="block truncate text-sm font-medium">{event.title_zh || event.title_en || `事件 #${event.id}`}</span><span className="mt-1 block text-xs text-muted-foreground">{formatDateTime(event.last_seen_at)} · {event.lifecycle_status}</span></span>
                        <span className="mono text-right text-sm font-semibold text-blue-700">{score(event.heat_score)}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {tab === WorkspaceTab.Report ? (
                <div className="py-6">
                  {reports.length ? (
                    <div className="divide-y divide-border border-y border-border">
                      {reports.slice(0, 6).map((report) => (
                        <div key={report.id} className="flex items-center gap-4 py-4">
                          <FileText className="h-4 w-4 shrink-0 text-blue-600" />
                          <a href="/dashboard/reports" className="min-w-0 flex-1 text-foreground no-underline">
                            <span className="block truncate text-sm font-medium">{report.title || `报告 #${report.id}`}</span>
                            <span className="mt-1 block truncate text-xs text-muted-foreground">{report.summary || `${report.type || "报告"} · ${formatDateTime(report.generated_at)}`}</span>
                          </a>
                          <span className="text-xs text-muted-foreground">{report.status}</span>
                        </div>
                      ))}
                      {recentReport ? (
                        <div className="flex flex-wrap justify-end gap-2 py-4">
                          <Button variant="outline" size="sm" onClick={() => runReportAction(ReportAction.Preview)} disabled={!!action}>预览最新报告</Button>
                          <Button size="sm" onClick={() => runReportAction(ReportAction.Build)} disabled={!!action}>重新构建</Button>
                        </div>
                      ) : null}
                    </div>
                  ) : <p className="py-10 text-center text-sm text-muted-foreground">暂时没有可用报告。</p>}
                </div>
              ) : null}
            </>
          )}
        </section>

        <aside className="min-w-0 border-t border-border bg-[#fbfdff] xl:border-l xl:border-t-0">
          <EventEvidenceTimeline contents={contents} failedCount={evidenceFailures} totalCount={evidenceTotal} unavailable={evidenceUnavailable} />
        </aside>

        <section className="col-span-full border-t border-border bg-white" aria-label="AI 情报助手">
          <Button
            aria-label={assistantOpen ? "收起 AI 情报助手" : "展开 AI 情报助手"}
            aria-expanded={assistantOpen}
            variant="ghost"
            onClick={() => setAssistantOpen((value) => !value)}
            className="h-auto w-full justify-start gap-3 rounded-none px-5 py-4 text-left hover:bg-blue-50/40 sm:px-8 lg:px-10"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold tracking-[.08em] text-blue-700">AI 情报助手</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">基于事件证据生成辅助研判，结果可能不完整。</span>
            {assistantOpen ? <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" /> : <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground" />}
          </Button>
          {assistantOpen ? (
            <div className="grid gap-5 border-t border-border bg-slate-50/50 px-5 py-5 sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-10">
              <div>
                <p className="text-xs font-semibold text-slate-900">已验证声明</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {intelligence?.claims?.length ? intelligence.claims.slice(0, 4).map((claim) => (
                    <div key={claim.id ?? claim.claim_hash} className="flex items-start gap-2 border-l-2 border-emerald-500 pl-3">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <div><p className="text-xs leading-5">{claim.normalized_claim}</p><p className="mt-1 text-[10px] text-muted-foreground">{claim.evidence?.length ?? 0} 条证据 · 置信度 {claim.confidence == null ? "—" : Math.round(claim.confidence * 100)}</p></div>
                    </div>
                  )) : <p className="text-xs leading-5 text-muted-foreground">暂无已验证声明，可重新提取事件情报。</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 lg:self-start">
                <Button variant="outline" size="sm" onClick={() => runEventAction(EventAction.Extract)} disabled={!!action} className="gap-2 text-xs">{action === EventAction.Extract ? <Loader2 className="animate-spin" /> : <BookOpen />}提取实体</Button>
                <Button size="sm" onClick={() => runEventAction(EventAction.Summary)} disabled={!!action} className="gap-2 text-xs">{action === EventAction.Summary ? <Loader2 className="animate-spin" /> : <Sparkles />}生成摘要</Button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
