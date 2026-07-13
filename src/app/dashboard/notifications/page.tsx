"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bell, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  listNotifications,
  markNotificationRead,
} from "@/services/notifications";

const statusVariant = (status?: string) => {
  switch (status) {
    case "delivered": return "default" as const;
    case "pending": return "secondary" as const;
    case "skipped": return "outline" as const;
    case "failed": return "destructive" as const;
    default: return "outline" as const;
  }
};

const statusLabel: Record<string, string> = {
  delivered: "已送达",
  pending: "待发送",
  skipped: "已跳过",
  failed: "发送失败",
};

const channelLabel = (ch?: string) => {
  if (ch === "in_app") return "站内";
  if (ch === "email") return "邮件";
  return ch ?? "未知";
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<HotKeyAPI.NotificationData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (notifications.length === 0) return;
    gsap.from(".nt-item", {
      y: 16,
      opacity: 0,
      duration: 0.45,
      stagger: 0.07,
      ease: "power3.out",
    });
  }, { dependencies: [notifications.length], scope: containerRef, revertOnUpdate: true });

  const fetchNotifs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listNotifications();
      setNotifications(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead({ id });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {
      // ignore
    }
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchNotifs}>
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page header */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-base font-semibold tracking-tight">通知记录</h2>
          </div>
          {notifications.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {notifications.length} 条未读
            </span>
          )}
        </CardHeader>
      </Card>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 p-5">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Bell className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">暂无未读通知</p>
          </CardContent>
        </Card>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((item) => (
            <Card key={item.id} className="nt-item">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="shrink-0">
                  {item.delivery_status === "pending" ? (
                    <Clock className="h-5 w-5 text-primary" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant={statusVariant(item.delivery_status)}>
                      {channelLabel(item.channel)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {statusLabel[item.delivery_status ?? ""] ?? item.delivery_status}
                    </span>
                  </div>
                  {item.created_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleString("zh-CN")}
                    </p>
                  )}
                </div>

                {item.delivery_status === "pending" && item.id != null && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => handleMarkRead(item.id!)}
                  >
                    标记已读
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
