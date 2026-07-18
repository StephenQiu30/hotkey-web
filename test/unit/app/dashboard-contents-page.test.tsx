import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContentsPage from "@/app/dashboard/contents/page";

const mocks = vi.hoisted(() => ({
  getCollectionRuns: vi.fn(),
  getContents: vi.fn(),
}));

vi.mock("@/services/hotkey/hotkey-server/collectionRuns", () => ({
  getCollectionRuns: mocks.getCollectionRuns,
}));
vi.mock("@/services/hotkey/hotkey-server/contents", () => ({
  getContents: mocks.getContents,
}));

describe("ContentsPage pagination", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("passes the collection cursor when navigating to the next page", async () => {
    mocks.getCollectionRuns
      .mockResolvedValueOnce({
        data: {
          items: [{ id: 1, status: "succeeded" }],
          next_cursor: "run-cursor-1",
        },
      })
      .mockResolvedValueOnce({ data: { items: [] } });
    mocks.getContents.mockResolvedValue({ data: { items: [] } });

    render(<ContentsPage />);
    await userEvent.setup().click(await screen.findByRole("button", { name: "下一页" }));

    await waitFor(() =>
      expect(mocks.getCollectionRuns).toHaveBeenLastCalledWith({
        cursor: "run-cursor-1",
        limit: 20,
      }),
    );
  });
});
