"use client";

export default function WelcomeFooter() {
  return (
    <footer className="border-t border-border/50 px-4 py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} HotKey</span>
        <div className="flex gap-5">
          <a href="mailto:support@hotkey.dev" className="transition-colors hover:text-foreground">
            联系我们
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-foreground">
            隐私政策
          </a>
          <a href="#" onClick={(e) => e.preventDefault()} className="transition-colors hover:text-foreground">
            服务条款
          </a>
        </div>
      </div>
    </footer>
  );
}
