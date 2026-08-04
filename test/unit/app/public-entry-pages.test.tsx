import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import NotFound from "@/app/not-found";
import AuthShell from "@/components/auth/AuthShell";

describe("公开入口页面", () => {
  it("首页清晰表达 AI 热点监控定位与核心工作流", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", { name: "重要变化，第一时间形成共识。" }),
    ).toBeInTheDocument();
    expect(screen.getByText("每天早上 07:30")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "今日情报简报" })).toBeInTheDocument();
    expect(screen.getByText("为什么重要")).toBeInTheDocument();
    expect(screen.getByText("证据来源")).toBeInTheDocument();
    expect(screen.getByText("持续监测")).toBeInTheDocument();
    expect(screen.getByText("AI 识别与判断")).toBeInTheDocument();
    expect(screen.getByText("形成共识与行动")).toBeInTheDocument();
  });

  it("首页的完整情报入口指向受保护的报告页面", () => {
    render(<HomePage />);

    expect(screen.getByRole("link", { name: "查看完整情报" })).toHaveAttribute(
      "href",
      "/dashboard/reports",
    );
  });

  it("认证页的品牌介绍区域使用可识别的辅助地标", () => {
    render(
      <AuthShell title="登录" subtitle="继续使用">
        <span>表单内容</span>
      </AuthShell>,
    );

    expect(
      screen.getByRole("complementary", { name: "HotKey 品牌介绍" }),
    ).toBeInTheDocument();
  });

  it("未找到页面提供中文说明和可恢复的导航入口", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: "页面不存在" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回首页" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "登录工作台" })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
