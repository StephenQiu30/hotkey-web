"use client";

import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CheckCircle2, FileText, Loader2, Play, RefreshCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReports, getReportsId, postReportsIdBuild, postReportsIdPreview, postReportsIdPublish } from "@/services/hotkey/hotkey-server/reports";

const when = (value?: string) => value ? new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";

export default function ReportsPage() {
  const [reports, setReports] = useState<HotKeyAPI.ReportResponse[]>([]);
  const [selected, setSelected] = useState<HotKeyAPI.ReportResponse>();
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<string>();
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const result = await getReports({ limit: 50 });
      const items = result.data?.items ?? [];
      setReports(items);
      const id = selected?.id ?? items[0]?.id;
      if (id != null) setSelected((await getReportsId({ id })).data);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "报告加载失败"); }
    finally { setLoading(false); }
  }, [selected?.id]);

  useEffect(() => { load(); }, []);

  const selectReport = async (report: HotKeyAPI.ReportResponse) => {
    if (report.id == null) return;
    setAction("select");
    try { setSelected((await getReportsId({ id: report.id })).data); }
    catch (reason) { toast.error(reason instanceof Error ? reason.message : "报告详情加载失败"); }
    finally { setAction(undefined); }
  };

  const run = async (kind: "build" | "preview" | "publish") => {
    if (selected?.id == null) return;
    setAction(kind);
    try {
      if (kind === "build") setSelected((await postReportsIdBuild({ id: selected.id })).data);
      else if (kind === "preview") setSelected((await postReportsIdPreview({ id: selected.id })).data?.report);
      else setSelected((await postReportsIdPublish({ id: selected.id })).data);
      toast.success(kind === "build" ? "报告已构建" : kind === "preview" ? "预览已生成" : "报告已发布");
      const list = await getReports({ limit: 50 }); setReports(list.data?.items ?? []);
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "报告操作失败"); }
    finally { setAction(undefined); }
  };

  return <div className="app-page">
    <div className="flex items-end justify-between border-b border-border pb-6"><div><p className="eyebrow">Publishing</p><h1 className="mt-2 text-2xl font-semibold">报告中心</h1><p className="mt-2 text-sm text-muted-foreground">构建、预览并发布后端生成的日报与周报。</p></div><Button variant="outline" onClick={load} className="gap-2"><RefreshCw />刷新</Button></div>
    {loading ? <div className="flex h-80 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div> : error ? <div className="panel mt-6 p-8 text-center text-sm text-destructive">{error}</div> : !reports.length ? <div className="panel mt-6 flex h-72 flex-col items-center justify-center text-center"><FileText className="mb-3 h-6 w-6 text-muted-foreground" /><p className="text-sm font-medium">暂时没有报告记录</p><p className="mt-1 text-xs text-muted-foreground">报告由后端定时任务根据监控生成。</p></div> : <div className="mt-6 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
      <div className="panel h-fit divide-y divide-border overflow-hidden">{reports.map((report) => <button key={report.id} onClick={() => selectReport(report)} className={`w-full px-4 py-4 text-left transition-colors ${selected?.id === report.id ? "bg-white/[.06]" : "hover:bg-white/[.03]"}`}><div className="flex items-center gap-2"><span className="truncate text-sm font-medium">{report.title || `报告 #${report.id}`}</span><Badge variant="outline" className="ml-auto shrink-0 text-[10px]">{report.status}</Badge></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{report.summary || `${report.type || "报告"} · ${when(report.generated_at)}`}</p></button>)}</div>
      <article className="panel min-w-0 overflow-hidden"><div className="panel-header flex flex-wrap items-center gap-2"><div className="min-w-0 flex-1"><h2 className="truncate text-base font-semibold">{selected?.title || "选择报告"}</h2><p className="mt-1 text-xs text-muted-foreground">{selected?.type} · {selected?.status} · {when(selected?.generated_at)}</p></div>{selected && <><Button variant="outline" onClick={() => run("build")} disabled={!!action} className="gap-2"><Play />构建</Button><Button variant="outline" onClick={() => run("preview")} disabled={!!action} className="gap-2">{action === "preview" ? <Loader2 className="animate-spin" /> : <FileText />}预览</Button><Button onClick={() => run("publish")} disabled={!!action || selected.status === "published"} className="gap-2">{selected.status === "published" ? <CheckCircle2 /> : <Send />}{selected.status === "published" ? "已发布" : "发布"}</Button></>}</div><div className="p-6"><div className="mb-6 grid grid-cols-2 gap-4 border-b border-border pb-5 text-xs sm:grid-cols-4">{[["监控", selected?.monitor_id],["版本", selected?.version_no],["时区", selected?.timezone],["条目", selected?.items?.length]].map(([label,value]) => <div key={String(label)}><p className="text-muted-foreground">{label}</p><p className="mono mt-2 text-sm">{value ?? "—"}</p></div>)}</div>{selected?.body ? <div className="prose prose-invert prose-sm max-w-none text-muted-foreground prose-headings:text-foreground prose-strong:text-foreground"><ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.body}</ReactMarkdown></div> : <div>{selected?.summary && <p className="text-sm leading-6 text-muted-foreground">{selected.summary}</p>}<div className="mt-5 divide-y divide-border">{selected?.items?.map((item) => <div key={`${item.rank}-${item.event_id}`} className="py-4"><div className="flex items-center gap-3"><span className="mono text-xs text-blue-400">#{item.rank}</span><p className="text-sm font-medium">{item.title}</p><span className="mono ml-auto text-xs text-muted-foreground">{item.heat_score ?? "—"}</span></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{item.summary || item.inclusion_reason}</p></div>)}</div></div>}</div></article>
    </div>}
  </div>;
}
