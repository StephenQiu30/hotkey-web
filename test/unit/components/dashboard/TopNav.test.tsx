import { cleanup, render, screen } from "@testing-library/react";
import { Activity, Database } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import TopNav from "@/components/dashboard/TopNav";
import { useAuthStore } from "@/stores/authStore";
import { AuthStatus, UserRole } from "@/lib/domainEnums";

const navigationMocks = vi.hoisted(() => ({ pathname: "/dashboard" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationMocks.pathname,
}));

describe("TopNav", () => {
  afterEach(cleanup);

  beforeEach(() => {
    navigationMocks.pathname = "/dashboard";
    useAuthStore.setState({
      status: AuthStatus.Authenticated,
      user: {
        id: 2,
        email: "qa@example.test",
        display_name: "QA",
        role: UserRole.Admin,
        status: "active",
      },
      error: null,
    });
  });

  it("keeps desktop navigation labels intact at constrained widths", () => {
    render(
      <TopNav
        menuItems={[{ path: "/dashboard", name: "工作台", icon: <Activity /> }]}
      />,
    );

    expect(screen.getByRole("banner")).toHaveAttribute("data-top-nav");
    expect(screen.getByRole("banner")).toHaveClass("bg-white/90");
    expect(screen.getByRole("navigation", { name: "主导航" })).toHaveClass(
      "shrink-0",
      "xl:flex",
    );
    expect(screen.getByRole("link", { name: /工作台/ })).toHaveClass(
      "whitespace-nowrap",
    );
    expect(screen.getByRole("button", { name: "切换导航" })).toHaveClass(
      "xl:hidden",
    );
    const accountMenu = screen.getByRole("button", { name: "账户菜单" });
    expect(accountMenu).toHaveAttribute(
      "data-nav-menu-trigger",
      "account",
    );
    expect(accountMenu).not.toHaveClass("focus-visible:ring-2");
  });

  it("offers a working shortcut to collected data without a fake search control", () => {
    render(<TopNav menuItems={[]} />);

    expect(screen.queryByRole("search")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "查看采集数据" })).toHaveAttribute(
      "href",
      "/dashboard/contents",
    );
  });

  it("renders operational pages as first-class admin-only navigation links", () => {
    const { rerender } = render(
      <TopNav
        menuItems={[]}
        adminMenuItems={[
          { path: "/dashboard/sources", name: "来源管理", icon: <Database /> },
        ]}
      />,
    );

    const mainNavigation = screen.getByRole("navigation", { name: "主导航" });
    const navigationList = mainNavigation.querySelector("ul");
    const sourcesLink = screen.getByRole("link", { name: /来源管理/ });
    expect(mainNavigation).toHaveAttribute("data-orientation", "horizontal");
    expect(navigationList).toContainElement(sourcesLink);
    expect(sourcesLink.closest("li")).not.toBeNull();
    expect(sourcesLink).toHaveAttribute("href", "/dashboard/sources");
    expect(screen.queryByRole("button", { name: "管理" })).not.toBeInTheDocument();

    useAuthStore.setState((state) => ({
      ...state,
      user: state.user ? { ...state.user, role: UserRole.Viewer } : null,
    }));
    rerender(
      <TopNav
        menuItems={[]}
        adminMenuItems={[
          { path: "/dashboard/sources", name: "来源管理", icon: <Database /> },
        ]}
      />,
    );

    expect(screen.queryByRole("link", { name: /来源管理/ })).not.toBeInTheDocument();
  });

  it("shows the operational link as active on its page", () => {
    navigationMocks.pathname = "/dashboard/sources";

    render(
      <TopNav
        menuItems={[]}
        adminMenuItems={[
          { path: "/dashboard/sources", name: "来源管理", icon: <Database /> },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: /来源管理/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
