"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { User, Flame, Bell, Star, FileText, Settings } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { listMonitors } from "@/services/monitors";
import { listPosts } from "@/services/content";
import { listNotifications } from "@/services/notifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ monitorCount: 0, totalPosts: 0, notificationCount: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (loading) return;
    gsap.from(".pf-item", { y: 16, opacity: 0, duration: 0.4, stagger: 0.08, ease: "power3.out" });
  }, { dependencies: [loading], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      setLoading(true); setError(null);
      try {
        const [monitorsRes, notifRes] = await Promise.all([listMonitors(), listNotifications()]);
        const monitors = monitorsRes.data ?? [];
        let totalPosts = 0;
        for (const m of monitors) { if (m.id == null) continue; try { const postsRes = await listPosts({ id: m.id, limit: 0 }); totalPosts += (postsRes.data ?? []).length; } catch { /* skip */ } }
        if (!cancelled) setStats({ monitorCount: monitors.length, totalPosts, notificationCount: (notifRes.data ?? []).length });
      } catch (err: any) { if (!cancelled) setError(err?.message ?? "加载失败"); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchStats();
    return () => { cancelled = true; };
  }, []);

  const savedCount = (() => { try { const raw = localStorage.getItem("savedPostIds"); return raw ? JSON.parse(raw).length : 0; } catch { return 0; } })();

  if (error) {
    return <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-xs text-destructive">{error}</p>
      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>重试</Button>
    </CardContent></Card>;
  }

  if (loading) {
    return <div className="space-y-5">
      <Card><CardContent className="flex items-center gap-4 p-5"><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-1.5"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div></CardContent></Card>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Card key={i}><CardContent className="space-y-1.5 p-5"><Skeleton className="h-3 w-16" /><Skeleton className="h-6 w-10" /></CardContent></Card>)}</div>
    </div>;
  }

  return (
    <div ref={containerRef} className="space-y-5">
      {/* User Header */}
      <div className="pf-item"><Card className="rounded-lg border-border"><CardContent className="flex items-center gap-4 p-5">
        <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-sm text-primary">{user?.display_name?.charAt(0)?.toUpperCase() || <User className="h-5 w-5" />}</AvatarFallback></Avatar>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight">{user?.display_name || user?.email || "用户"}</h3>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5"><User className="h-3 w-3" /><span>{user?.email || "未设置邮箱"}</span></div>
        </div>
      </CardContent></Card></div>

      {/* Stats */}
      <div className="pf-item grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[
          { title: "监控配置", value: stats.monitorCount, icon: Flame },
          { title: "收录帖子", value: stats.totalPosts, icon: FileText },
          { title: "未读通知", value: stats.notificationCount, icon: Bell },
          { title: "收藏内容", value: savedCount, icon: Star },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="card-border rounded-lg border-border text-center">
              <CardContent className="p-5"><Icon className="mx-auto mb-2 h-4 w-4 text-muted-foreground" />
                <p className="mb-0.5 text-xs font-medium text-muted-foreground">{item.title}</p>
                <p className="stat-value text-lg">{item.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account Details */}
      <div className="pf-item"><Card className="rounded-lg border-border"><CardHeader><CardTitle className="text-base">账号详情</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between border-b border-border/50 pb-2.5"><span className="text-xs text-muted-foreground">显示名称</span><span className="text-xs font-medium">{user?.display_name || "未设置"}</span></div>
          <div className="flex justify-between border-b border-border/50 pb-2.5"><span className="text-xs text-muted-foreground">电子邮箱</span><span className="text-xs font-medium">{user?.email || "未设置"}</span></div>
          <div className="flex justify-between"><span className="text-xs text-muted-foreground">注册时间</span><span className="text-xs text-muted-foreground">—（无数据）</span></div>
        </CardContent>
      </Card></div>

      {/* Quick Actions */}
      <div className="pf-item"><Card className="rounded-lg border-border"><CardHeader><CardTitle className="text-base">快捷操作</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => { window.location.href = "/dashboard/settings"; }} className="h-8 gap-1.5 rounded-md text-xs"><Settings className="h-3.5 w-3.5" />管理监控</Button>
          <Button variant="outline" onClick={() => { window.location.href = "/dashboard/notifications"; }} className="h-8 gap-1.5 rounded-md border-border text-xs"><Bell className="h-3.5 w-3.5" />查看通知</Button>
          <Button variant="outline" onClick={() => { window.location.href = "/dashboard/favorites"; }} className="h-8 gap-1.5 rounded-md border-border text-xs"><Star className="h-3.5 w-3.5" />我的收藏</Button>
        </CardContent>
      </Card></div>
    </div>
  );
}
