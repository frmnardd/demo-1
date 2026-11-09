import { describe, it, expect } from "vitest";
import { authenticateUser } from "../src/lib/auth";

describe("Enterprise Authentication v3.0", () => {
  it("authenticates admin user using bcrypt verified hash", () => {
    const res = authenticateUser("ardfrmn", "firman173");
    expect(res.success).toBe(true);
    expect(res.user?.username).toBe("ardfrmn");
    expect(res.user?.role).toBe("SUPER_ADMIN");
  });

  it("rejects unauthorized login attempts without demo fallback", () => {
    expect(authenticateUser("admin", "admin").success).toBe(false);
    expect(authenticateUser("ardfrmn", "wrongpass").success).toBe(false);
  });
});
