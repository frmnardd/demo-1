import { describe, it, expect } from "vitest";
import { validateTeamMemberInput } from "../src/components/dashboard/team-view";

describe("Team RBAC Validation", () => {
  it("validates team member credentials strictly", () => {
    expect(validateTeamMemberInput({ name: "", email: "test@domain.com", password: "pass" }).valid).toBe(false);
    expect(validateTeamMemberInput({ name: "Bob", email: "invalid-email", password: "securepassword" }).valid).toBe(false);
    expect(validateTeamMemberInput({ name: "Bob", email: "bob@domain.com", password: "123" }).valid).toBe(false);
  });

  it("accepts valid team member input", () => {
    expect(
      validateTeamMemberInput({
        name: "Sarah Connor",
        email: "sarah@fixentra.my.id",
        password: "StrongPassword123",
      }).valid
    ).toBe(true);
  });
});
