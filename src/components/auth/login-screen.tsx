"use client";

import * as React from "react";
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { validateCredentials, setStoredSession, VALID_USER, VALID_PASS } from "@/lib/auth";

interface LoginScreenProps {
  onLoginSuccess: (username: string) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [error, setError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const validation = validateCredentials(username, password);

      if (validation.success) {
        setStoredSession(username, rememberMe);
        onLoginSuccess(username.trim());
      } else {
        setError(validation.error || "Username atau password salah.");
        setIsLoading(false);
      }
    }, 350);
  };

  const handleFillDemo = () => {
    setUsername(VALID_USER);
    setPassword(VALID_PASS);
    setError("");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/30 to-background overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md relative z-10 border shadow-2xl backdrop-blur-sm bg-card/90">
        <CardHeader className="space-y-3 text-center pb-6">
          {/* Brand Logo */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
              Fixentra Enterprise
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              v2.0 Operations Suite &bull; fixentra.my.id
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Quick Demo Credentials Autofill Pill */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-between">
              <div className="flex flex-col text-xs">
                <span className="font-semibold text-primary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Demo Credentials
                </span>
                <span className="text-muted-foreground text-[11px] font-mono mt-0.5">
                  ardfrmn &bull; firman173
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleFillDemo}
                className="h-7 text-[11px] px-2.5 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              >
                Auto-fill
              </Button>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-2.5 flex items-center gap-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. ardfrmn"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-9 text-sm"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 text-sm"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Remember session</span>
              </label>
              <span className="text-[11px] text-muted-foreground">
                Authorized Personnel Only
              </span>
            </div>
          </CardContent>

          <CardFooter className="pt-2 flex flex-col gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2 font-medium text-sm shadow-md"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-[11px] text-center text-muted-foreground">
              Protected by Fixentra Enterprise Security Gate &bull; SSL 256-bit
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
