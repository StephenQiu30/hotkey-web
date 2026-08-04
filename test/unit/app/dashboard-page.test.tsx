import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";

const mocks = vi.hoisted(() => ({
  role: "editor",
  getEvents: vi.fn(),
  getEventsId: vi.fn(),
  getEventsIdContents: vi.fn(),
  getEventsIdHeat: vi.fn(),
  getEventsIdIntelligence: vi.fn(),
  getContentsId: vi.fn(),
  getCollectionRuns: vi.fn().mockResolvedValue({ data: { items: [] } }),
  getOperationsOverview: vi.fn().mockResolvedValue({ data: {} }),
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
  getOperationsOverview: mocks.getOperationsOverview,
}));
vi.mock("@/services/hotkey/hotkey-server/collectionRuns", () => ({
  getCollectionRuns: mocks.getCollectionRuns,
}));
vi.mock("@/services/hotkey/hotkey-server/contents", () => ({
  getContents: vi.fn().mockResolvedValue({ data: { items: [] } }),
  getContentsId: mocks.getContentsId,
}));
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: { user: { role: string } }) => unknown) =>
    selector({ user: { role: mocks.role } }),
}));

describe("DashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.role = "editor";
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

  it("does not request editor-only runtime data for a viewer", async () => {
    mocks.role = "viewer";

    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: "A collected research event" }),
    ).toBeInTheDocument();
    expect(mocks.getOperationsOverview).not.toHaveBeenCalled();
    expect(mocks.getCollectionRuns).not.toHaveBeenCalled();
  });

  it("renders an event even when optional heat and intelligence projections are not ready", async () => {
    render(<DashboardPage />);

    expect(await screen.findByText("今日重点事件")).toBeInTheDocument();
    expect(screen.getByText("监控运行中")).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "A collected research event" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "证据验证" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "证据" })).toHaveClass("inline-flex");
    expect(screen.getByRole("button", { name: "展开 AI 情报助手" })).toHaveClass("inline-flex");
    expect(
      screen.getByRole("button", { name: "刷新工作台数据" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "查看完整报告" }).querySelector("button"),
    ).toBeNull();
  });

  it("uses the shared centered page width and only pins intelligence on desktop", async () => {
    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: "A collected research event" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-shell")).toHaveClass("app-page");
    expect(screen.getByRole("complementary")).toHaveClass(
      "xl:border-l",
    );
    expect(screen.getByTestId("dashboard-workspace")).toHaveClass(
      "xl:grid-cols-[minmax(0,1.16fr)_minmax(420px,.84fr)]",
    );
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

    expect(await screen.findByText("已读取 2 条，1 条暂不可读")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "事件热度对比" })).not.toBeInTheDocument();
    expect(screen.getByTestId("dashboard-workspace")).toHaveClass(
      "xl:grid-cols-[minmax(0,1.16fr)_minmax(420px,.84fr)]",
    );

    fireEvent.click(screen.getByRole("button", { name: "信号" }));
    expect(screen.getByRole("heading", { name: "事件热度对比" })).toBeInTheDocument();
    expect(screen.queryByText("关联报告")).not.toBeInTheDocument();
  });

  it("keeps AI assistance compact until the user asks for it", async () => {
    render(<DashboardPage />);

    const trigger = await screen.findByRole("button", { name: "展开 AI 情报助手" });
    expect(screen.queryByText("暂无已验证声明，可重新提取事件情报。")).not.toBeInTheDocument();

    fireEvent.click(trigger);

    expect(screen.getByRole("button", { name: "收起 AI 情报助手" })).toBeInTheDocument();
    expect(screen.getByText("暂无已验证声明，可重新提取事件情报。")).toBeInTheDocument();
  });
});
