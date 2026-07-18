import { describe, expect, it } from "vitest";
import { dashboardMenuItems } from "@/app/dashboard/menuConfig";

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
});
