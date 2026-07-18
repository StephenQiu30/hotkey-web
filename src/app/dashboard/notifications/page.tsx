"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Rss, RotateCw, Send } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { getMonitors } from "@/services/hotkey/hotkey-server/monitors";
import {
  getReportSubscriptions,
  patchReportSubscriptionsId,
  postReportSubscriptions,
  postReportSubscriptionsIdRssTokenRotate,
} from "@/services/hotkey/hotkey-server/delivery";
import { PageHeader } from "@/components/dashboard/PageHeader";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<
    HotKeyAPI.SubscriptionResponse[]
  >([]);
  const [monitors, setMonitors] = useState<HotKeyAPI.MonitorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [action, setAction] = useState<number>();
  const [form, setForm] = useState({
    monitor_id: "",
    channel: "email" as "email" | "rss",
    report_type: "daily" as "daily" | "weekly",
    recipient: "",
    schedule: "0 9 * * *",
    timezone: "Asia/Shanghai",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subscriptionResult, monitorResult] = await Promise.all([
        getReportSubscriptions(),
        getMonitors({ limit: 100 }),
      ]);
      setSubscriptions(subscriptionResult.data ?? []);
      setMonitors(monitorResult.data?.items ?? []);
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "订阅加载失败");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const create = async () => {
    if (!form.monitor_id) return;
    try {
      const result = await postReportSubscriptions({
        monitor_id: Number(form.monitor_id),
        channel: form.channel,
        report_type: form.report_type,
        recipient: form.channel === "email" ? form.recipient : undefined,
        schedule: form.schedule,
        timezone: form.timezone,
        enabled: true,
      });
      setDialog(false);
      await load();
      if (result.data?.rss_token)
        toast.success(`RSS Token 已生成：${result.data.rss_token}`);
      else toast.success("报告订阅已创建");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "订阅创建失败");
    }
  };

  const toggle = async (subscription: HotKeyAPI.SubscriptionResponse) => {
    if (subscription.id == null) return;
    setAction(subscription.id);
    try {
      await patchReportSubscriptionsId(
        { id: subscription.id },
        {
          expected_version: subscription.version ?? 0,
          enabled: !subscription.enabled,
        },
      );
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "订阅更新失败");
    } finally {
      setAction(undefined);
    }
  };

  const rotate = async (subscription: HotKeyAPI.SubscriptionResponse) => {
    if (subscription.id == null) return;
    setAction(subscription.id);
    try {
      const result = await postReportSubscriptionsIdRssTokenRotate(
        { id: subscription.id },
        { expected_version: subscription.version ?? 0 },
      );
      toast.success(`新 RSS Token：${result.data?.rss_token || "已生成"}`);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Token 轮换失败");
    } finally {
      setAction(undefined);
    }
  };

  return (
    <div className="app-page">
      <PageHeader
        eyebrow="Delivery"
        title="发布订阅"
        description="按监控订阅日报或周报，通过邮件或私有 RSS 获取。"
        action={
          <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus />
                新建订阅
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>新建报告订阅</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label>监控</Label>
                  <Select
                    value={form.monitor_id}
                    onValueChange={(value) =>
                      setForm({ ...form, monitor_id: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="选择监控" />
                    </SelectTrigger>
                    <SelectContent>
                      {monitors.map(
                        (monitor) =>
                          monitor.id != null && (
                            <SelectItem
                              key={monitor.id}
                              value={String(monitor.id)}
                            >
                              {monitor.name || `监控 #${monitor.id}`}
                            </SelectItem>
                          ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label>渠道</Label>
                    <Select
                      value={form.channel}
                      onValueChange={(value: "email" | "rss") =>
                        setForm({ ...form, channel: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">邮件</SelectItem>
                        <SelectItem value="rss">私有 RSS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>报告类型</Label>
                    <Select
                      value={form.report_type}
                      onValueChange={(value: "daily" | "weekly") =>
                        setForm({ ...form, report_type: value })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">日报</SelectItem>
                        <SelectItem value="weekly">周报</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {form.channel === "email" && (
                  <div>
                    <Label htmlFor="recipient">收件邮箱</Label>
                    <Input
                      id="recipient"
                      type="email"
                      className="mt-2"
                      value={form.recipient}
                      onChange={(event) =>
                        setForm({ ...form, recipient: event.target.value })
                      }
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="schedule">Cron 计划</Label>
                  <Input
                    id="schedule"
                    className="mono mt-2"
                    value={form.schedule}
                    onChange={(event) =>
                      setForm({ ...form, schedule: event.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialog(false)}>
                  取消
                </Button>
                <Button
                  onClick={create}
                  disabled={
                    !form.monitor_id ||
                    (form.channel === "email" && !form.recipient)
                  }
                >
                  创建订阅
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
      ) : !subscriptions.length ? (
        <div className="panel mt-6 flex h-72 flex-col items-center justify-center">
          <Send className="mb-3 h-6 w-6 text-muted-foreground" />
          <p className="text-sm">暂时没有发布订阅</p>
        </div>
      ) : (
        <div className="panel mt-6 overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,1fr)_100px_120px_180px] gap-4 border-b border-border px-5 py-3 text-xs text-muted-foreground md:grid">
            <span>订阅</span>
            <span>状态</span>
            <span>计划</span>
            <span className="text-right">操作</span>
          </div>
          <div className="divide-y divide-border">
            {subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[minmax(0,1fr)_100px_120px_180px] md:items-center md:gap-4 md:px-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {subscription.channel === "rss" ? (
                      <Rss className="h-3.5 w-3.5 text-orange-400" />
                    ) : (
                      <Send className="h-3.5 w-3.5 text-blue-400" />
                    )}
                    <p className="text-sm font-medium">
                      {subscription.report_type === "weekly" ? "周报" : "日报"}{" "}
                      · {subscription.channel === "rss" ? "RSS" : "邮件"}
                    </p>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    监控 #{subscription.monitor_id} ·{" "}
                    {subscription.recipient || subscription.timezone}
                  </p>
                </div>
                <Badge variant="outline" className="w-fit">
                  {subscription.enabled ? "已启用" : "已停用"}
                </Badge>
                <span className="mono text-xs text-muted-foreground">
                  {subscription.schedule}
                </span>
                <div className="flex flex-wrap justify-start gap-2 md:justify-end">
                  {subscription.channel === "rss" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rotate(subscription)}
                      disabled={action === subscription.id}
                      className="gap-1.5"
                    >
                      <RotateCw />
                      轮换
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggle(subscription)}
                    disabled={action === subscription.id}
                  >
                    {subscription.enabled ? "停用" : "启用"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
