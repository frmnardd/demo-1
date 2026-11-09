"use client";

import * as React from "react";
import {
  Key,
  Plus,
  Copy,
  Check,
  Shield,
  Terminal,
  Code2,
  Trash2,
  AlertTriangle,
  ExternalLink,
  Lock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { ApiKeyRecord, ApiScope } from "@/lib/api-gateway";

export interface DeveloperPortalProps {
  apiKeys: ApiKeyRecord[];
  onGenerateKey: (name: string, permissions: ApiScope[]) => {
    secretKey: string;
    keyRecord: ApiKeyRecord;
  };
  onRevokeKey: (id: string) => void;
}

export function validateApiKeyInput(input: {
  name: string;
  permissions: string[];
}): { valid: boolean; error?: string } {
  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: "API key name cannot be empty." };
  }
  if (!input.permissions || input.permissions.length === 0) {
    return { valid: false, error: "Please select at least one permission scope." };
  }
  return { valid: true };
}

const AVAILABLE_SCOPES: { id: ApiScope; label: string; desc: string }[] = [
  {
    id: "read:orders",
    label: "read:orders",
    desc: "Retrieve order lists, customer details, and payment statuses.",
  },
  {
    id: "write:orders",
    label: "write:orders",
    desc: "Create and ingest new transactions directly into the core ledger.",
  },
  {
    id: "read:analytics",
    label: "read:analytics",
    desc: "Stream live financial aggregations and KPI calculations.",
  },
];

