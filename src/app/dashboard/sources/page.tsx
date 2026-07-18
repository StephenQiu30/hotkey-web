"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Database,
  Eye,
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
import { useAuthStore } from "@/stores/authStore";
import { SourceAction, SourceType, UserRole } from "@/lib/domainEnums";
import { sourceHealthPresentation } from "@/lib/domainPresentation";

function sourceStatus(source: HotKeyAPI.SourceReadResponse) {
  if (source.deleted) {
    return { label: "已归档", className: "text-muted-foreground" };
  }
  if (!source.enabled) {
    return { label: "已停用", className: "text-muted-foreground" };
  }
  return sourceHealthPresentation(source.health_status);
}

export default function SourcesPage() {
  const user = useAuthStore((state) => state.user);
  const canManage = user?.role === UserRole.Admin;
  const [sources, setSources] = useState<HotKeyAPI.SourceReadResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [action, setAction] = useState<number>();
  const [form, setForm] = useState({
    name: "",
    source_type: SourceType.RSS,
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
    if (!canManage || !form.name || !form.endpoint) return;
    try {
      await postSourceConnections({ ...form, enabled: true });
      setDialog(false);
      setForm({
        name: "",
        source_type: SourceType.RSS,
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
    kind: SourceAction,
  ) => {
    if (!canManage || source.id == null) return;
    setAction(source.id);
    try {
      if (kind === SourceAction.Health) {
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
        title={canManage ? "来源管理" : "来源目录"}
        description={
          canManage
            ? "连接、探测并管理官方 RSS、Atom 与 Hacker News 数据源。"
            : "查看当前工作区已接入的 RSS、Atom 与 Hacker News 数据源。"
        }
        action={
          canManage ? (
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
                      onValueChange={(value) =>
                        setForm({ ...form, source_type: value as SourceType })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SourceType.RSS}>RSS / Atom</SelectItem>
                        <SelectItem value={SourceType.HackerNews}>
                          Hacker News
                        </SelectItem>
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
          ) : undefined
        }
      />
      {!canManage && (
        <div className="panel mt-6 flex items-start gap-3 px-4 py-3 text-sm">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="font-medium">只读来源目录</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              当前 {user?.role ?? UserRole.Viewer} 角色可以查看来源状态；新增、探测和启停来源仅对管理员开放。
            </p>
          </div>
        </div>
      )}
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
          <div
            className={`hidden gap-4 border-b border-border px-5 py-3 text-xs text-muted-foreground md:grid ${
              canManage
                ? "grid-cols-[minmax(0,1.5fr)_120px_120px_180px]"
                : "grid-cols-[minmax(0,1.5fr)_120px_120px]"
            }`}
          >
            <span>来源</span>
            <span>类型</span>
            <span>状态</span>
            {canManage && <span className="text-right">操作</span>}
          </div>
          <div className="divide-y divide-border">
            {sources.map((source) => {
              const status = sourceStatus(source);
              return (
                <div
                  key={source.id}
                  className={`grid gap-3 px-4 py-4 md:items-center md:gap-4 md:px-5 ${
                    canManage
                      ? "md:grid-cols-[minmax(0,1.5fr)_120px_120px_180px]"
                      : "md:grid-cols-[minmax(0,1.5fr)_120px_120px]"
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {source.name}
                    </p>
                    {source.endpoint && (
                      <p className="mt-1 break-all text-xs text-muted-foreground md:truncate">
                        {source.endpoint}
                      </p>
                    )}
                  </div>
                  <span className="mono text-xs text-muted-foreground">
                    {source.source_type}
                  </span>
                  <span className={`text-xs ${status.className}`}>
                    {status.label}
                  </span>
                  {canManage && (
                    <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => operate(source, SourceAction.Health)}
                        disabled={action === source.id}
                        className="gap-1.5"
                      >
                        <Activity />
                        探测
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => operate(source, SourceAction.Toggle)}
                        disabled={action === source.id || source.deleted}
                        className="gap-1.5"
                      >
                        <Power />
                        {source.enabled ? "停用" : "启用"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
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
