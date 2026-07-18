import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "@/app/dashboard/page";

const mocks = vi.hoisted(() => ({
  getEvents: vi.fn(),
  getEventsId: vi.fn(),
  getEventsIdContents: vi.fn(),
  getEventsIdHeat: vi.fn(),
  getEventsIdIntelligence: vi.fn(),
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
  getContentsId: vi.fn(),
}));

describe("DashboardPage", () => {
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
  });

  it("renders an event even when optional heat and intelligence projections are not ready", async () => {
    render(<DashboardPage />);

    expect(
      await screen.findByRole("heading", { name: "A collected research event" }),
    ).toBeInTheDocument();
    expect(screen.getByText("暂无已验证声明，可重新提取事件情报。")).toBeInTheDocument();
  });
});
