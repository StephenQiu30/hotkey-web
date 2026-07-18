import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollectionWorkspace } from "@/components/dashboard/CollectionWorkspace";

describe("CollectionWorkspace", () => {
  it("shows recent runs and normalized content as separate pipeline stages", () => {
    render(
      <CollectionWorkspace
        runs={[
          {
            id: 21,
            status: "failed",
            candidate_count: 3,
            accepted_count: 0,
            rejected_count: 3,
            error_code: "destination_not_permitted",
          },
          {
            id: 20,
            status: "succeeded",
            candidate_count: 5,
            accepted_count: 4,
            rejected_count: 1,
          },
        ]}
        contents={[
          {
            id: 4,
            title: "Agent systems are changing software development",
            source_name: "arXiv · Artificial Intelligence",
            canonical_url: "https://example.test/paper",
            fetched_at: "2026-07-18T04:00:00Z",
          },
        ]}
      />
    );

    expect(
      screen.getByRole("heading", { name: "最近采集批次" })
    ).toBeInTheDocument();
    expect(screen.getByText("destination_not_permitted")).toBeInTheDocument();
    expect(
      screen.getByText("Agent systems are changing software development")
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看原文" })).toHaveAttribute(
      "href",
      "https://example.test/paper"
    );
  });

  it("explains when the scheduler has not created any run", () => {
    render(<CollectionWorkspace runs={[]} contents={[]} />);

    expect(screen.getByText("尚未产生采集批次")).toBeInTheDocument();
    expect(
      screen.getByText("发布监控后仍长期停留在这里，通常表示后台调度器未创建任务。")
    ).toBeInTheDocument();
  });
});
