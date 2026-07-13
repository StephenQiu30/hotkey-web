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
import { Flame, Mail, Lock, ArrowLeft } from "lucide-react";
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
    tl.from(".lg-logo", { y: -20, opacity: 0, duration: 0.7 })
      .from(".lg-heading", { y: -10, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".lg-subtitle", { y: -10, opacity: 0, duration: 0.5 }, "-=0.3")
      .from(".lg-form", { y: 20, opacity: 0, duration: 0.6 }, "-=0.3")
      .from(".lg-footer", { opacity: 0, duration: 0.4 }, "-=0.2");
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    try {
      await loginAction({ email, password });
      toast.success("欢迎回来");
      const params = new URLSearchParams(window.location.search);
      router.push(safeRedirect(params.get("redirect")));
    } catch (err: any) {
      toast.error(err.message ?? "邮箱或密码错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6"
    >
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid" />

      {/* Decorative blurs */}
      <div className="deco-blur right-0 top-0 h-[400px] w-[400px]" />
      <div className="deco-blur-sm bottom-0 left-0 h-[250px] w-[250px]" />

      <div className="relative w-full max-w-sm">
        {/* Logo + Title */}
        <div className="lg-logo mb-10 text-center">
          <a
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-foreground no-underline"
          >
            <Flame className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold tracking-tight">HotKey</span>
          </a>
          <h1 className="lg-heading mb-2 text-2xl font-bold tracking-tight text-foreground">
            登录工作台
          </h1>
          <p className="lg-subtitle text-sm text-muted-foreground">
            内容创作者热点工作台
          </p>
        </div>

        {/* Glass card form */}
        <div className="lg-form rounded-2xl border border-border/50 bg-white/70 p-8 backdrop-blur-xl shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                邮箱
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/80 bg-white/80 pl-10 text-sm backdrop-blur-sm placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                密码
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border/80 bg-white/80 pl-10 text-sm backdrop-blur-sm placeholder:text-muted-foreground/60 transition-all duration-200 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)]"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl text-base shadow-lg shadow-primary/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,122,255,0.25)] active:scale-[0.98]"
            >
              {loading ? "登录中..." : "进入工作台"}
            </Button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <a
              href="/forgot-password"
              className="text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
            >
              忘记密码？
            </a>
            <p className="text-sm text-muted-foreground">
              还没有账号？{" "}
              <a
                href="/register"
                className="font-medium text-primary no-underline transition-colors hover:text-primary/80"
              >
                创建账号
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="lg-footer mt-8 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground no-underline transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
