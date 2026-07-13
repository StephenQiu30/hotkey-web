"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { listMonitors } from "@/services/monitors";
import { listTopics } from "@/services/topics";

const trendVariant = (direction?: string) => {
  if (direction === "up") return "destructive" as const;
  if (direction === "down") return "secondary" as const;
  return "outline" as const;
};
const trendLabel = (direction?: string) => {
  if (direction === "up") return "↑ 上升";
  if (direction === "down") return "↓ 下降";
  return "→ 平稳";
};

export default function TopicsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<HotKeyAPI.TopicSummary[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (topics.length === 0) return;
    gsap.from(".tp-card", { y: 16, opacity: 0, duration: 0.4, stagger: 0.06, ease: "power3.out" });
  }, { dependencies: [topics.length], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    let cancelled = false;
    async function fetchTopics() {
      setLoading(true); setError(null);
      try {
        const monitorsRes = await listMonitors();
        const monitors = monitorsRes.data ?? [];
        const allTopics: HotKeyAPI.TopicSummary[] = [];
        for (const m of monitors) {
          if (m.id == null) continue;
          const topicsRes = await listTopics({ id: m.id });
          allTopics.push(...(topicsRes.data ?? []));
        }
        if (!cancelled) setTopics(allTopics.sort((a, b) => (b.current_heat ?? 0) - (a.current_heat ?? 0)));
      } catch (err: any) { if (!cancelled) setError(err?.message ?? "加载失败"); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchTopics();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-xs text-destructive">{error}</p>
      <Button variant="outline" size="sm" onClick={() => window.location.reload()}>重试</Button>
    </CardContent></Card>;
  }

  if (loading) {
    return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => <Card key={i}><CardContent className="space-y-2 p-5">
        <Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-1/2" />
      </CardContent></Card>)}
    </div>;
  }

  return (
    <div ref={containerRef} className="space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold tracking-tight">内容选题</h2>
      </div>

      {topics.length === 0 ? (
        <Card><CardContent className="py-14 text-center"><p className="text-xs text-muted-foreground">暂无选题数据</p></CardContent></Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.id} className="tp-card card-border rounded-lg border-border">
              <CardContent className="space-y-2.5 p-4">
                <h3 className="text-xs font-semibold leading-snug tracking-tight">{topic.title}</h3>
                <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{topic.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant={trendVariant(topic.trend_direction)} className="h-5 text-xs px-2">{trendLabel(topic.trend_direction)}</Badge>
                  <Badge variant="outline" className="h-5 text-xs px-2">热度 {Math.round(topic.current_heat ?? 0)}</Badge>
                  <Badge variant="outline" className="h-5 text-xs px-2">{(topic.post_count ?? 0)} 篇</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
