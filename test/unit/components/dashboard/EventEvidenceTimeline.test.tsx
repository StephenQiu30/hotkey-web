import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EventEvidenceTimeline } from "@/components/dashboard/EventEvidenceTimeline";

describe("EventEvidenceTimeline", () => {
  it("shows truthful n/m evidence counts, partial failures and both reading paths", () => {
    render(
      <EventEvidenceTimeline
        contents={[
          {
            id: 11,
            title: "An archived research item",
            source_name: "arXiv · AI",
            canonical_url: "https://example.test/items/11",
          },
          {
            id: 12,
            title: "A second research item",
            source_name: "Science",
          },
        ]}
        failedCount={1}
        totalCount={3}
      />,
    );

    expect(screen.getByText("当前展示 2 / 共 3 条")).toBeInTheDocument();
    expect(screen.getByText("部分证据暂不可读（1 条）")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "阅读归档：An archived research item" }),
    ).toHaveAttribute("href", "/dashboard/contents/11");
    expect(
      screen.getByRole("link", { name: "访问原站：An archived research item" }),
    ).toHaveAttribute("href", "https://example.test/items/11");
    expect(
      screen.getByRole("link", { name: "阅读归档：A second research item" }),
    ).toHaveAttribute("href", "/dashboard/contents/12");
    expect(
      screen.queryByRole("link", { name: "访问原站：A second research item" }),
    ).not.toBeInTheDocument();
  });

  it("preserves total membership when no detail can be read", () => {
    render(
      <EventEvidenceTimeline contents={[]} failedCount={2} totalCount={2} />,
    );

    expect(screen.getByText("当前展示 0 / 共 2 条")).toBeInTheDocument();
    expect(screen.getByText("该事件有证据成员，但详情暂不可读。")).toBeInTheDocument();
  });
});
