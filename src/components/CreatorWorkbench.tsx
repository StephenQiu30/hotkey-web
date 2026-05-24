"use client";

import { Bell, Bookmark, Flame, LineChart, Lock, Mail, RefreshCw, Search, Sparkles, Star } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type HotspotItem = HotKeyAPI.HotspotRead & {
  saved: boolean;
};

type CreatorWorkbenchProps = {
  initialHotspots: HotspotItem[];
  trendPoints: number[];
};

export function CreatorWorkbench({ initialHotspots, trendPoints }: CreatorWorkbenchProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState<HotKeyAPI.EmailLoginRequest>({
    email: "creator@hotkey.local",
    password: "hotkey-demo",
  });
  const [hotspots, setHotspots] = useState(initialHotspots);
  const [selectedHotspotId, setSelectedHotspotId] = useState(initialHotspots[0]?.id ?? 0);
  const [topicRotation, setTopicRotation] = useState(0);
  const selected = useMemo(() => hotspots.find((item) => item.id === selectedHotspotId) ?? hotspots[0], [hotspots, selectedHotspotId]);
  const topicIdeas = rotateTopicIdeas(selected?.ai_analysis?.topic_ideas ?? [], topicRotation);
  const savedCount = hotspots.filter((item) => item.saved).length;

  function toggleFavorite(hotspotId: number) {
    setHotspots((items) => items.map((item) => (item.id === hotspotId ? { ...item, saved: !item.saved } : item)));
  }

  function handleRotateTopicIdeas() {
    setTopicRotation((value) => value + 1);
  }

  function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsAuthenticated(Boolean(credentials.email && credentials.password));
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <section className="mx-auto grid min-h-screen max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Flame aria-hidden="true" />
              </div>
              <div>
                <p className="text-xl font-semibold tracking-normal">HotKey</p>
                <p className="text-sm text-muted-foreground">内容创作者热点 SaaS 台</p>
              </div>
            </div>
            <div className="rounded-lg border bg-gradient-to-br from-primary/20 via-card to-card p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">邮箱登录后进入创作者工作流</p>
              <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                从登录开始，把热点快速整理成今日选题。
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                MVP 阶段优先打通 Web 邮箱/密码入口、热点榜单、快速理解与内容选题生成链路。
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>邮箱登录</CardTitle>
              <CardDescription>使用 Web 邮箱/密码账号进入工作台。</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleEmailLogin}>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  邮箱
                  <span className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                    <Mail aria-hidden="true" className="text-muted-foreground" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                      onChange={(event) => setCredentials((value) => ({ ...value, email: event.target.value }))}
                      type="email"
                      value={credentials.email}
                    />
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  密码
                  <span className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                    <Lock aria-hidden="true" className="text-muted-foreground" />
                    <input
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                      onChange={(event) => setCredentials((value) => ({ ...value, password: event.target.value }))}
                      type="password"
                      value={credentials.password}
                    />
                  </span>
                </label>
                <Button className="w-full" type="submit">
                  进入工作台
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b bg-card/95">
        {/* 顶部导航：SaaS 产品台，而不是管理后台菜单。 */}
        <header className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Flame aria-hidden="true" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-normal">HotKey</p>
              <p className="text-sm text-muted-foreground">内容创作者热点 SaaS 台</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground" aria-label="主导航">
            {["热点榜单", "快速理解", "内容选题", "收藏关注", "趋势分析"].map((item, index) => (
              <Button key={item} variant={index === 0 ? "secondary" : "ghost"} size="sm" type="button">
                {item}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button">
              <Bell aria-hidden="true" data-icon="inline-start" />
              通知配置
            </Button>
            <Button size="sm" type="button">
              <Sparkles aria-hidden="true" data-icon="inline-start" />
              生成选题
            </Button>
          </div>
        </header>
      </div>

      <section className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-lg border bg-gradient-to-br from-primary/20 via-card to-card p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium text-muted-foreground">公开源热点聚合 · AI 快速理解 · 内容选题生成</p>
              <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                把今天值得追的热点，整理成可以马上发布的创作者选题。
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                聚合 GitHub Trending、Hacker News 与 RSS 等通用公开源，按趋势、相关性和可创作价值排序。
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <Search aria-hidden="true" className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">搜索热点、关键词、来源</span>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Metric label="今日热点" value="128" delta="+24%" />
          <Metric label="高相关热点" value="36" delta="+11%" />
          <Metric label="已收藏" value={String(savedCount)} delta="+5" />
          <Metric label="待提醒" value="7" delta="今日" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(380px,0.95fr)_minmax(0,1.05fr)]">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>热点榜单</CardTitle>
                <CardDescription>rank_score_desc</CardDescription>
              </div>
              <Button variant="outline" size="sm" type="button">
                <LineChart aria-hidden="true" data-icon="inline-start" />
                排行
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {hotspots.map((item, index) => (
                <article
                  className={cn(
                    "grid grid-cols-[2.25rem_minmax(0,1fr)_2.5rem] gap-3 rounded-lg border p-3 transition-colors",
                    item.id === selectedHotspotId ? "border-primary/60 bg-primary/10" : "border-border bg-card hover:bg-accent",
                  )}
                  key={item.id}
                >
                  <button
                    className="flex size-9 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground"
                    onClick={() => setSelectedHotspotId(item.id)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                  <button className="min-w-0 text-left" onClick={() => setSelectedHotspotId(item.id)} type="button">
                    <h3 className="truncate text-sm font-semibold leading-6">{item.title}</h3>
                    <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{item.snippet}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.author}</span>
                      <span>热度 {item.trend_score}</span>
                      <span>排行 {item.rank_score}</span>
                    </div>
                  </button>
                  <Button
                    aria-label={item.saved ? "取消收藏关注" : "收藏关注"}
                    aria-pressed={item.saved}
                    className={item.saved ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                    onClick={() => toggleFavorite(item.id)}
                    size="icon"
                    type="button"
                    variant={item.saved ? "default" : "outline"}
                  >
                    <Bookmark aria-hidden="true" />
                  </Button>
                </article>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-3">
              <div>
                <CardTitle>快速理解</CardTitle>
                <CardDescription>{selected?.cluster_id}</CardDescription>
              </div>
              <div className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                <Star aria-hidden="true" />
                AI 摘要
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <section className="flex flex-col gap-3">
                <h2 className="text-2xl font-semibold leading-tight tracking-normal">{selected?.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground">{selected?.ai_analysis?.summary ?? selected?.snippet}</p>
                <ul className="grid gap-2">
                  {(selected?.ai_analysis?.quick_understanding ?? [selected?.snippet ?? "暂无 AI 快速理解，稍后重试。"]).map((item) => (
                    <li className="rounded-md border bg-secondary px-3 py-2 text-sm leading-6 text-secondary-foreground" key={item}>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="flex flex-col gap-3 border-t pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">内容选题</h2>
                    <p className="text-sm text-muted-foreground">将热点拆成可发布的脚本、图文和系列主题。</p>
                  </div>
                  <Button onClick={handleRotateTopicIdeas} type="button">
                    <RefreshCw aria-hidden="true" data-icon="inline-start" />
                    生成选题
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {topicIdeas.map((idea) => (
                    <article className="rounded-lg border bg-card p-4" key={idea.title}>
                      <h3 className="text-sm font-semibold leading-6">{idea.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{idea.angle}</p>
                      <div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground">
                        <span>{idea.format}</span>
                        <span>{idea.rationale}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>趋势分析</CardTitle>
                <CardDescription>7 日热度变化</CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">7 日</span>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-end gap-3" aria-label="趋势曲线">
                {trendPoints.map((value, index) => (
                  <i
                    className="min-h-4 flex-1 rounded-t-md bg-gradient-to-t from-chart-2 to-chart-1"
                    key={index}
                    style={{ height: `${value}%` }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <div>
                <CardTitle>来源分布</CardTitle>
                <CardDescription>公开源覆盖占比</CardDescription>
              </div>
              <span className="text-sm text-muted-foreground">公开源</span>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <SourceBar label="GitHub Trending" value={46} />
              <SourceBar label="Hacker News" value={32} />
              <SourceBar label="RSS" value={22} />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function rotateTopicIdeas(items: HotKeyAPI.TopicIdeaRead[], offset: number) {
  if (items.length < 2) {
    return items;
  }
  const pivot = offset % items.length;
  return [...items.slice(pivot), ...items.slice(0, pivot)];
}

function Metric({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <strong className="text-2xl font-semibold tracking-normal">{value}</strong>
        <small className="text-sm font-medium text-primary-foreground [text-shadow:0_0_1px_var(--primary)]">{delta}</small>
      </CardContent>
    </Card>
  );
}

function SourceBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span>{label}</span>
        <b>{value}%</b>
      </div>
      <div className="h-2 rounded-full bg-secondary">
        <i className="block h-2 rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
