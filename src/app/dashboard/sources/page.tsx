"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Database,
  Loader2,
  Plus,
  Power,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getSourceConnections,
  postSourceConnections,
  postSourceConnectionsIdDisable,
  postSourceConnectionsIdEnable,
  postSourceConnectionsIdHealth,
} from "@/services/hotkey/hotkey-server/sources";
import { getSourceHealthMessage } from "@/lib/sourceHealthMessages";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function SourcesPage() {
  const [sources, setSources] = useState<HotKeyAPI.SourceReadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [action, setAction] = useState<number>();
  const [form, setForm] = useState({
    name: "",
    source_type: "rss" as "rss" | "hacker_news",
    endpoint: "",
    auth_type: "none" as "none" | "api_key" | "oauth2" | "bearer",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSources(
        (await getSourceConnections({ limit: 100 })).data?.items ?? [],
      );
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "来源加载失败");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.name || !form.endpoint) return;
    try {
      await postSourceConnections({ ...form, enabled: true });
      setDialog(false);
      setForm({
        name: "",
        source_type: "rss",
        endpoint: "",
        auth_type: "none",
      });
      await load();
      toast.success("来源连接已创建");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "创建失败");
    }
  };

  const operate = async (
    source: HotKeyAPI.SourceReadResponse,
    kind: "health" | "toggle",
  ) => {
    if (source.id == null) return;
    setAction(source.id);
    try {
      if (kind === "health") {
        const result = await postSourceConnectionsIdHealth({ id: source.id });
        toast[result.data?.healthy ? "success" : "error"](
          result.data?.healthy
            ? "来源健康"
            : getSourceHealthMessage(result.data?.error_code),
        );
      } else if (source.enabled)
        await postSourceConnectionsIdDisable(
          { id: source.id },
          { expected_source_version: source.version ?? 0 },
        );
      else
        await postSourceConnectionsIdEnable(
          { id: source.id },
          { expected_source_version: source.version ?? 0 },
        );
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "操作失败");
    } finally {
      setAction(undefined);
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        eyebrow="Sources"
        title="来源管理"
        description="连接官方 RSS、Atom 与 Hacker News 数据源。"
        action={
          <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus />
                新增来源
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新增来源连接</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="source-name">名称</Label>
                  <Input
                    id="source-name"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="OpenAI 官方博客"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>来源类型</Label>
                  <Select
                    value={form.source_type}
                    onValueChange={(value: "rss" | "hacker_news") =>
                      setForm({ ...form, source_type: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rss">RSS / Atom</SelectItem>
                      <SelectItem value="hacker_news">Hacker News</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source-endpoint">接口地址</Label>
                  <Input
                    id="source-endpoint"
                    value={form.endpoint}
                    onChange={(event) =>
                      setForm({ ...form, endpoint: event.target.value })
                    }
                    placeholder="https://example.com/feed.xml"
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(false)}>
                  取消
                </Button>
                <Button
                  onClick={create}
                  disabled={!form.name || !form.endpoint}
                >
                  创建连接
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
      ) : !sources.length ? (
        <div className="panel mt-6 flex h-72 flex-col items-center justify-center">
          <Database className="mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm">还没有来源连接</p>
        </div>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1.5fr)_120px_120px_180px] gap-4 border-b border-border px-5 py-3 text-xs text-muted-foreground md:grid">
            <span>来源</span>
            <span>类型</span>
            <span>状态</span>
            <span className="text-right">操作</span>
          </div>
          <div className="divide-y divide-border">
            {sources.map((source) => (
              <div
                key={source.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1.5fr)_120px_120px_180px] md:items-center md:gap-4 md:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{source.name}</p>
                  <p className="mt-1 break-all text-xs text-muted-foreground md:truncate">
                    {source.endpoint}
                  </p>
                </div>
                <span className="mono text-xs text-muted-foreground">
                  {source.source_type}
                </span>
                <span
                  className={`text-xs ${source.enabled ? "text-green-500" : "text-muted-foreground"}`}
                >
                  {source.deleted
                    ? "已归档"
                    : source.enabled
                      ? source.health_status || "已启用"
                      : "已停用"}
                </span>
                <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => operate(source, "health")}
                    disabled={action === source.id}
                    className="gap-1.5"
                  >
                    <Activity />
                    探测
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => operate(source, "toggle")}
                    disabled={action === source.id || source.deleted}
                    className="gap-1.5"
                  >
                    <Power />
                    {source.enabled ? "停用" : "启用"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Button
          variant="ghost"
          onClick={load}
          className="gap-2 text-muted-foreground"
        >
          <RefreshCw />
          刷新来源
        </Button>
      </div>
    </div>
  );
}
