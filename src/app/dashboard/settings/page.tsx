"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Archive,
  Loader2,
  Pause,
  Play,
  Plus,
  Radar,
  Rocket,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getMonitors,
  postMonitors,
  postMonitorsIdArchive,
  postMonitorsIdPause,
  postMonitorsIdPublish,
  postMonitorsIdResume,
} from "@/services/hotkey/hotkey-server/monitors";
import { getSourceConnections } from "@/services/hotkey/hotkey-server/sources";
import { PageHeader } from "@/components/dashboard/PageHeader";

const statusLabel: Record<string, string> = {
  draft: "草稿",
  active: "运行中",
  paused: "已暂停",
  archived: "已归档",
};

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<HotKeyAPI.MonitorResponse[]>([]);
  const [sources, setSources] = useState<HotKeyAPI.SourceReadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [action, setAction] = useState<number>();
  const [form, setForm] = useState({
    name: "",
    description: "",
    query: "",
    language: "zh",
    region: "CN",
    interval: 900,
    relevance: 60,
    event: 70,
    retention: 30,
    sourceIds: [] as number[],
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [monitorResult, sourceResult] = await Promise.all([
        getMonitors({ limit: 100 }),
        getSourceConnections({ limit: 100 }),
      ]);
      setMonitors(monitorResult.data?.items ?? []);
      setSources(
        (sourceResult.data?.items ?? []).filter(
          (source) => source.enabled && !source.deleted,
        ),
      );
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "监控加载失败");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.name || !form.query || !form.sourceIds.length) return;
    try {
      await postMonitors({
        name: form.name,
        description: form.description || undefined,
        config: {
          collection_interval_seconds: form.interval,
          event_threshold: form.event,
          languages: [form.language],
          regions: [form.region],
          relevance_threshold: form.relevance,
          retention_days: form.retention,
          timezone: "Asia/Shanghai",
        },
        rules: [
          {
            rule_type: "keyword",
            operator: "contains",
            value: form.query,
            enabled: true,
            priority: 1,
            weight: 1,
          },
        ],
        sources: form.sourceIds.map((source_connection_id, index) => ({
          source_connection_id,
          enabled: true,
          priority: index + 1,
        })),
      });
      setDialog(false);
      setForm({
        name: "",
        description: "",
        query: "",
        language: "zh",
        region: "CN",
        interval: 900,
        relevance: 60,
        event: 70,
        retention: 30,
        sourceIds: [],
      });
      await load();
      toast.success("监控草稿已创建");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "监控创建失败");
    }
  };

  const operate = async (
    monitor: HotKeyAPI.MonitorResponse,
    kind: "publish" | "pause" | "resume" | "archive",
  ) => {
    if (monitor.id == null) return;
    setAction(monitor.id);
    try {
      if (kind === "publish")
        await postMonitorsIdPublish(
          { id: monitor.id },
          {
            expected_draft_version: monitor.draft?.version ?? 0,
            expected_monitor_version: monitor.version ?? 0,
          },
        );
      else if (kind === "pause")
        await postMonitorsIdPause({ id: monitor.id }, {
          expected_monitor_version: monitor.version ?? 0,
        } as unknown as HotKeyAPI.LifecycleRequest);
      else if (kind === "resume")
        await postMonitorsIdResume({ id: monitor.id }, {
          expected_monitor_version: monitor.version ?? 0,
        } as unknown as HotKeyAPI.LifecycleRequest);
      else
        await postMonitorsIdArchive({ id: monitor.id }, {
          expected_monitor_version: monitor.version ?? 0,
        } as unknown as HotKeyAPI.LifecycleRequest);
      await load();
      toast.success("监控状态已更新");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "监控操作失败");
    } finally {
      setAction(undefined);
    }
  };

  const toggleSource = (id: number, checked: boolean) =>
    setForm((current) => ({
      ...current,
      sourceIds: checked
        ? [...current.sourceIds, id]
        : current.sourceIds.filter((value) => value !== id),
    }));

  return (
    <div className="app-page">
      <PageHeader
        eyebrow="Monitoring"
        title="热点监控"
        description="用正式来源、查询规则和阈值建立可发布的监控。"
        action={
          <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus />
                新建监控
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>新建监控草稿</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="monitor-name">监控名称</Label>
                  <Input
                    id="monitor-name"
                    className="mt-2"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="AI Agent 创作工具"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="monitor-query">关键词规则</Label>
                  <Input
                    id="monitor-query"
                    className="mt-2"
                    value={form.query}
                    onChange={(event) =>
                      setForm({ ...form, query: event.target.value })
                    }
                    placeholder="AI Agent OR 智能体 OR agentic"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="monitor-description">说明</Label>
                  <Input
                    id="monitor-description"
                    className="mt-2"
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="追踪创作工作流中的智能体产品与案例"
                  />
                </div>
                <div>
                  <Label>语言</Label>
                  <Select
                    value={form.language}
                    onValueChange={(value) =>
                      setForm({ ...form, language: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>地区</Label>
                  <Select
                    value={form.region}
                    onValueChange={(value) =>
                      setForm({ ...form, region: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CN">中国</SelectItem>
                      <SelectItem value="US">美国</SelectItem>
                      <SelectItem value="GLOBAL">全球</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {[
                  ["采集间隔（秒）", "interval", 60, 86400],
                  ["相关性阈值", "relevance", 0, 100],
                  ["事件阈值", "event", 0, 100],
                  ["保留天数", "retention", 1, 365],
                ].map(([label, key, min, max]) => (
                  <div key={String(key)}>
                    <Label htmlFor={`monitor-${key}`}>{label}</Label>
                    <Input
                      id={`monitor-${key}`}
                      type="number"
                      min={Number(min)}
                      max={Number(max)}
                      className="mono mt-2"
                      value={form[key as "interval"]}
                      onChange={(event) =>
                        setForm({ ...form, [key]: Number(event.target.value) })
                      }
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <Label>数据来源</Label>
                  <div className="mt-2 divide-y divide-border rounded-md border border-border">
                    {sources.length ? (
                      sources.map((source) => (
                        <label
                          key={source.id}
                          className="flex cursor-pointer items-center gap-3 px-3 py-3 text-sm"
                        >
                          <Checkbox
                            checked={
                              source.id != null &&
                              form.sourceIds.includes(source.id)
                            }
                            onCheckedChange={(checked) =>
                              source.id != null &&
                              toggleSource(source.id, checked === true)
                            }
                          />
                          <span>{source.name}</span>
                          <span className="ml-auto mono text-xs text-muted-foreground">
                            {source.source_type}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="p-4 text-xs text-muted-foreground">
                        请先在来源管理中创建并启用来源。
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(false)}>
                  取消
                </Button>
                <Button
                  onClick={create}
                  disabled={!form.name || !form.query || !form.sourceIds.length}
                >
                  创建草稿
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />
      {loading ? (
        <div className="flex h-72 items-center justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : !monitors.length ? (
        <div className="panel mt-6 flex h-72 flex-col items-center justify-center text-center">
          <Radar className="mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">还没有热点监控</p>
          <p className="mt-1 text-xs text-muted-foreground">
            至少需要一个已启用来源才能创建监控。
          </p>
        </div>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_110px_100px_260px] gap-4 border-b border-border px-5 py-3 text-xs text-muted-foreground lg:grid">
            <span>监控</span>
            <span>采集间隔</span>
            <span>状态</span>
            <span className="text-right">操作</span>
          </div>
          <div className="divide-y divide-border">
            {monitors.map((monitor) => {
              const config = monitor.published ?? monitor.draft;
              const rule = config?.rules?.[0];
              return (
                <div
                  key={monitor.id}
                  className="grid gap-3 px-4 py-4 lg:grid-cols-[minmax(0,1.3fr)_110px_100px_260px] lg:items-center lg:gap-4 lg:px-5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Search className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="truncate text-sm font-medium">
                        {monitor.name || `监控 #${monitor.id}`}
                      </p>
                    </div>
                    <p className="mono mt-2 truncate text-xs text-muted-foreground">
                      {rule?.value || monitor.description || "暂无规则"}
                    </p>
                  </div>
                  <span className="mono text-xs text-muted-foreground">
                    {config?.collection_interval_seconds
                      ? `${config.collection_interval_seconds}s`
                      : "—"}
                  </span>
                  <Badge variant="outline" className="w-fit">
                    {statusLabel[monitor.status || ""] || monitor.status}
                  </Badge>
                  <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                    {monitor.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => operate(monitor, "publish")}
                        disabled={action === monitor.id}
                        className="gap-1.5"
                      >
                        <Rocket />
                        发布
                      </Button>
                    )}
                    {monitor.status === "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => operate(monitor, "pause")}
                        disabled={action === monitor.id}
                        className="gap-1.5"
                      >
                        <Pause />
                        暂停
                      </Button>
                    )}
                    {monitor.status === "paused" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => operate(monitor, "resume")}
                        disabled={action === monitor.id}
                        className="gap-1.5"
                      >
                        <Play />
                        恢复
                      </Button>
                    )}
                    {monitor.status !== "archived" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => operate(monitor, "archive")}
                        disabled={action === monitor.id}
                        className="gap-1.5 text-muted-foreground"
                      >
                        <Archive />
                        归档
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
