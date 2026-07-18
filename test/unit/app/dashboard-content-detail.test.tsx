import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ContentDetailPage from "@/app/dashboard/contents/[id]/page";

const mocks = vi.hoisted(() => ({
  id: "7",
  getContentsIdDocument: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: mocks.id }),
}));

vi.mock("@/services/hotkey/hotkey-server/contents", () => ({
  getContentsIdDocument: mocks.getContentsIdDocument,
}));

describe("ContentDetailPage", () => {
  beforeEach(() => {
    mocks.id = "7";
    mocks.getContentsIdDocument.mockReset();
  });

  it("loads a document only through the generated client", async () => {
    mocks.getContentsIdDocument.mockResolvedValue({
      data: {
        availability: "ready",
        content_id: 7,
        source_name: "Product feed",
        canonical_url: "https://example.test/items/7",
        markdown: "# Release notes",
      },
    });

    render(<ContentDetailPage />);

    expect(
      await screen.findByRole("heading", { name: "Release notes" }),
    ).toBeInTheDocument();
    expect(mocks.getContentsIdDocument).toHaveBeenCalledWith({ id: 7 });
  });

  it.each([
    [403, "无权查看该归档内容"],
    [404, "内容不存在"],
    [503, "归档暂不可用"],
  ])("shows a safe %s error state without leaking response bodies", async (code, message) => {
    mocks.getContentsIdDocument.mockRejectedValue(
      Object.assign(new Error("internal object store details"), { code }),
    );

    render(<ContentDetailPage />);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByText("internal object store details")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "返回采集内容" })).toHaveAttribute(
      "href",
      "/dashboard/contents",
    );
  });

  it("rejects an invalid content id without issuing a request", async () => {
    mocks.id = "not-an-id";

    render(<ContentDetailPage />);

    expect(await screen.findByText("内容不存在")).toBeInTheDocument();
    await waitFor(() => expect(mocks.getContentsIdDocument).not.toHaveBeenCalled());
  });
});
