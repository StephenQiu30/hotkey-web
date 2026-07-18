import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyWorkspace } from "@/components/dashboard/EmptyWorkspace";
import { MonitorStatus } from "@/lib/domainEnums";

describe("EmptyWorkspace", () => {
  it("shows an existing draft and explains why no events exist yet", () => {
    render(
      <EmptyWorkspace
        monitors={[
          {
            id: 8,
            name: "AI Agent 创建工具",
            status: MonitorStatus.Draft,
            draft: {
              collection_interval_seconds: 900,
              rules: [{ value: "Anthropic" }],
              sources: [{ source_connection_id: 1 }],
            },
          },
        ]}
        overview={{ running_jobs: 0 }}
      />
    );

    expect(screen.getByText("AI Agent 创建工具")).toBeInTheDocument();
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("草稿不会创建采集任务")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "发布监控" })).toHaveAttribute(
      "href",
      "/dashboard/settings"
    );
  });

  it("keeps the creation call to action when no monitor exists", () => {
    render(<EmptyWorkspace monitors={[]} />);

    expect(screen.getByText("还没有配置监控")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "创建监控" })).toHaveAttribute(
      "href",
      "/dashboard/settings"
    );
  });
});
