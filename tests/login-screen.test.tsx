import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { LoginScreen } from "../src/components/auth/login-screen";

describe("LoginScreen Component", () => {
  it("renders Fixentra production branding and purges demo credentials", () => {
    const html = renderToString(<LoginScreen onLoginSuccess={() => {}} />);
    expect(html).toContain("Fixentra Enterprise");
    expect(html).toContain("Sign In");
    expect(html).toContain("Production Gateway v3.0");
    // Verify zero demo artifacts
    expect(html).not.toContain("Demo Credentials");
    expect(html).not.toContain("Auto-fill");
  });
});
