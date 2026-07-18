import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";

const mocks = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getEventsId: vi.fn(),
  getEventsIdContents: vi.fn(),
  getEventsIdHeat: vi.fn(),
  getEventsIdIntelligence: vi.fn(),
  getContentsId: vi.fn(),
}));

vi.mock("@/services/hotkey/hotkey-server/events", () => ({
  ...mocks,
  postEventsIdIntelligenceExtract: vi.fn(),
  postEventsIdIntelligenceSummaryRegenerate: vi.fn(),
}));
vi.mock("@/services/hotkey/hotkey-server/reports", () => ({
  getReports: vi.fn().mockResolvedValue({ data: { items: [] } }),
  postReportsIdBuild: vi.fn(),
  postReportsIdPreview: vi.fn(),
}));
vi.mock("@/services/hotkey/hotkey-server/monitors", () => ({
  getMonitors: vi.fn().mockResolvedValue({ data: { items: [] } }),
}));
vi.mock("@/services/hotkey/hotkey-server/operations", () => ({
  getOperationsOverview: vi.fn().mockResolvedValue({ data: {} }),
}));
vi.mock("@/services/hotkey/hotkey-server/collectionRuns", () => ({
  getCollectionRuns: vi.fn().mockResolvedValue({ data: { items: [] } }),
}));
vi.mock("@/services/hotkey/hotkey-server/contents", () => ({
  getContents: vi.fn().mockResolvedValue({ data: { items: [] } }),
  getContentsId: mocks.getContentsId,
}));

describe("DashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getEvents.mockResolvedValue({
      data: { items: [{ id: 4, title_en: "A collected research event" }] },
    });
    mocks.getEventsId.mockResolvedValue({
      data: { id: 4, title_en: "A collected research event" },
    });
    mocks.getEventsIdHeat.mockRejectedValue(new Error("heat not ready"));
    mocks.getEventsIdIntelligence.mockRejectedValue(
      new Error("intelligence not ready"),
    );
    mocks.getEventsIdContents.mockResolvedValue({ data: { items: [] } });
    mocks.getContentsId.mockReset();
  });

  it("renders an event even when optional heat and intelligence projections are not ready", async () => {
    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: "A collected research event" }),
    ).toBeInTheDocument();
    expect(screen.getByText("暂无已验证声明，可重新提取事件情报。")).toBeInTheDocument();
  });

  it("keeps evidence full-width, reports partial detail loading and moves heat into Signals", async () => {
    mocks.getEvents.mockResolvedValue({
      data: {
        items: [
          { id: 4, title_en: "A collected research event", heat_score: 42 },
          { id: 5, title_en: "Another event", heat_score: 15 },
        ],
      },
    });
    mocks.getEventsIdContents.mockResolvedValue({
      data: {
        items: [
          { content_id: 11 },
          { content_id: 12 },
          { content_id: 13 },
        ],
      },
    });
    mocks.getContentsId.mockImplementation(({ id }: { id: number }) =>
      id === 13
        ? Promise.reject(new Error("detail unavailable"))
        : Promise.resolve({
            data: {
              id,
              title: `Evidence ${id}`,
              canonical_url: `https://example.test/${id}`,
            },
          }),
    );

    render(<DashboardPage />);

    expect(await screen.findByText("当前展示 2 / 共 3 条")).toBeInTheDocument();
    expect(screen.getByText("部分证据暂不可读（1 条）")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "事件热度对比" })).not.toBeInTheDocument();
    expect(screen.getByTestId("dashboard-workspace")).toHaveClass(
      "xl:grid-cols-[minmax(0,1fr)_360px]",
    );

    fireEvent.click(screen.getByRole("button", { name: "信号" }));
    expect(screen.getByRole("heading", { name: "事件热度对比" })).toBeInTheDocument();
    expect(screen.getByText("最近报告")).toBeInTheDocument();
    expect(screen.queryByText("关联报告")).not.toBeInTheDocument();
  });
});
