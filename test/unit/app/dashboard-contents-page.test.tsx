import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContentsPage from "@/app/dashboard/contents/page";

const mocks = vi.hoisted(() => ({
  getCollectionRuns: vi.fn(),
  getContents: vi.fn(),
  deleteContentsId: vi.fn(),
}));

vi.mock("@/services/hotkey/hotkey-server/collectionRuns", () => ({
  getCollectionRuns: mocks.getCollectionRuns,
}));
vi.mock("@/services/hotkey/hotkey-server/contents", () => ({
  getContents: mocks.getContents,
  deleteContentsId: mocks.deleteContentsId,
}));
vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: { user: { role: string } }) => unknown) =>
    selector({ user: { role: "editor" } }),
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

  it("confirms and deletes a fetched content, then refreshes the content page", async () => {
    mocks.getCollectionRuns.mockResolvedValue({ data: { items: [] } });
    mocks.getContents.mockResolvedValue({
      data: { items: [{ id: 7, title: "Fetched content" }] },
    });
    mocks.deleteContentsId.mockResolvedValue({ data: null });

    render(<ContentsPage />);
    const user = userEvent.setup();
    await user.click(
      await screen.findByRole("button", { name: "删除内容：Fetched content" }),
    );
    expect(screen.getByText("删除采集内容")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "确认删除" }));

    await waitFor(() => expect(mocks.deleteContentsId).toHaveBeenCalledWith({ id: 7 }));
    expect(mocks.getContents).toHaveBeenCalledTimes(2);
  });
});
