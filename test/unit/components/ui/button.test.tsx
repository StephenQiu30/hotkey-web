import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("uses an accessible dark surface for destructive actions", () => {
    render(<Button variant="destructive">确认删除</Button>);

    expect(screen.getByRole("button", { name: "确认删除" })).toHaveClass(
      "bg-red-700",
      "text-white",
    );
  });
});
