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
    gsap.from(".tp-card", {
      y: 30,
      opacity: 0,
      duration: 0.55,
      stagger: 0.1,
      ease: "power3.out",
    });
  }, { dependencies: [topics.length], scope: containerRef, revertOnUpdate: true });

  useEffect(() => {
    let cancelled = false;
    async function fetchTopics() {
      setLoading(true);
      setError(null);
      try {
        const monitorsRes = await listMonitors();
        const monitors = monitorsRes.data ?? [];
        const allTopics: HotKeyAPI.TopicSummary[] = [];
        for (const m of monitors) {
          if (m.id == null) continue;
          const topicsRes = await listTopics({ id: m.id });
          allTopics.push(...(topicsRes.data ?? []));
        }
        if (!cancelled) {
          setTopics(
            allTopics.sort(
              (a, b) => (b.current_heat ?? 0) - (a.current_heat ?? 0),
            ),
          );
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTopics();
    return () => {
      cancelled = true;
    };
  }, []);

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 p-6">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Page header */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 px-6 py-4">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-base font-semibold tracking-tight">内容选题</h2>
        </CardHeader>
      </Card>

      {topics.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">
              暂无选题数据，请先在设置中创建监控并等待数据采集
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic.id} className="tp-card card-lift">
              <CardContent className="space-y-3 p-5">
                <h3 className="text-sm font-semibold leading-snug tracking-tight">
                  {topic.title}
                </h3>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {topic.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={trendVariant(topic.trend_direction)}>
                    {trendLabel(topic.trend_direction)}
                  </Badge>
                  <Badge variant="outline">
                    热度 {Math.round(topic.current_heat ?? 0)}
                  </Badge>
                  <Badge variant="outline">
                    {(topic.post_count ?? 0)} 篇
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
