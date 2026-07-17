"use client";

import Link from "next/link";
import { Flame } from "lucide-react";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="grid min-h-screen bg-black lg:grid-cols-[minmax(0,1fr)_480px]"><section className="hidden border-r border-border p-10 lg:flex lg:flex-col"><Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground no-underline"><Flame className="h-4 w-4" />HotKey</Link><div className="my-auto max-w-xl"><p className="eyebrow">Editorial Intelligence</p><h2 className="mt-4 text-4xl font-semibold leading-tight">发现正在加速的事件，<br />验证每一条证据。</h2><p className="mt-5 text-sm leading-6 text-muted-foreground">真实来源、事件情报、监控规则与报告发布，都由后端 OpenAPI 契约驱动。</p></div><p className="text-xs text-muted-foreground">© 2026 HotKey</p></section><main className="flex items-center justify-center px-5 py-12"><div className="w-full max-w-sm"><Link href="/" className="mb-10 flex items-center gap-2 text-sm font-semibold text-foreground no-underline lg:hidden"><Flame className="h-4 w-4" />HotKey</Link><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-2 text-sm text-muted-foreground">{subtitle}</p><div className="mt-8">{children}</div></div></main></div>;
}
