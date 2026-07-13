"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Plus, Settings, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { listMonitors, createMonitor } from "@/services/monitors";

const statusVariant = (status?: string) => {
  switch (status) {
    case "active": return "default" as const;
    case "paused": return "secondary" as const;
    case "error": return "destructive" as const;
    default: return "outline" as const;
  }
};

interface MonitorFormData {
  name: string;
  query_text: string;
  region: string;
  language: string;
  poll_interval_minutes: number;
  alert_enabled: boolean;
}

const defaultFormData: MonitorFormData = {
  name: "",
  query_text: "",
  region: "CN",
  language: "zh",
  poll_interval_minutes: 15,
  alert_enabled: true,
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<HotKeyAPI.MonitorData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<MonitorFormData>(defaultFormData);
  const [submitting, setSubmitting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (monitors.length === 0) return;
    gsap.from(".st-item", {
      y: 16,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      ease: "power3.out",
    });
  }, { dependencies: [loading, monitors.length], scope: containerRef, revertOnUpdate: true });

  const fetchMonitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listMonitors();
      setMonitors(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.query_text.trim()) {
      return;
    }
    setSubmitting(true);
    try {
      await createMonitor({
        name: formData.name,
        query_text: formData.query_text,
        region: formData.region,
        language: formData.language,
        poll_interval_minutes: formData.poll_interval_minutes,
        alert_enabled: formData.alert_enabled,
      });
      setDialogOpen(false);
      setFormData(defaultFormData);
      fetchMonitors();
    } catch (err: any) {
      throw new Error(err?.message ?? "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchMonitors}>
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  const createForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="monitor-name">监控名称</Label>
        <Input
          id="monitor-name"
          placeholder="例如：AI 热点监控"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="monitor-query">查询关键词</Label>
        <Input
          id="monitor-query"
          placeholder="例如：openai OR gpt"
          value={formData.query_text}
          onChange={(e) => setFormData({ ...formData, query_text: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="monitor-region">地区</Label>
          <select
            id="monitor-region"
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="CN">中国</option>
            <option value="US">美国</option>
            <option value="JP">日本</option>
            <option value="EU">欧洲</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="monitor-lang">语言</Label>
          <select
            id="monitor-lang"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="monitor-interval">采集间隔（分钟）</Label>
        <Input
          id="monitor-interval"
          type="number"
          min={5}
          max={1440}
          value={formData.poll_interval_minutes}
          onChange={(e) => setFormData({ ...formData, poll_interval_minutes: parseInt(e.target.value) || 15 })}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="monitor-alert"
          checked={formData.alert_enabled}
          onChange={(e) => setFormData({ ...formData, alert_enabled: e.target.checked })}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <Label htmlFor="monitor-alert" className="text-sm font-normal">
          启用通知
        </Label>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page header with Dialog trigger */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold tracking-tight">监控管理</h2>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1.5">
                <Plus className="h-4 w-4" />
                新建监控
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>新建监控</DialogTitle>
              </DialogHeader>
              {createForm}
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleCreate} disabled={submitting || !formData.name || !formData.query_text}>
                  {submitting ? "创建中..." : "创建"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>

      {loading && (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      )}

      {!loading && monitors.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-16 text-center">
            <Settings className="h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">暂无监控配置</p>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>新建监控</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>新建监控</DialogTitle>
                </DialogHeader>
                {createForm}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreate} disabled={submitting || !formData.name || !formData.query_text}>
                    {submitting ? "创建中..." : "创建"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {!loading && monitors.length > 0 && (
        <div className="space-y-2">
          {monitors.map((item, idx) => (
            <Card key={item.id} className="st-item card-lift">
              <CardContent className="p-5">
                <div className="mb-2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">{item.name ?? "未命名"}</span>
                  <Badge variant={statusVariant(item.status)} className="text-[10px]">
                    {item.status}
                  </Badge>
                </div>
                <div className="mb-2 inline-block rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                  {item.query_text}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.region} · {item.language} · 每 {item.poll_interval_minutes} 分钟 · ID: {item.id}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
