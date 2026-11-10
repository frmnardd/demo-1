import { describe, it, expect, vi } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { MobileBottomNav } from "../src/components/layout/mobile-bottom-nav";

describe("MobileBottomNav Component", () => {
  it("renders 5 mobile navigation destinations", () => {
    const html = renderToString(
      <MobileBottomNav
        activeSection="overview"
        onSelectSection={() => {}}
        onOpenCopilot={() => {}}
        unreadOrderCount={3}
      />
    );

    expect(html).toContain("Home");
    expect(html).toContain("Orders");
    expect(html).toContain("AI Copilot");
    expect(html).toContain("Analytics");
    expect(html).toContain("Profile");
  });

  it("renders order badge count when pending orders exist", () => {
    const html = renderToString(
      <MobileBottomNav
        activeSection="overview"
        onSelectSection={() => {}}
        onOpenCopilot={() => {}}
        unreadOrderCount={5}
      />
    );

    expect(html).toContain("5");
  });
});
