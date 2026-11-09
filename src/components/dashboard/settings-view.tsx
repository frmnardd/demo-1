"use client";

import * as React from "react";
import { User, Bell, Globe, ShieldAlert, Check } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsViewProps {
  onResetData: () => void;
}

export function SettingsView({ onResetData }: SettingsViewProps) {
  const [name, setName] = React.useState("Firman Ardiansyah");
  const [email, setEmail] = React.useState("admin@acmeflow.dev");
  const [role, setRole] = React.useState("Lead Architect");
  const [currency, setCurrency] = React.useState("USD ($)");
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [weeklyDigest, setWeeklyDigest] = React.useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully", {
      description: `Name set to ${name} (${role})`,
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Workspace preferences saved", {
      description: `Primary currency: ${currency}`,
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Form */}
      <Card>
        <form onSubmit={handleSaveProfile}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Account Profile</CardTitle>
            </div>
            <CardDescription>
              Update your personal credentials and operational identity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Work Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Role / Title</label>
              <Input value={role} onChange={(e) => setRole(e.target.value)} />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" size="sm" className="gap-1.5 text-xs">
              <Check className="h-3.5 w-3.5" />
              Save Profile Changes
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Workspace Preferences */}
      <Card>
        <form onSubmit={handleSavePreferences}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Workspace Localization</CardTitle>
            </div>
            <CardDescription>
              Configure default reporting currency, date formatting, and regional standards
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
                <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="Asia/Jakarta" className="bg-background">Asia/Jakarta (GMT+07:00)</option>
                  <option value="UTC" className="bg-background">UTC (GMT+00:00)</option>
                  <option value="America/New_York" className="bg-background">America/New_York (EST)</option>
                </select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4 flex justify-end">
            <Button type="submit" size="sm" variant="outline" className="text-xs">
              Save Preferences
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Notification Toggles */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold">Notifications & Alerts</CardTitle>
          </div>
          <CardDescription>
            Choose how Acme Flow informs you about real-time order completions and digests
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Order Transaction Alerts</span>
              <p className="text-xs text-muted-foreground">
                Instant notification whenever a customer finishes checkout
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => {
                setEmailAlerts(e.target.checked);
                toast.info(`Order alerts ${e.target.checked ? "enabled" : "disabled"}`);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Executive Weekly Digest</span>
              <p className="text-xs text-muted-foreground">
                Weekly summarized report sent every Monday morning
              </p>
            </div>
            <input
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => {
                setWeeklyDigest(e.target.checked);
                toast.info(`Weekly digest ${e.target.checked ? "enabled" : "disabled"}`);
              }}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone: Reset Data */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <CardTitle className="text-base font-semibold">Demo Data Reset</CardTitle>
          </div>
          <CardDescription>
            Restore all orders, customers, and KPI metrics back to clean factory state
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center border-t border-destructive/20 pt-4">
          <span className="text-xs text-muted-foreground">
            This will wipe custom created orders and restore initial seed items.
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              onResetData();
              toast.success("Dataset restored", {
                description: "All transactions and KPI totals reset to factory demo values.",
              });
            }}
            className="text-xs"
          >
            Reset Demo Data
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
