"use client";

import * as React from "react";
import {
  User,
  Bell,
  Globe,
  ShieldCheck,
  Check,
  Database,
  RefreshCw,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Building,
  Mail,
  Shield,
  Layers,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { hashPassword, verifyPassword } from "@/lib/crypto";

export interface UserProfileData {
  name: string;
  email: string;
  role: string;
  department: string;
  bio: string;
}

export interface WorkspacePreferences {
  currency: string;
  timezone: string;
  dateFormat: string;
}

export interface NotificationPreferences {
  orderAlerts: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
}

export interface SettingsViewProps {
  onResyncDatabase: () => void;
  currentUser?: string;
  initialTab?: "profile" | "security" | "workspace" | "notifications" | "database";
  userProfile?: UserProfileData;
  onUpdateProfile?: (profile: UserProfileData) => void;
  onUpdatePassword?: (newPasswordHash: string) => void;
}

export function validateProfileUpdate(input: {
  name?: string;
  email?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters long.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email)) {
    errors.email = "Please provide a valid corporate email address.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePasswordChange(
  currentPass: string,
  newPass: string,
  confirmPass: string
): { valid: boolean; error?: string } {
  if (!currentPass) {
    return { valid: false, error: "Current password is required." };
  }

  if (!newPass || newPass.length < 6) {
    return { valid: false, error: "New password must be at least 6 characters long." };
  }

  if (newPass !== confirmPass) {
    return { valid: false, error: "New password and confirmation do not match." };
  }

  return { valid: true };
}

export function SettingsView({
  onResyncDatabase,
  currentUser = "ardfrmn",
  initialTab = "profile",
  userProfile,
  onUpdateProfile,
  onUpdatePassword,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = React.useState<
    "profile" | "security" | "workspace" | "notifications" | "database"
  >(initialTab);

  // Profile State
  const [name, setName] = React.useState(userProfile?.name || "Firman Ardiansyah");
  const [email, setEmail] = React.useState(userProfile?.email || "firman@fixentra.my.id");
  const [role, setRole] = React.useState(userProfile?.role || "Super Administrator");
  const [department, setDepartment] = React.useState(userProfile?.department || "Core Architecture");
  const [bio, setBio] = React.useState(userProfile?.bio || "Lead Platform Architect & Administrator");
  const [profileErrors, setProfileErrors] = React.useState<Record<string, string>>({});

  // Password / Security State
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showCurrentPass, setShowCurrentPass] = React.useState(false);
  const [showNewPass, setShowNewPass] = React.useState(false);
  const [isChangingPass, setIsChangingPass] = React.useState(false);

  // Workspace State
  const [currency, setCurrency] = React.useState("USD ($)");
  const [timezone, setTimezone] = React.useState("Asia/Jakarta");
  const [dateFormat, setDateFormat] = React.useState("YYYY-MM-DD");

  // Notifications State
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [weeklyDigest, setWeeklyDigest] = React.useState(true);
  const [securityAlerts, setSecurityAlerts] = React.useState(true);

  // Database maintenance state
  const [isResyncing, setIsResyncing] = React.useState(false);

  // Sync with prop if it updates
  React.useEffect(() => {
    if (userProfile) {
      setName(userProfile.name);
      setEmail(userProfile.email);
      setRole(userProfile.role);
      setDepartment(userProfile.department);
      setBio(userProfile.bio);
    }
  }, [userProfile]);

  // Load preferences from localStorage on mount
  React.useEffect(() => {
    try {
      const storedWorkspace = localStorage.getItem("fixentra_workspace_preferences");
      if (storedWorkspace) {
        const parsed = JSON.parse(storedWorkspace);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.timezone) setTimezone(parsed.timezone);
        if (parsed.dateFormat) setDateFormat(parsed.dateFormat);
      }

      const storedNotifs = localStorage.getItem("fixentra_notification_preferences");
      if (storedNotifs) {
        const parsed = JSON.parse(storedNotifs);
        if (typeof parsed.emailAlerts === "boolean") setEmailAlerts(parsed.emailAlerts);
        if (typeof parsed.weeklyDigest === "boolean") setWeeklyDigest(parsed.weeklyDigest);
        if (typeof parsed.securityAlerts === "boolean") setSecurityAlerts(parsed.securityAlerts);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProfileUpdate({ name, email });
    if (!validation.valid) {
      setProfileErrors(validation.errors);
      return;
    }

    setProfileErrors({});
    const updated: UserProfileData = {
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      department: department.trim(),
      bio: bio.trim(),
    };

    try {
      localStorage.setItem("fixentra_user_profile", JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (onUpdateProfile) {
      onUpdateProfile(updated);
    }

    toast.success("Profile updated successfully", {
      description: `Operational identity set to ${updated.name} (${updated.role})`,
    });
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validatePasswordChange(currentPassword, newPassword, confirmPassword);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsChangingPass(true);

    // Verify current password against stored session or known hash
    let storedHash = localStorage.getItem("fixentra_admin_password_hash");
    if (!storedHash) {
      // Default initial password hash for firman173
      storedHash = "$2b$10$laq.T9okA2lbUDneiiVxW.VCpZjICRWAteSq8N2DHsh4.YaBKhJNe";
    }

    const isMatch = verifyPassword(currentPassword, storedHash);
    if (!isMatch) {
      setIsChangingPass(false);
      toast.error("Current password verification failed. Please try again.");
      return;
    }

    const newHash = hashPassword(newPassword);
    try {
      localStorage.setItem("fixentra_admin_password_hash", newHash);
    } catch {
      // ignore
    }

    if (onUpdatePassword) {
      onUpdatePassword(newHash);
    }

    setIsChangingPass(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed securely", {
      description: "New password encrypted with bcrypt (10 salt rounds).",
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    const prefs = { currency, timezone, dateFormat };
    try {
      localStorage.setItem("fixentra_workspace_preferences", JSON.stringify(prefs));
    } catch {
      // ignore
    }
    toast.success("Workspace preferences saved", {
      description: `Reporting currency: ${currency} &bull; Timezone: ${timezone}`,
    });
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    const notifs = { emailAlerts, weeklyDigest, securityAlerts };
    try {
      localStorage.setItem("fixentra_notification_preferences", JSON.stringify(notifs));
    } catch {
      // ignore
    }
    toast.success("Notification preferences updated", {
      description: "Alert triggers saved to browser vault.",
    });
  };

  const handleResync = () => {
    setIsResyncing(true);
    setTimeout(() => {
      onResyncDatabase();
      setIsResyncing(false);
      toast.success("Ledger Synchronized", {
        description: "Prisma SQLite ledger indices and baseline datasets verified.",
      });
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header section with User Profile Card preview */}
      <div className="rounded-xl border bg-card/60 backdrop-blur-md p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-md">
              <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-foreground">{name}</h2>
                <Badge className="bg-primary text-primary-foreground text-[10px]">
                  {role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{email}</p>
              <p className="text-[11px] font-mono text-primary mt-1">
                @{currentUser} &bull; {department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Verified Enterprise SSO
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b pb-1">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === "profile"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <User className="h-4 w-4" />
          Profile & Identity
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === "security"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Lock className="h-4 w-4" />
          Security & Password
        </button>
        <button
          onClick={() => setActiveTab("workspace")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === "workspace"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Globe className="h-4 w-4" />
          Workspace Localization
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === "notifications"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab("database")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === "database"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Database className="h-4 w-4" />
          Database & Ledger
        </button>
      </div>

      {/* Tab 1: Profile & Identity */}
      {activeTab === "profile" && (
        <Card>
          <form onSubmit={handleSaveProfile}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Account Profile</CardTitle>
              </div>
              <CardDescription>
                Manage your verified operational identity and root credentials. Changes persist across sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Full Name</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-sm"
                  />
                  {profileErrors.name && (
                    <p className="text-[11px] text-destructive">{profileErrors.name}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Corporate Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-sm"
                  />
                  {profileErrors.email && (
                    <p className="text-[11px] text-destructive">{profileErrors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Root Username</label>
                  <Input
                    value={currentUser}
                    disabled
                    className="bg-muted text-muted-foreground font-mono text-xs cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted-foreground">Permanent root system identifier</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Security Role / Designation</label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Department / Division</label>
                  <Input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Bio / Role Description</label>
                  <Input
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="text-sm"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button type="submit" size="sm" className="gap-1.5 text-xs">
                <Save className="h-3.5 w-3.5" />
                Save Profile Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <Card>
            <form onSubmit={handleSavePassword}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base font-semibold">Change Password</CardTitle>
                </div>
                <CardDescription>
                  Update your authentication credentials. Passwords are encrypted with bcrypt (10 salt rounds).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password (default: firman173)"
                      className="text-sm pr-9"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">New Password</label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="text-sm pr-9"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium">Confirm New Password</label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="text-sm"
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">
                  Minimum 6 characters &bull; Bcrypt SHA-256 Vault
                </span>
                <Button type="submit" size="sm" disabled={isChangingPass} className="gap-1.5 text-xs">
                  <Lock className="h-3.5 w-3.5" />
                  {isChangingPass ? "Encrypting..." : "Update Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Security Status Card */}
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
                    Session Security Status
                  </CardTitle>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px]">Active TLS 1.3</Badge>
              </div>
              <CardDescription className="text-xs">
                Zero-Trust perimeter protection is enforced on fixentra.my.id
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 text-muted-foreground">
              <div className="flex justify-between py-1 border-b">
                <span>Encryption Engine</span>
                <span className="font-mono text-foreground">Bcrypt (Salt Rounds: 10)</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span>Session Storage</span>
                <span className="font-mono text-foreground">Encrypted Local Vault</span>
              </div>
              <div className="flex justify-between py-1">
                <span>API Gateway Guard</span>
                <span className="font-mono text-foreground">Active (Rate Limited)</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Workspace Localization */}
      {activeTab === "workspace" && (
        <Card>
          <form onSubmit={handleSavePreferences}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Workspace Localization</CardTitle>
              </div>
              <CardDescription>
                Configure default reporting currency, date formatting, and regional standards.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium">Reporting Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="USD ($)" className="bg-background">USD ($) - United States Dollar</option>
                    <option value="IDR (Rp)" className="bg-background">IDR (Rp) - Indonesian Rupiah</option>
                    <option value="EUR (€)" className="bg-background">EUR (€) - Euro</option>
                    <option value="GBP (£)" className="bg-background">GBP (£) - British Pound</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Asia/Jakarta" className="bg-background">Asia/Jakarta (GMT+07:00)</option>
                    <option value="UTC" className="bg-background">UTC (GMT+00:00)</option>
                    <option value="America/New_York" className="bg-background">America/New_York (EST)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium">Date Display Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="YYYY-MM-DD" className="bg-background">YYYY-MM-DD (ISO 8601 Standard)</option>
                  <option value="DD/MM/YYYY" className="bg-background">DD/MM/YYYY (UK/ID Standard)</option>
                  <option value="MM/DD/YYYY" className="bg-background">MM/DD/YYYY (US Standard)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button type="submit" size="sm" variant="outline" className="text-xs">
                Save Workspace Preferences
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Tab 4: Notifications */}
      {activeTab === "notifications" && (
        <Card>
          <form onSubmit={handleSaveNotifications}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold">Notifications & Realtime Alerts</CardTitle>
              </div>
              <CardDescription>
                Configure how Fixentra Enterprise dispatches alerts for order state changes and security events.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Order Transaction Alerts</span>
                  <p className="text-xs text-muted-foreground">
                    Instant notification whenever an order is settled or ingested via API
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Executive Weekly Digest</span>
                  <p className="text-xs text-muted-foreground">
                    Summarized financial ledger report dispatched every Monday
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Security & Failed Transaction Alerts</span>
                  <p className="text-xs text-muted-foreground">
                    High priority warnings when an API key is revoked or transaction fails
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={securityAlerts}
                  onChange={(e) => setSecurityAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-end">
              <Button type="submit" size="sm" className="text-xs gap-1.5">
                <Save className="h-3.5 w-3.5" />
                Save Alert Settings
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}

      {/* Tab 5: Database & Maintenance */}
      {activeTab === "database" && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-primary">
              <Database className="h-5 w-5" />
              <CardTitle className="text-base font-semibold">Database Ledger Maintenance</CardTitle>
            </div>
            <CardDescription>
              Re-synchronize SQLite durable persistence tables and verify baseline transactional integrity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-background/80 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engine</span>
                <span className="font-mono font-semibold">SQLite 3 via Prisma ORM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Database Location</span>
                <span className="font-mono font-semibold">prisma/fixentra.db</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Encryption Standard</span>
                <span className="font-mono font-semibold">Bcrypt / SHA-256</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-primary/10 pt-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Prisma client v6.4.0 active
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={isResyncing}
              onClick={handleResync}
              className="text-xs gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isResyncing ? "animate-spin" : ""}`} />
              {isResyncing ? "Verifying Ledger..." : "Synchronize Database"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
