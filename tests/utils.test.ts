import { describe, it, expect } from "vitest";
import { cn } from "../src/lib/utils";

describe("cn utility", () => {
  it("merges standard class names and handles conditional classes", () => {
    expect(cn("px-2 py-1", "bg-blue-500")).toBe("px-2 py-1 bg-blue-500");
    expect(cn("px-2", false && "hidden", "text-sm")).toBe("px-2 text-sm");
  });

  it("resolves conflicting tailwind classes cleanly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });
});
