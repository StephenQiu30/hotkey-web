"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bell, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { listNotifications, markNotificationRead } from "@/services/notifications";

const statusVariant = (status?: string) => {
  switch (status) {
    case "delivered": return "default" as const;
    case "pending": return "secondary" as const;
    case "skipped": return "outline" as const;
    case "failed": return "destructive" as const;
    default: return "outline" as const;
  }
};
const statusLabel: Record<string, string> = { delivered: "已送达", pending: "待发送", skipped: "已跳过", failed: "发送失败" };
const channelLabel = (ch?: string) => { if (ch === "in_app") return "站内"; if (ch === "email") return "邮件"; return ch ?? "未知"; };

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<HotKeyAPI.NotificationData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (notifications.length === 0) return;
    gsap.from(".nt-item", { y: 12, opacity: 0, duration: 0.35, stagger: 0.05, ease: "power3.out" });
  }, { dependencies: [notifications.length], scope: containerRef, revertOnUpdate: true });

  const fetchNotifs = async () => {
    setLoading(true); setError(null);
    try { const res = await listNotifications(); setNotifications(res.data ?? []); }
    catch (err: any) { setError(err?.message ?? "加载失败"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkRead = async (id: number) => {
    try { await markNotificationRead({ id }); setNotifications((prev) => prev.filter((n) => n.id !== id)); } catch { /* ignore */ }
  };

  if (error) {
    return <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-xs text-destructive">{error}</p>
      <Button variant="outline" size="sm" onClick={fetchNotifs}>重试</Button>
    </CardContent></Card>;
  }

  return (
    <div ref={containerRef} className="space-y-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2"><Bell className="h-4 w-4 text-muted-foreground" /><h2 className="text-sm font-semibold tracking-tight">通知记录</h2></div>
        {notifications.length > 0 && <span className="text-xs text-muted-foreground">{notifications.length} 条未读</span>}
      </div>

      {loading && (
        <div className="space-y-1.5">
          {Array.from({ length: 5 }).map((_, i) => <Card key={i}><CardContent className="flex items-center gap-3 p-4">
            <Skeleton className="h-7 w-7 rounded-full" /><div className="flex-1 space-y-1.5"><Skeleton className="h-3 w-1/3" /><Skeleton className="h-3 w-1/4" /></div>
          </CardContent></Card>)}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <Card><CardContent className="py-14 text-center">
          <Bell className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">暂无未读通知</p>
        </CardContent></Card>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-1.5">
          {notifications.map((item) => (
            <Card key={item.id} className="nt-item card-border rounded-lg border-border">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="shrink-0">
                  {item.delivery_status === "pending" ? <Clock className="h-4 w-4 text-primary" /> : <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={statusVariant(item.delivery_status)} className="h-5 text-xs px-2">{channelLabel(item.channel)}</Badge>
                    <span className="text-xs font-medium">{statusLabel[item.delivery_status ?? ""] ?? item.delivery_status}</span>
                  </div>
                  {item.created_at && <p className="mt-0.5 text-xs text-muted-foreground">{new Date(item.created_at).toLocaleString("zh-CN")}</p>}
                </div>
                {item.delivery_status === "pending" && item.id != null && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs shrink-0" onClick={() => handleMarkRead(item.id!)}>标记已读</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
