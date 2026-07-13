"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { User, Flame, Bell, Star, FileText, Settings, ArrowRight } from "lucide-react";
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
  const [stats, setStats] = useState({
    monitorCount: 0,
    totalPosts: 0,
    notificationCount: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (loading) return;
    gsap.from(".pf-item", {
      y: 24,
      opacity: 0,
      duration: 0.55,
      stagger: 0.12,
      ease: "power3.out",
    });
  }, { dependencies: [loading], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    let cancelled = false;
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const [monitorsRes, notifRes] = await Promise.all([
          listMonitors(),
          listNotifications(),
        ]);

        const monitors = monitorsRes.data ?? [];
        let totalPosts = 0;
        for (const m of monitors) {
          if (m.id == null) continue;
          try {
            const postsRes = await listPosts({ id: m.id, limit: 0 });
            totalPosts += (postsRes.data ?? []).length;
          } catch {
            /* skip failed monitor posts */
          }
        }

        if (!cancelled) {
          setStats({
            monitorCount: monitors.length,
            totalPosts,
            notificationCount: (notifRes.data ?? []).length,
          });
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const savedCount = (() => {
    try {
      const raw = localStorage.getItem("savedPostIds");
      return raw ? JSON.parse(raw).length : 0;
    } catch {
      return 0;
    }
  })();

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center gap-5 p-6">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-2 p-6">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* User Header */}
      <div className="pf-item">
        <Card>
          <CardContent className="flex items-center gap-5 p-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-xl text-primary">
                {user?.display_name?.charAt(0)?.toUpperCase() || <User className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 text-xl font-bold tracking-tight">
                {user?.display_name || user?.email || "用户"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>{user?.email || "未设置邮箱"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="pf-item grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { title: "监控配置", value: stats.monitorCount, icon: Flame },
          { title: "收录帖子", value: stats.totalPosts, icon: FileText },
          { title: "未读通知", value: stats.notificationCount, icon: Bell },
          { title: "收藏内容", value: savedCount, icon: Star },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="card-lift text-center">
              <CardContent className="p-6">
                <Icon className="mx-auto mb-3 h-5 w-5 text-muted-foreground" />
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  {item.title}
                </p>
                <p className="text-3xl font-bold tracking-tight text-foreground">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Account Details */}
      <div className="pf-item">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">账号详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b border-border/50 pb-3">
              <span className="text-sm text-muted-foreground">显示名称</span>
              <span className="text-sm font-medium">{user?.display_name || "未设置"}</span>
            </div>
            <div className="flex justify-between border-b border-border/50 pb-3">
              <span className="text-sm text-muted-foreground">电子邮箱</span>
              <span className="text-sm font-medium">{user?.email || "未设置"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">注册时间</span>
              <span className="text-sm text-muted-foreground">—（无数据）</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="pf-item">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              onClick={() => { window.location.href = "/dashboard/settings"; }}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              管理监控
            </Button>
            <Button
              variant="outline"
              onClick={() => { window.location.href = "/dashboard/notifications"; }}
              className="gap-2"
            >
              <Bell className="h-4 w-4" />
              查看通知
            </Button>
            <Button
              variant="outline"
              onClick={() => { window.location.href = "/dashboard/favorites"; }}
              className="gap-2"
            >
              <Star className="h-4 w-4" />
              我的收藏
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
