"use client";

import * as React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Fixentra Enterprise Application Exception:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="max-w-md w-full rounded-2xl border bg-card p-6 shadow-xl text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-foreground">
            Operational Exception Detected
          </h2>
          <p className="text-xs text-muted-foreground">
            Fixentra Core caught an unexpected client exception. Your session state has been preserved.
          </p>
        </div>
        {error?.message && (
          <div className="p-3 rounded-lg bg-muted/40 text-left font-mono text-[11px] text-muted-foreground break-all border">
            {error.message}
          </div>
        )}
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => reset()}
            className="gap-1.5 text-xs shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.location.href = "/";
            }}
            className="gap-1.5 text-xs shadow-sm"
          >
            <Home className="h-3.5 w-3.5" />
            Reload Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}
