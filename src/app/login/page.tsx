"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useAuthStore } from "@/stores/authStore";
import { safeRedirect } from "@/lib/safeRedirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginAction = useAuthStore((s) => s.login);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".lg-fade", { y: 10, opacity: 0, duration: 0.5 })
      .from(".lg-form", { y: 15, opacity: 0, duration: 0.5 }, "-=0.2");
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("请填写邮箱和密码"); return; }
    setLoading(true);
    try {
      await loginAction({ email, password });
      toast.success("欢迎回来");
      router.push(safeRedirect(new URLSearchParams(window.location.search).get("redirect")));
    } catch (err: any) {
      toast.error(err.message ?? "邮箱或密码错误");
    } finally { setLoading(false); }
  };

  return (
    <div ref={containerRef} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="deco-blur left-0 top-0 h-[350px] w-[350px]" />
      <div className="deco-blur bottom-0 right-0 h-[250px] w-[250px]" />

      <div className="relative w-full max-w-sm">
        <div className="lg-fade mb-8 text-center">
          <a href="/" className="inline-flex items-center gap-1.5 text-foreground no-underline">
            <span className="text-sm font-semibold tracking-tight">HotKey</span>
          </a>
          <h1 className="mt-4 text-lg font-bold tracking-tight">登录工作台</h1>
          <p className="mt-1 text-sm text-muted-foreground">内容创作者热点工作台</p>
        </div>

        <div className="lg-form rounded-lg border border-border bg-card p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">邮箱</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" placeholder="name@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-md border-border bg-black/40 pl-8 text-sm placeholder:text-muted-foreground/60" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">密码</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="输入密码" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-md border-border bg-black/40 pl-8 text-sm placeholder:text-muted-foreground/60" />
              </div>
            </div>
            <Button type="submit" disabled={loading}
              className="h-10 w-full rounded-md text-sm font-medium shadow-button">
              {loading ? "登录中..." : "进入工作台"}
            </Button>
          </form>

          <div className="mt-4 flex flex-col items-center gap-2 text-center">
            <a href="/forgot-password" className="text-sm text-muted-foreground transition-colors hover:text-foreground">忘记密码？</a>
            <p className="text-sm text-muted-foreground">
              还没有账号？{" "}
              <a href="/register" className="font-medium text-primary transition-colors hover:text-primary/80">创建账号</a>
            </p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <a href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-3 w-3" /> 返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
