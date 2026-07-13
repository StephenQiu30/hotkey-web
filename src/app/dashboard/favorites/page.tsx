"use client";

import { useState, useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Star, StarIcon, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { listMonitors } from "@/services/monitors";
import { listPosts } from "@/services/content";

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<HotKeyAPI.PostSummary[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (favorites.length === 0) return;
    gsap.from(".fv-item", { y: 12, opacity: 0, duration: 0.35, stagger: 0.05, ease: "power3.out" });
  }, { dependencies: [favorites.length], scope: containerRef, revertOnUpdate: true });

  const loadFavorites = async () => {
    setLoading(true); setError(null);
    try {
      const savedRaw = localStorage.getItem("savedPostIds");
      const savedIds: number[] = savedRaw ? JSON.parse(savedRaw) : [];
      if (savedIds.length === 0) { setFavorites([]); return; }
      const savedSet = new Set(savedIds);
      const monitorsRes = await listMonitors();
      const monitors = monitorsRes.data ?? [];
      const allPosts: HotKeyAPI.PostSummary[] = [];
      for (const m of monitors) { if (m.id == null) continue; const postsRes = await listPosts({ id: m.id, limit: 100 }); allPosts.push(...(postsRes.data ?? [])); }
      setFavorites(allPosts.filter((p) => p.id != null && savedSet.has(p.id)));
    } catch (err: any) { setError(err?.message ?? "加载失败"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadFavorites(); }, []);

  const removeFavorite = (id: number) => {
    const savedRaw = localStorage.getItem("savedPostIds");
    const savedIds: number[] = savedRaw ? JSON.parse(savedRaw) : [];
    const next = savedIds.filter((sid) => sid !== id);
    localStorage.setItem("savedPostIds", JSON.stringify(next));
    setFavorites((prev) => prev.filter((p) => p.id !== id));
  };

  if (error) {
    return <Card><CardContent className="flex flex-col items-center gap-3 py-12 text-center">
      <p className="text-xs text-destructive">{error}</p>
      <Button variant="outline" size="sm" onClick={loadFavorites}>重试</Button>
    </CardContent></Card>;
  }

  return (
    <div ref={containerRef} className="space-y-5">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Star className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold tracking-tight">收藏关注</h2>
      </div>

      {loading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Card key={i}><CardContent className="flex items-start gap-3 p-4">
            <Skeleton className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-full" /><Skeleton className="h-3 w-1/3" /></div>
          </CardContent></Card>)}
        </div>
      )}

      {!loading && favorites.length === 0 && (
        <Card><CardContent className="py-14 text-center">
          <StarIcon className="mx-auto mb-2 h-6 w-6 text-muted-foreground/50" />
          <p className="text-xs text-muted-foreground">还没有收藏的热点</p>
        </CardContent></Card>
      )}

      {!loading && favorites.length > 0 && (
        <div className="space-y-1.5">
          {favorites.map((item) => (
            <Card key={item.id} className="fv-item card-border rounded-lg border-border">
              <CardContent className="flex items-start gap-3 p-4">
                <StarIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 text-xs leading-snug">{item.content_text?.slice(0, 100) ?? `Post #${item.id}`}</p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{(item.author_name || item.author_handle) ?? "未知"}</span>
                    {item.heat_score != null && <span className="stat-value">{Math.round(item.heat_score * 100)}</span>}
                    {item.published_at && <span>{new Date(item.published_at).toLocaleDateString("zh-CN")}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => item.id != null && removeFavorite(item.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