export function DeveloperPortal({
  apiKeys,
  onGenerateKey,
  onRevokeKey,
}: DeveloperPortalProps) {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [keyName, setKeyName] = React.useState("");
  const [selectedScopes, setSelectedScopes] = React.useState<ApiScope[]>([
    "read:orders",
  ]);
  const [createdSecret, setCreatedSecret] = React.useState<string | null>(null);
  const [hasCopied, setHasCopied] = React.useState(false);
  const [codeTab, setCodeTab] = React.useState<"curl" | "node">("curl");

  const toggleScope = (scope: ApiScope) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateApiKeyInput({
      name: keyName,
      permissions: selectedScopes,
    });
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    const { secretKey } = onGenerateKey(keyName.trim(), selectedScopes);
    setCreatedSecret(secretKey);
    setIsCreateOpen(false);
    setKeyName("");
    setSelectedScopes(["read:orders"]);
    toast.success("Live API key generated successfully.");
  };

  const copySecret = () => {
    if (!createdSecret) return;
    navigator.clipboard.writeText(createdSecret);
    setHasCopied(true);
    toast.success("API key copied to clipboard.");
    setTimeout(() => setHasCopied(false), 2000);
  };

  const sampleKeyDisplay =
    apiKeys.length > 0 && apiKeys[0].active
      ? apiKeys[0].keyPrefix
      : "fix_live_••••••••••••••••••••••••••••••••";

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" />
            Developer Gateway & API Keys
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage live production tokens, configure granular RBAC scopes, and integrate Fixentra REST APIs.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Generate New API Key
        </Button>
      </div>

      {/* API Key Metrics and Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active API Keys</CardDescription>
            <CardTitle className="text-2xl font-bold">
              {apiKeys.filter((k) => k.active).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              Secured with SHA-256 vault hashing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Gateway Status</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Live v3.0
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              fixentra.my.id/api/v1/health &bull; 99.99% uptime
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Authentication Type</CardDescription>
            <CardTitle className="text-2xl font-bold">Bearer Token</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-primary" />
              Prefix: <code className="text-[11px] font-mono">fix_live_</code>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Keys Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Active Production Tokens</CardTitle>
          <CardDescription className="text-xs">
            Secret keys are never stored in plaintext. If a key is compromised, revoke it immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Key className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
              <p>No active API keys found.</p>
              <p className="text-xs mt-1">Generate your first key to integrate with Fixentra.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="pb-3 font-medium">Key Name</th>
                    <th className="pb-3 font-medium">Key Prefix</th>
                    <th className="pb-3 font-medium">Permissions</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="hover:bg-muted/50 transition-colors">
                      <td className="py-3 font-medium text-foreground">
                        {k.name}
                      </td>
                      <td className="py-3 font-mono text-muted-foreground">
                        {k.keyPrefix}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {k.permissions.map((p) => (
                            <Badge
                              key={p}
                              variant="secondary"
                              className="text-[10px] font-mono px-1.5 py-0"
                            >
                              {p}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{k.createdAt}</td>
                      <td className="py-3">
                        {k.active ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 bg-emerald-500/5 text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-destructive text-[10px]">
                            Revoked
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {k.active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRevokeKey(k.id)}
                            className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            title="Revoke API Key"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Revoke
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Integration Guide & Code Snippets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              API Quickstart & Code Examples
            </CardTitle>
            <CardDescription className="text-xs">
              Interact with the Fixentra Enterprise REST Gateway using your live Bearer token.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
            <button
              onClick={() => setCodeTab("curl")}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                codeTab === "curl"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setCodeTab("node")}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                codeTab === "node"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Node.js Fetch
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {codeTab === "curl" ? (
            <div className="rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto border border-zinc-800">
              <div className="text-zinc-500 mb-2"># 1. Check Gateway Health</div>
              <div className="text-emerald-400 mb-3">
                curl -X GET https://fixentra.my.id/api/v1/health
              </div>
              <div className="text-zinc-500 mb-2"># 2. Query Live Orders (Requires read:orders scope)</div>
              <div className="text-blue-400">
                curl -X GET https://fixentra.my.id/api/v1/orders \<br />
                &nbsp;&nbsp;-H &quot;Authorization: Bearer {sampleKeyDisplay}&quot;
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-zinc-950 p-4 font-mono text-xs text-zinc-100 overflow-x-auto border border-zinc-800">
              <pre className="text-zinc-300">
{`const response = await fetch("https://fixentra.my.id/api/v1/orders", {
  headers: {
    "Authorization": "Bearer ${sampleKeyDisplay}",
    "Content-Type": "application/json"
  }
});
const { data, meta } = await response.json();
console.log("Orders retrieved:", meta.total);`}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Generation Modal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Production API Key</DialogTitle>
            <DialogDescription className="text-xs">
              Configure token permissions. Keys are prefixed with <code className="font-mono">fix_live_</code>.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Key Identifier / Application Name
              </label>
              <Input
                placeholder="e.g. ERP Billing Service, Zapier Ingestion"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                required
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-foreground">
                Assigned Permission Scopes
              </label>
              <div className="space-y-2">
                {AVAILABLE_SCOPES.map((scope) => (
                  <label
                    key={scope.id}
                    className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope.id)}
                      onChange={() => toggleScope(scope.id)}
                      className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs font-semibold text-foreground">
                        {scope.label}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {scope.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Generate Key
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reveal Secret Key Dialog (Review Focus #3) */}
      <Dialog
        open={!!createdSecret}
        onOpenChange={(open) => {
          if (!open) setCreatedSecret(null);
        }}
      >
        <DialogContent className="sm:max-w-lg border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              API Key Generated Successfully
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please copy your secret key right now. For security purposes, this secret will never be displayed again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Store this key securely in your environment variables. It has production privileges.
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-muted p-2 font-mono text-xs border">
              <code className="flex-1 select-all break-all text-primary font-semibold">
                {createdSecret}
              </code>
              <Button
                size="sm"
                variant="outline"
                onClick={copySecret}
                className="shrink-0 gap-1.5 h-8 text-xs"
              >
                {hasCopied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              className="w-full"
              onClick={() => {
                setCreatedSecret(null);
                toast.info("Key modal dismissed. Keep your secret safe.");
              }}
            >
              I Have Stored My API Key Securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
