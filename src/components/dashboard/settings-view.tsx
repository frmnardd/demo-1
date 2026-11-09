"use client";

import * as React from "react";
import { User, Bell, Globe, ShieldCheck, Check, Database, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SettingsViewProps {
  onResyncDatabase: () => void;
  currentUser?: string;
}

export function SettingsView({ onResyncDatabase, currentUser = "ardfrmn" }: SettingsViewProps) {
  const [name, setName] = React.useState("Firman Ardiansyah");
  const [email, setEmail] = React.useState("firman@fixentra.my.id");
  const [role, setRole] = React.useState("Super Administrator");
  const [currency, setCurrency] = React.useState("USD ($)");
  const [emailAlerts, setEmailAlerts] = React.useState(true);
  const [weeklyDigest, setWeeklyDigest] = React.useState(true);
  const [isResyncing, setIsResyncing] = React.useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully", {
      description: `Identity set to ${name} (${role})`,
    });
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Workspace preferences saved", {
      description: `Primary currency: ${currency}`,
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
      {/* Profile Form */}
      <Card>
        <form onSubmit={handleSaveProfile}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base font-semibold">Account Profile</CardTitle>
            </div>
            <CardDescription>
              Manage your verified operational identity and root credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Full Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Corporate Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium">Username</label>
                <Input value={currentUser} disabled className="bg-muted text-muted-foreground font-mono text-xs" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Security Role</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} />
              </div>
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
            <CardTitle className="text-base font-semibold">Notifications & Realtime Alerts</CardTitle>
          </div>
          <CardDescription>
            Configure how Fixentra Enterprise dispatches alerts for order state changes and security events
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
                Summarized financial ledger report dispatched every Monday
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

      {/* Database Ledger Maintenance */}
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
        <CardFooter className="flex justify-between items-center border-t border-primary/10 pt-4">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Prisma ORM engine running at fixentra.db
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
    </div>
  );
}
