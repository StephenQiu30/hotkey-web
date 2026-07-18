"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Play,
  RefreshCw,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  getReports,
  getReportsId,
  postReportsIdBuild,
  postReportsIdPreview,
  postReportsIdPublish,
} from "@/services/hotkey/hotkey-server/reports";
import { ReportAction, ReportStatus } from "@/lib/domainEnums";
import { CursorPagination } from "@/components/dashboard/CursorPagination";

const when = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("zh-CN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

export default function ReportsPage() {
  const pageSize = 20;
  const [reports, setReports] = useState<HotKeyAPI.ReportResponse[]>([]);
  const [selected, setSelected] = useState<HotKeyAPI.ReportResponse>();
  const selectedIdRef = useRef<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<ReportAction>();
  const [error, setError] = useState<string>();
  const [page, setPage] = useState(1);
  const [cursors, setCursors] = useState<(number | undefined)[]>([undefined]);
  const [nextCursor, setNextCursor] = useState<number>();

  const setCurrentReport = (report?: HotKeyAPI.ReportResponse) => {
    selectedIdRef.current = report?.id;
    setSelected(report);
  };

  const loadPage = useCallback(async (cursor: number | undefined, pageNumber: number) => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getReports({
        limit: pageSize,
        ...(cursor != null ? { cursor } : {}),
      });
      const items = result.data?.items ?? [];
      setReports(items);
      setPage(pageNumber);
      setNextCursor(result.data?.next_cursor);
      const currentID = selectedIdRef.current;
      const id =
        currentID != null && items.some((report) => report.id === currentID)
          ? currentID
          : items[0]?.id;
      if (id == null) {
        setCurrentReport(undefined);
      } else if (id !== currentID) {
        const summary = items.find((report) => report.id === id);
        setCurrentReport(summary);
        setCurrentReport((await getReportsId({ id })).data);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "报告加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  const load = useCallback(async () => {
    setCursors([undefined]);
    await loadPage(undefined, 1);
  }, [loadPage]);

  useEffect(() => {
    load();
  }, [load]);

  const selectReport = async (report: HotKeyAPI.ReportResponse) => {
    if (report.id == null) return;
    setAction(ReportAction.Select);
    try {
      setCurrentReport((await getReportsId({ id: report.id })).data);
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "报告详情加载失败",
      );
    } finally {
      setAction(undefined);
    }
  };

  const run = async (
    kind: ReportAction.Build | ReportAction.Preview | ReportAction.Publish,
  ) => {
    if (selected?.id == null) return;
    setAction(kind);
    try {
      if (kind === ReportAction.Build)
        setCurrentReport((await postReportsIdBuild({ id: selected.id })).data);
      else if (kind === ReportAction.Preview)
        setCurrentReport(
          (await postReportsIdPreview({ id: selected.id })).data?.report,
        );
      else setCurrentReport((await postReportsIdPublish({ id: selected.id })).data);
      toast.success(
        kind === ReportAction.Build
          ? "报告已构建"
          : kind === ReportAction.Preview
            ? "预览已生成"
            : "报告已发布",
      );
      await loadPage(cursors[page - 1], page);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "报告操作失败");
    } finally {
      setAction(undefined);
    }
  };

  const nextPage = () => {
    if (nextCursor == null) return;
    const nextPageNumber = page + 1;
    setCursors((history) => [...history.slice(0, page), nextCursor]);
    void loadPage(nextCursor, nextPageNumber);
  };

  const previousPage = () => {
    if (page <= 1) return;
    void loadPage(cursors[page - 2], page - 1);
  };

  return (
    <div className="app-page">
      <PageHeader
        eyebrow="Publishing"
        title="报告中心"
        description="构建、预览并发布后端生成的日报与周报。"
        action={
          <Button variant="outline" onClick={load} className="gap-2">
            <RefreshCw />
            刷新
          </Button>
        }
      />
      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="panel mt-6 p-8 text-center text-sm text-destructive">
          {error}
        </div>
      ) : !reports.length ? (
        <div className="panel mt-6 flex h-72 flex-col items-center justify-center text-center">
          <FileText className="mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">暂时没有报告记录</p>
          <p className="mt-1 text-xs text-muted-foreground">
            报告由后端定时任务根据监控生成。
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="panel h-fit divide-y divide-border overflow-hidden">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => selectReport(report)}
                className={`w-full px-4 py-4 text-left transition-colors ${selected?.id === report.id ? "bg-white/[.06]" : "hover:bg-white/[.03]"}`}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium">
                    {report.title || `报告 #${report.id}`}
                  </span>
                  <Badge
                    variant="outline"
                    className="ml-auto shrink-0 text-[10px]"
                  >
                    {report.status}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                  {report.summary ||
                    `${report.type || "报告"} · ${when(report.generated_at)}`}
                </p>
              </button>
            ))}
            <CursorPagination
              hasNext={nextCursor != null}
              loading={loading}
              onNext={nextPage}
              onPrevious={previousPage}
              page={page}
            />
          </div>
          <article className="panel min-w-0 overflow-hidden">
            <div className="panel-header flex flex-wrap items-center gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-semibold">
                  {selected?.title || "选择报告"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selected?.type} · {selected?.status} ·{" "}
                  {when(selected?.generated_at)}
                </p>
              </div>
              {selected && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => run(ReportAction.Build)}
                    disabled={!!action}
                    className="gap-2"
                  >
                    <Play />
                    构建
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => run(ReportAction.Preview)}
                    disabled={!!action}
                    className="gap-2"
                  >
                    {action === ReportAction.Preview ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <FileText />
                    )}
                    预览
                  </Button>
                  <Button
                    onClick={() => run(ReportAction.Publish)}
                    disabled={
                      !!action || selected.status === ReportStatus.Published
                    }
                    className="gap-2"
                  >
                    {selected.status === ReportStatus.Published ? (
                      <CheckCircle2 />
                    ) : (
                      <Send />
                    )}
                    {selected.status === ReportStatus.Published
                      ? "已发布"
                      : "发布"}
                  </Button>
                </>
              )}
            </div>
            <div className="p-6">
              <div className="mb-6 grid grid-cols-2 gap-4 border-b border-border pb-5 text-xs sm:grid-cols-4">
                {[
                  ["监控", selected?.monitor_id],
                  ["版本", selected?.version_no],
                  ["时区", selected?.timezone],
                  ["条目", selected?.items?.length],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <p className="text-muted-foreground">{label}</p>
                    <p className="mono mt-2 text-sm">{value ?? "—"}</p>
                  </div>
                ))}
              </div>
              {selected?.body ? (
                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selected.body}
                  </ReactMarkdown>
                </div>
              ) : (
                <div>
                  {selected?.summary && (
                    <p className="text-sm leading-6 text-muted-foreground">
                      {selected.summary}
                    </p>
                  )}
                  <div className="mt-5 divide-y divide-border">
                    {selected?.items?.map((item) => (
                      <div
                        key={`${item.rank}-${item.event_id}`}
                        className="py-4"
                      >
                        <div className="flex items-center gap-3">
                          <span className="mono text-xs text-blue-400">
                            #{item.rank}
                          </span>
                          <p className="text-sm font-medium">{item.title}</p>
                          <span className="mono ml-auto text-xs text-muted-foreground">
                            {item.heat_score ?? "—"}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          {item.summary || item.inclusion_reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
