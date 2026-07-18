import { render, screen } from "@testing-library/react";
import { Activity } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TopNav from "@/components/dashboard/TopNav";
import { useAuthStore } from "@/stores/authStore";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("TopNav", () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: "authenticated",
      user: {
        id: 2,
        email: "qa@example.test",
        display_name: "QA",
        role: "admin",
        status: "active",
      },
      error: null,
    });
  });

  it("keeps desktop navigation labels intact at constrained widths", () => {
    render(
      <TopNav
        menuItems={[
          { path: "/dashboard", name: "工作台", icon: <Activity /> },
        ]}
      />,
    );

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
  });

  it("keeps search available without forcing the full navigation to shrink", () => {
    render(<TopNav menuItems={[]} />);

    expect(screen.getByRole("search", { name: "工作台搜索" })).toHaveClass(
      "md:flex",
      "min-w-0",
    );
  });
});
