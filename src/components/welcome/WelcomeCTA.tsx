"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function WelcomeCTA() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.from(".wc-inner", {
      y: 20, opacity: 0, duration: 0.7, ease: "power3.out",
      scrollTrigger: { trigger: containerRef.current, start: "top 85%" },
    });
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="border-t border-border/50 px-4 py-20 sm:py-28">
      <div className="wc-inner mx-auto max-w-md text-center">
        <span className="section-eyebrow justify-center">Get Started</span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
          准备好开始创作了吗？
        </h2>
        <p className="mt-2 mb-8 text-sm leading-relaxed text-muted-foreground">
          免费注册，即刻体验热点追踪与选题推荐
        </p>
        <a href="/register">
          <Button className="h-9 rounded-md px-6 text-sm shadow-button">
            免费开始使用
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </a>
      </div>
    </section>
  );
}
