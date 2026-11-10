import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-2 py-1", "bg-primary")).toBe("px-2 py-1 bg-primary");
  });

  it("should handle conditional class names", () => {
    expect(cn("base-class", false && "hidden", true && "visible")).toBe("base-class visible");
  });
});
