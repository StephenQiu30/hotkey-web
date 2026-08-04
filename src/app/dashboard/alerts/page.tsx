"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  BellRing,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Loader2,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAlerts,
  postAlertsIdAcknowledge,
  postAlertsIdResolve,
  postAlertsIdSuppress,
} from "@/services/hotkey/hotkey-server/alerts";
import { formatRadarTime } from "@/lib/radarPresentation";
import { cn } from "@/lib/utils";

type AlertState = NonNullable<HotKeyAPI.getAlertsParams["state"]> | "all";
type AlertAction = "acknowledge" | "resolve" | "suppress";

const stateLabels: Record<string, string> = {
  open: "待处理",
  acknowledged: "已确认",
  resolved: "已解决",
  suppressed: "已抑制",
};

const severityLabels: Record<string, string> = {
  critical: "严重",
  warning: "警告",
  info: "提示",
};

function severityClass(severity?: string) {
  if (severity === "critical") return "bg-red-50 text-red-700";
  if (severity === "warning") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
}

export default function AlertsPage() {
  const [state, setState] = useState<AlertState>("open");
  const [threads, setThreads] = useState<HotKeyAPI.AlertThreadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actioning, setActioning] = useState<number>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getAlerts({
        ...(state === "all" ? {} : { state }),
        limit: 50,
      });
      setThreads(result.data?.items ?? []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "告警加载失败");
    } finally {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(
    () => ({
      critical: threads.filter((thread) => thread.severity === "critical").length,
      warning: threads.filter((thread) => thread.severity === "warning").length,
    }),
    [threads],
  );

  const operate = async (
    thread: HotKeyAPI.AlertThreadResponse,
    action: AlertAction,
  ) => {
    if (thread.id == null || thread.version == null) return;
    setActioning(thread.id);
    const payload = {
      expected_version: thread.version,
      reason_code:
        action === "acknowledge"
          ? "user_acknowledged"
          : action === "resolve"
            ? "user_resolved"
            : "user_suppressed",
    };
    try {
      if (action === "acknowledge") {
        await postAlertsIdAcknowledge({ id: thread.id }, payload);
      } else if (action === "resolve") {
        await postAlertsIdResolve({ id: thread.id }, payload);
      } else {
        await postAlertsIdSuppress({ id: thread.id }, payload);
      }
      toast.success(
        action === "acknowledge"
          ? "告警已确认"
          : action === "resolve"
            ? "告警已解决"
            : "同类告警已抑制",
      );
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "告警操作失败");
    } finally {
      setActioning(undefined);
    }
  };

  return (
    <div className="app-page radar-page !max-w-[1360px]">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
            <BellRing className="h-4 w-4" />
            低噪声告警
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.03em] text-slate-950">
            告警中心
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            将同一监控与事件的重复触发聚合成线程，确认、解决或抑制后都有可追溯记录。
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={state} onValueChange={(value) => setState(value as AlertState)}>
            <SelectTrigger aria-label="告警状态" className="w-[140px] bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">待处理</SelectItem>
              <SelectItem value="acknowledged">已确认</SelectItem>
              <SelectItem value="resolved">已解决</SelectItem>
              <SelectItem value="suppressed">已抑制</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={load} aria-label="刷新告警">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-xs text-slate-500">当前列表</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{threads.length}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50/50 px-5 py-4">
          <p className="text-xs text-red-600">严重</p>
          <p className="mt-2 text-2xl font-semibold text-red-700">{counts.critical}</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/50 px-5 py-4">
          <p className="text-xs text-amber-700">警告</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{counts.warning}</p>
        </div>
      </section>

      {loading ? (
        <div className="flex h-80 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          {error}
        </div>
      ) : threads.length === 0 ? (
        <div className="mt-6 flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          <h2 className="mt-4 text-base font-semibold text-slate-900">当前没有这类告警</h2>
          <p className="mt-1 text-sm text-slate-500">Radar 会在事件达到监控阈值时自动创建告警线程。</p>
        </div>
      ) : (
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="hidden grid-cols-[minmax(0,1.4fr)_120px_110px_150px_280px] gap-4 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 lg:grid">
            <span>告警</span>
            <span>级别</span>
            <span>触发次数</span>
            <span>最近触发</span>
            <span>操作</span>
          </div>
          <div className="divide-y divide-slate-100">
            {threads.map((thread) => (
              <article
                key={thread.id}
                className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(0,1.4fr)_120px_110px_150px_280px] lg:items-center"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      severityClass(thread.severity),
                    )}
                  >
                    {thread.severity === "critical" ? (
                      <ShieldAlert className="h-4 w-4" />
                    ) : (
                      <CircleAlert className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-medium leading-6 text-slate-950">
                      {thread.title || `告警 #${thread.id}`}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                      {thread.reason || "事件信号达到当前监控阈值。"}
                    </p>
                    <Link
                      href={`/dashboard/events?event=${thread.event_id ?? ""}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-blue-700 no-underline hover:text-blue-800"
                    >
                      查看关联事件
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
                <span className={cn("w-fit rounded-md px-2 py-1 text-xs font-medium", severityClass(thread.severity))}>
                  {severityLabels[thread.severity || ""] || "提示"}
                </span>
                <span className="text-sm text-slate-600">{thread.occurrence_count ?? 1} 次</span>
                <div className="text-xs text-slate-500">
                  <p>{formatRadarTime(thread.last_triggered_at)}</p>
                  <p className="mt-1">{stateLabels[thread.state || ""] || thread.state}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {thread.state === "open" ? (
                    <Button
                      size="sm"
                      onClick={() => operate(thread, "acknowledge")}
                      disabled={actioning === thread.id}
                      className="gap-1.5"
                    >
                      {actioning === thread.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      确认告警
                    </Button>
                  ) : null}
                  {thread.state === "open" || thread.state === "acknowledged" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => operate(thread, "resolve")}
                      disabled={actioning === thread.id}
                    >
                      解决
                    </Button>
                  ) : null}
                  {thread.state !== "suppressed" ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => operate(thread, "suppress")}
                      disabled={actioning === thread.id}
                      aria-label="抑制同类告警"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
