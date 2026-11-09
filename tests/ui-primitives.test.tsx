import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { Button } from "../src/components/ui/button";
import { Badge } from "../src/components/ui/badge";

describe("UI Primitives", () => {
  it("renders Button with default variant and custom class", () => {
    const html = renderToString(<Button className="custom-class">Click</Button>);
    expect(html).toContain("custom-class");
    expect(html).toContain("Click");
  });

  it("renders Badge with destructive variant", () => {
    const html = renderToString(<Badge variant="destructive">Failed</Badge>);
    expect(html).toContain("Failed");
    expect(html).toContain("bg-destructive");
  });
});
