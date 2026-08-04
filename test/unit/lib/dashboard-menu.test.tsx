import { describe, expect, it } from "vitest";
import {
  dashboardAdminMenuItems,
  dashboardMenuItems,
} from "@/app/dashboard/menuConfig";

describe("dashboard menu", () => {
  it("exposes the collected content stage in the primary navigation", () => {
    expect(dashboardMenuItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "/dashboard/contents",
          name: "采集内容",
        }),
      ])
    );
  });

  it("keeps operational pages in a secondary admin menu", () => {
    expect(dashboardMenuItems.map((item) => item.path)).not.toContain(
      "/dashboard/settings",
    );
    expect(dashboardMenuItems.map((item) => item.path)).not.toContain(
      "/dashboard/sources",
    );
    expect(dashboardAdminMenuItems.map((item) => item.path)).toEqual([
      "/dashboard/settings",
      "/dashboard/sources",
    ]);
  });
});
