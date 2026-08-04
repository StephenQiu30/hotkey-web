"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CalendarRange,
  ChevronRight,
  CircleDot,
  ExternalLink,
  Filter,
  Loader2,
  RefreshCw,
  SearchX,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEventsIdUpdates } from "@/services/hotkey/hotkey-server/events";
import { getRadarEvents } from "@/services/hotkey/hotkey-server/radar";
import {
  confirmationLabel,
  formatRadarScore,
  formatRadarTime,
  getRadarEventTitle,
  reasonLabel,
  trendLabel,
  trendTone,
  updateKindLabel,
} from "@/lib/radarPresentation";
import { cn } from "@/lib/utils";

type RadarWindow = NonNullable<HotKeyAPI.getRadarEventsParams["window"]>;
type RadarSort = NonNullable<HotKeyAPI.getRadarEventsParams["sort"]>;

function SignalIcon({ trend }: { trend?: string }) {
  if (trend === "rising" || trend === "emerging") {
    return <TrendingUp className="h-4 w-4" />;
  }
  if (trend === "falling" || trend === "dormant") {
    return <TrendingDown className="h-4 w-4" />;
  }
  return <CircleDot className="h-4 w-4" />;
}

function EventsWorkspace() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim().toLocaleLowerCase("zh-CN") || "";
  const requestedEventId = Number(searchParams.get("event")) || undefined;
  const [windowValue, setWindowValue] = useState<RadarWindow>("24h");
  const [sort, setSort] = useState<RadarSort>("momentum");
  const [events, setEvents] = useState<HotKeyAPI.RadarEventResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number>();
  const [updates, setUpdates] = useState<HotKeyAPI.EventUpdateResponse[]>([]);
  const [asOf, setAsOf] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string>();

  const loadRadar = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await getRadarEvents({
        window: windowValue,
        sort,
        limit: 50,
      });
      const items = result.data?.items ?? [];
      setEvents(items);
      setAsOf(result.data?.as_of);
      setSelectedId((current) => {
        const preferred = requestedEventId ?? current;
        return items.some((item) => item.event_id === preferred)
          ? preferred
          : items[0]?.event_id;
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "事件雷达加载失败");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [requestedEventId, sort, windowValue]);

  useEffect(() => {
    void loadRadar();
  }, [loadRadar]);

  useEffect(() => {
    if (selectedId == null) {
      setUpdates([]);
      return;
    }
    let active = true;
    setDetailLoading(true);
    getEventsIdUpdates({ id: selectedId, limit: 20 })
      .then((result) => {
        if (active) setUpdates(result.data?.items ?? []);
      })
      .catch(() => {
        if (active) setUpdates([]);
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const visibleEvents = useMemo(() => {
    if (!query) return events;
    return events.filter((event) =>
      [
        getRadarEventTitle(event),
        event.summary,
        event.latest_update?.summary,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("zh-CN")
        .includes(query),
    );
  }, [events, query]);

  const selected = events.find((event) => event.event_id === selectedId);

  return (
    <div className="app-page radar-page !max-w-[1536px]">
      <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-[-.03em] text-slate-950">
            事件动态
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            AI 按变化速度、来源覆盖与证据状态筛选值得关注的热点事件。
          </p>
        </div>
        <div className="flex items-center gap-3">
          {asOf ? (
            <span className="hidden text-xs text-slate-400 sm:inline">
              数据更新于 {formatRadarTime(asOf)}
            </span>
          ) : null}
          <Button variant="outline" size="sm" onClick={loadRadar} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        </div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Select value={windowValue} onValueChange={(value) => setWindowValue(value as RadarWindow)}>
          <SelectTrigger aria-label="时间窗口" className="w-[160px] bg-white">
            <CalendarRange className="h-4 w-4 text-slate-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">过去 1 小时</SelectItem>
            <SelectItem value="6h">过去 6 小时</SelectItem>
            <SelectItem value="24h">过去 24 小时</SelectItem>
            <SelectItem value="7d">过去 7 天</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(value) => setSort(value as RadarSort)}>
          <SelectTrigger aria-label="排序方式" className="w-[160px] bg-white">
            <Filter className="h-4 w-4 text-slate-500" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="momentum">变化速度</SelectItem>
            <SelectItem value="attention">关注度</SelectItem>
            <SelectItem value="breadth">来源覆盖</SelectItem>
            <SelectItem value="latest">最新变化</SelectItem>
            <SelectItem value="relevance">监控相关性</SelectItem>
          </SelectContent>
        </Select>
        {query ? (
          <span className="rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
            搜索：{searchParams.get("q")}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          {error}
        </div>
      ) : loading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      ) : visibleEvents.length === 0 ? (
        <div className="mt-6 flex h-80 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center">
          <SearchX className="h-6 w-6 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-800">没有符合当前条件的事件</p>
          <p className="mt-1 text-xs text-slate-500">调整时间窗口或清除搜索后重试。</p>
        </div>
      ) : (
        <div className="mt-6 grid min-h-[620px] gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              需要关注
              <span className="font-normal text-slate-400">{visibleEvents.length}</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="hidden grid-cols-[minmax(0,1.5fr)_100px_120px_100px_28px] gap-3 border-b border-slate-200 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 md:grid">
                <span>事件</span>
                <span>来源广度</span>
                <span>首次发现</span>
                <span>趋势</span>
                <span />
              </div>
              <div className="divide-y divide-slate-100">
                {visibleEvents.map((event, index) => {
                  const active = event.event_id === selectedId;
                  const tone = trendTone(event.trend_status);
                  return (
                    <button
                      key={event.event_id ?? index}
                      type="button"
                      onClick={() => setSelectedId(event.event_id)}
                      className={cn(
                        "grid w-full gap-3 border-l-2 border-transparent px-5 py-4 text-left transition-colors hover:bg-slate-50 md:grid-cols-[minmax(0,1.5fr)_100px_120px_100px_28px] md:items-center",
                        active && "border-l-blue-600 bg-blue-50/40 hover:bg-blue-50/50",
                      )}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={cn(
                            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            tone === "danger" && "bg-red-50 text-red-600",
                            tone === "success" && "bg-emerald-50 text-emerald-600",
                            tone === "muted" && "bg-slate-100 text-slate-500",
                          )}
                        >
                          <SignalIcon trend={event.trend_status} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium leading-6 text-slate-950">
                            {getRadarEventTitle(event)}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                            {event.summary || "正在聚合事件背景与最新进展。"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-slate-600">
                        {event.independent_source_count ?? 0} 个
                      </span>
                      <span className="text-sm text-slate-600">
                        {formatRadarTime(event.first_seen_at)}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm",
                          tone === "danger" && "text-red-600",
                          tone === "success" && "text-emerald-600",
                          tone === "muted" && "text-slate-500",
                        )}
                      >
                        <SignalIcon trend={event.trend_status} />
                        {trendLabel(event.trend_status)}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white xl:sticky xl:top-[96px]">
            {selected ? (
              <>
                <div className="border-b border-slate-200 px-5 py-5">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                      <SignalIcon trend={selected.trend_status} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold leading-6 text-slate-950">
                        当前事件：{getRadarEventTitle(selected)}
                      </h2>
                      <p className="mt-2 text-xs text-slate-500">
                        {selected.independent_source_count ?? 0} 个独立来源 · {confirmationLabel(selected.confirmation)} · 动量 {formatRadarScore(selected.momentum)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 px-5 py-5">
                  <section>
                    <h3 className="text-sm font-semibold text-slate-900">发生了什么</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {selected.summary || selected.latest_update?.summary || "事件信息仍在持续聚合中。"}
                    </p>
                  </section>

                  <section className="border-t border-slate-100 pt-5">
                    <h3 className="text-sm font-semibold text-slate-900">为什么值得关注</h3>
                    <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                      {(selected.reason_codes?.length
                        ? selected.reason_codes
                        : ["latest"]
                      ).slice(0, 3).map((reason) => (
                        <li key={reason} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                          {reasonLabel(reason)}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="border-t border-slate-100 pt-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-slate-900">最新变化</h3>
                      {detailLoading ? <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> : null}
                    </div>
                    {updates.length ? (
                      <ol className="mt-3 space-y-4">
                        {updates.slice(0, 5).map((update) => (
                          <li key={update.id} className="flex gap-3">
                            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-50" />
                            <div>
                              <p className="text-xs font-medium text-slate-900">
                                {updateKindLabel(update.kind)} · {formatRadarTime(update.observed_at)}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {update.summary || "事件状态已更新"}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    ) : detailLoading ? null : (
                      <p className="mt-3 text-sm text-slate-500">暂无可展示的变化记录。</p>
                    )}
                  </section>
                </div>

                <div className="border-t border-slate-200 p-4">
                  <Button asChild className="w-full gap-2">
                    <Link href="/dashboard/contents">
                      查看采集内容
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    href="/dashboard/reports"
                    className="mt-2 flex items-center justify-center gap-1 py-2 text-xs text-slate-500 no-underline hover:text-blue-700"
                  >
                    用于简报研判
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-72px)] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      }
    >
      <EventsWorkspace />
    </Suspense>
  );
}
