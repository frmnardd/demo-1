import { describe, it, expect } from "vitest";
import { validateProfileUpdate, validatePasswordChange } from "../src/components/dashboard/settings-view";
import { hashPassword, verifyPassword } from "../src/lib/crypto";

describe("Profile & Settings Validation", () => {
  it("validates profile update fields strictly", () => {
    expect(validateProfileUpdate({ name: "", email: "valid@fixentra.my.id" }).valid).toBe(false);
    expect(validateProfileUpdate({ name: "Firman", email: "invalid-email" }).valid).toBe(false);
    expect(validateProfileUpdate({ name: "Firman Ardiansyah", email: "firman@fixentra.my.id" }).valid).toBe(true);
  });

  it("validates password change requirements", () => {
    // Empty current password
    expect(validatePasswordChange("", "newpassword123", "newpassword123").valid).toBe(false);
    // New password too short (< 6 chars)
    expect(validatePasswordChange("oldpass", "123", "123").valid).toBe(false);
    // Passwords mismatch
    expect(validatePasswordChange("oldpass", "newpass123", "mismatch123").valid).toBe(false);
    // Valid change
    expect(validatePasswordChange("oldpass", "newpass123", "newpass123").valid).toBe(true);
  });

  it("verifies and updates password with bcrypt hashing", () => {
    const currentRaw = "firman173";
    const currentHash = hashPassword(currentRaw);

    // Verify current password succeeds
    expect(verifyPassword("firman173", currentHash)).toBe(true);
    expect(verifyPassword("wrongpass", currentHash)).toBe(false);

    // Generate new hash
    const newRaw = "newSecurePass2026!";
    const newHash = hashPassword(newRaw);
    expect(verifyPassword(newRaw, newHash)).toBe(true);
  });
});
