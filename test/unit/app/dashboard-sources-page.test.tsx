import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SourcesPage from "@/app/dashboard/sources/page";
import { useAuthStore } from "@/stores/authStore";
import { AuthStatus, UserRole } from "@/lib/domainEnums";

const mocks = vi.hoisted(() => ({
  getSourceConnections: vi.fn(),
  postSourceConnections: vi.fn(),
}));

vi.mock("@/services/hotkey/hotkey-server/sources", () => ({
  getSourceConnections: mocks.getSourceConnections,
  postSourceConnections: mocks.postSourceConnections,
  postSourceConnectionsIdDisable: vi.fn(),
  postSourceConnectionsIdEnable: vi.fn(),
  postSourceConnectionsIdHealth: vi.fn(),
  postSourceConnectionsIdArchive: vi.fn(),
}));

const setRole = (role: UserRole) => {
  useAuthStore.setState({
    status: AuthStatus.Authenticated,
    user: { id: 1, email: `${role}@example.test`, role },
    error: null,
  });
};

const openCompletedForm = async () => {
  const user = userEvent.setup();
  await user.click(await screen.findByRole("button", { name: "新增来源" }));
  await user.type(screen.getByLabelText("名称"), "Research feed");
  await user.type(
    screen.getByLabelText("接口地址"),
    "https://example.test/feed.xml",
  );
  return user;
};

describe("SourcesPage body storage authorization", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSourceConnections.mockResolvedValue({ data: { items: [] } });
    mocks.postSourceConnections.mockResolvedValue({ data: { id: 1 } });
    setRole(UserRole.Admin);
  });

  it("submits an explicit false by default", async () => {
    render(<SourcesPage />);
    const user = await openCompletedForm();

    const checkbox = screen.getByRole("checkbox", {
      name: "保存来源正文/摘要用于归档预览",
    });
    expect(checkbox).not.toBeChecked();
    expect(
      screen.getByText(
        "只保存来源 Feed 实际提供的正文/摘要，不抓取原网页；启用前确认来源条款。",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "创建连接" }));
    await waitFor(() =>
      expect(mocks.postSourceConnections).toHaveBeenCalledWith(
        expect.objectContaining({
          config: { allow_body_storage: false },
        }),
      ),
    );
  });

  it("submits true only after explicit consent and resets after closing", async () => {
    render(<SourcesPage />);
    const user = await openCompletedForm();
    const checkbox = screen.getByRole("checkbox", {
      name: "保存来源正文/摘要用于归档预览",
    });

    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.click(screen.getByRole("button", { name: "取消" }));
    await user.click(screen.getByRole("button", { name: "新增来源" }));
    expect(
      screen.getByRole("checkbox", {
        name: "保存来源正文/摘要用于归档预览",
      }),
    ).not.toBeChecked();

    await user.click(
      screen.getByRole("checkbox", {
        name: "保存来源正文/摘要用于归档预览",
      }),
    );
    await user.type(screen.getByLabelText("名称"), "Second feed");
    await user.type(
      screen.getByLabelText("接口地址"),
      "https://example.test/second.xml",
    );
    await user.click(screen.getByRole("button", { name: "创建连接" }));

    await waitFor(() =>
      expect(mocks.postSourceConnections).toHaveBeenCalledWith(
        expect.objectContaining({
          config: { allow_body_storage: true },
        }),
      ),
    );
  });

  it.each([UserRole.Viewer, UserRole.Editor])(
    "keeps source creation and body authorization hidden from %s",
    async (role) => {
      setRole(role);
      render(<SourcesPage />);

      expect(
        await screen.findByText("只读来源目录"),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "新增来源" })).not.toBeInTheDocument();
      expect(
        screen.queryByRole("checkbox", {
          name: "保存来源正文/摘要用于归档预览",
        }),
      ).not.toBeInTheDocument();
    },
  );
});
