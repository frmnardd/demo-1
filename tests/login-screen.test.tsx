import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import { LoginScreen } from "../src/components/auth/login-screen";

describe("LoginScreen Component", () => {
  it("renders Fixentra branding and login inputs", () => {
    const html = renderToString(<LoginScreen onLoginSuccess={() => {}} />);
    expect(html).toContain("Fixentra");
    expect(html).toContain("Sign In");
    expect(html).toContain("Demo Credentials");
  });
});
