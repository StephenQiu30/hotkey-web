"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Bot,
  CalendarDays,
  ChevronRight,
  CircleDot,
  Loader2,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAlerts } from "@/services/hotkey/hotkey-server/alerts";
import { getMonitors } from "@/services/hotkey/hotkey-server/monitors";
import { getRadarEvents } from "@/services/hotkey/hotkey-server/radar";
import {
  confirmationLabel,
  formatRadarTime,
  getRadarEventTitle,
  reasonLabel,
  trendLabel,
  trendTone,
} from "@/lib/radarPresentation";
import { cn } from "@/lib/utils";

function currentTimeContext() {
  const hour = new Date().getHours();
  const greeting =
    hour < 11 ? "上午好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
  const today = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());
  return { greeting, today };
}

function EventMark({ trend }: { trend?: string }) {
  const tone = trendTone(trend);
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        tone === "danger" && "bg-red-50 text-red-600",
        tone === "success" && "bg-emerald-50 text-emerald-600",
        tone === "muted" && "bg-slate-100 text-slate-500",
      )}
    >
      {tone === "danger" ? (
        <TrendingUp className="h-4 w-4" />
      ) : (
        <CircleDot className="h-4 w-4" />
      )}
    </span>
  );
}

export default function DashboardPage() {
  const [events, setEvents] = useState<HotKeyAPI.RadarEventResponse[]>([]);
  const [monitors, setMonitors] = useState<HotKeyAPI.MonitorResponse[]>([]);
  const [openAlerts, setOpenAlerts] = useState(0);
  const [asOf, setAsOf] = useState<string>();
  const [timeContext, setTimeContext] = useState({ greeting: "你好", today: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    const [radarResult, monitorResult, alertResult] = await Promise.allSettled([
      getRadarEvents({ window: "24h", sort: "momentum", limit: 12 }),
      getMonitors({ limit: 4 }),
      getAlerts({ state: "open", limit: 100 }),
    ]);

    if (radarResult.status === "rejected") {
      setError(
        radarResult.reason instanceof Error
          ? radarResult.reason.message
          : "热点雷达加载失败",
      );
      setEvents([]);
    } else {
      setEvents(radarResult.value.data?.items ?? []);
      setAsOf(radarResult.value.data?.as_of);
    }
    setMonitors(
      monitorResult.status === "fulfilled"
        ? monitorResult.value.data?.items ?? []
        : [],
    );
    setOpenAlerts(
      alertResult.status === "fulfilled"
        ? alertResult.value.data?.items?.length ?? 0
        : 0,
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setTimeContext(currentTimeContext());
  }, []);

  const summaryEvents = useMemo(() => events.slice(0, 3), [events]);
  const focusEvents = useMemo(() => events.slice(0, 6), [events]);
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="app-page radar-page" data-testid="dashboard-overview">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium tracking-[-.025em] text-slate-950 sm:text-[28px]">
            {timeContext.greeting}，这是今日值得关注的变化
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {timeContext.today || "今日"}
            </span>
            <span aria-hidden>·</span>
            <span>公开信息监测</span>
            {asOf ? (
              <span className="ml-1 text-xs">更新于 {formatRadarTime(asOf)}</span>
            ) : null}
          </div>
        </div>
        {events.length > 0 ? (
          <Button asChild className="self-start gap-2 px-5 shadow-sm">
            <Link href="/dashboard/settings">
              <Plus className="h-4 w-4" />
              创建监控
            </Link>
          </Button>
        ) : null}
      </header>

      {error ? (
        <section className="mt-8 rounded-xl border border-red-200 bg-red-50 px-5 py-8 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <Button variant="outline" size="sm" onClick={load} className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" />
            重新加载
          </Button>
        </section>
      ) : events.length === 0 ? (
        <section className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <BellRing className="h-7 w-7 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            当前窗口内还没有热点事件
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
            创建并发布监控后，HotKey 会持续聚合来源、识别事件变化并在这里给出解释。
          </p>
          <Button asChild className="mt-5">
            <Link href="/dashboard/settings">创建监控</Link>
          </Button>
        </section>
      ) : (
        <>
          <section className="mt-8 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_10px_35px_rgba(37,99,235,.04)]">
            <div className="flex flex-wrap items-center gap-2 border-b border-blue-100 px-5 py-4 sm:px-6">
              <Bot className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">今日 AI 摘要</h2>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                Radar 综合
              </span>
              <p className="ml-auto text-xs text-slate-400">
                基于公开信息与事件信号自动整理
              </p>
            </div>
            <ol className="divide-y divide-slate-100 px-5 sm:px-6">
              {summaryEvents.map((event, index) => (
                <li
                  key={event.event_id ?? index}
                  className="grid gap-3 py-5 sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:items-center"
                >
                  <span className="text-2xl font-light text-blue-600">{index + 1}</span>
                  <div className="min-w-0">
                    <p className="font-medium leading-6 text-slate-950">
                      <span className="sr-only">摘要：</span>
                      {getRadarEventTitle(event)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                      {event.summary || event.latest_update?.summary || "事件仍在持续跟踪中。"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 sm:justify-end">
                    <span>{confirmationLabel(event.confirmation)}</span>
                    <span className="text-blue-600">
                      {event.independent_source_count ?? 0} 个独立来源
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-950">重点事件</h2>
                <Link
                  href="/dashboard/events"
                  aria-label="查看全部事件"
                  className="inline-flex items-center gap-1 text-sm text-blue-700 no-underline hover:text-blue-800"
                >
                  查看全部
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(180px,.9fr)_160px_96px] gap-4 border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-xs text-slate-500 md:grid">
                  <span>事件</span>
                  <span>变化原因</span>
                  <span>最新进展</span>
                  <span>状态</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {focusEvents.map((event, index) => (
                    <Link
                      key={event.event_id ?? index}
                      href={`/dashboard/events?event=${event.event_id ?? ""}`}
                      className="grid gap-3 px-4 py-4 text-slate-800 no-underline transition-colors hover:bg-slate-50 md:grid-cols-[minmax(0,1.5fr)_minmax(180px,.9fr)_160px_96px] md:items-center md:gap-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <EventMark trend={event.trend_status} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-950">
                            {getRadarEventTitle(event)}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {event.independent_source_count ?? 0} 个独立来源 · {confirmationLabel(event.confirmation)}
                          </p>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                        {reasonLabel(event.reason_codes?.[0])}
                      </p>
                      <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                        {event.latest_update?.summary || event.summary || "持续跟踪中"}
                      </p>
                      <span
                        className={cn(
                          "inline-flex w-fit items-center gap-1.5 text-xs font-medium",
                          trendTone(event.trend_status) === "danger"
                            ? "text-red-600"
                            : "text-emerald-600",
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {trendLabel(event.trend_status)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <aside className="border-t border-slate-200 pt-6 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-slate-950">我的监控</h2>
                <Link
                  href="/dashboard/settings"
                  className="text-xs text-slate-500 no-underline hover:text-blue-700"
                >
                  管理
                </Link>
              </div>
              <div className="mt-3 divide-y divide-slate-100 border-y border-slate-200">
                {monitors.length ? (
                  monitors.map((monitor) => (
                    <Link
                      key={monitor.id}
                      href="/dashboard/settings"
                      className="flex items-center gap-3 py-4 text-sm text-slate-800 no-underline hover:text-blue-700"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="min-w-0 flex-1 truncate">
                        {monitor.name || `监控 #${monitor.id}`}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  ))
                ) : (
                  <p className="py-5 text-sm text-slate-500">还没有可用监控</p>
                )}
              </div>
              <Link
                href="/dashboard/alerts"
                className="mt-5 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 no-underline hover:bg-blue-50 hover:text-blue-700"
              >
                <span className="inline-flex items-center gap-2">
                  <BellRing className="h-4 w-4" />
                  待处理告警
                </span>
                <span className="font-semibold">{openAlerts}</span>
              </Link>
              <Button asChild variant="ghost" className="mt-2 w-full justify-between px-4">
                <Link href="/dashboard/settings">
                  查看全部监控
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
