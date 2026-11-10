"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
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
import { UserRole } from "@/lib/auth";

export interface TeamMember {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  joinedAt: string;
  active: boolean;
  passwordHash?: string;
}

export interface TeamViewProps {
  team: TeamMember[];
  onAddMember: (member: {
    username: string;
    name: string;
    email: string;
    role: UserRole;
    password: string;
  }) => void;
  onRevokeMember: (id: string) => void;
}

export function validateTeamMemberInput(input: {
  name?: string;
  email?: string;
  password?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Full name must be at least 2 characters.";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!input.email || !emailRegex.test(input.email)) {
    errors.email = "Please provide a valid corporate email address.";
  }

  if (!input.password || input.password.length < 6) {
    errors.password = "Password must be at least 6 characters long.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function TeamView({ team, onAddMember, onRevokeMember }: TeamViewProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [role, setRole] = React.useState<UserRole>("OPERATOR");
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});

  const handleOpenModal = () => {
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("OPERATOR");
    setFormErrors({});
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateTeamMemberInput({ name, email, password });

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    const cleanUsername = (username || name.toLowerCase().replace(/\s+/g, ".")).trim();

    onAddMember({
      name: name.trim(),
      username: cleanUsername,
      email: email.trim(),
      role,
      password,
    });

    setIsOpen(false);
    toast.success(`Team member ${name} provisioned as ${role}.`);
  };

  const getRoleBadge = (memberRole: UserRole) => {
    switch (memberRole) {
      case "SUPER_ADMIN":
        return (
          <Badge className="bg-primary text-primary-foreground text-[10px] gap-1">
            <ShieldAlert className="h-3 w-3" />
            SUPER ADMIN
          </Badge>
        );
      case "FINANCE_MANAGER":
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] gap-1">
            <ShieldCheck className="h-3 w-3" />
            FINANCE MGR
          </Badge>
        );
      case "OPERATOR":
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1">
            <Shield className="h-3 w-3" />
            OPERATOR
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Team & Role-Based Access Control
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Provision verified team members, manage enterprise permissions, and audit operator identities.
          </p>
        </div>
        <Button onClick={handleOpenModal} className="gap-2 shrink-0">
          <UserPlus className="h-4 w-4" />
          Provision Team Member
        </Button>
      </div>

      {/* Role Definitions Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-primary">
                Super Admin
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-primary" />
            </div>
            <CardDescription className="text-xs">
              Root authority across Fixentra
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>&bull; Developer API key lifecycle</div>
            <div>&bull; Team user provisioning & deletion</div>
            <div>&bull; Full database mutations & audit trail</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-emerald-600">
                Finance Manager
              </CardTitle>
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
            </div>
            <CardDescription className="text-xs">
              Ledger & revenue operations
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>&bull; Create & update order statuses</div>
            <div>&bull; CSV / JSON financial ledger export</div>
            <div>&bull; Live revenue aggregations & analytics</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Operator
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardDescription className="text-xs">
              Standard operations desk
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-1">
            <div>&bull; Read-only customer and order viewer</div>
            <div>&bull; Product catalog lookup</div>
            <div>&bull; AI Copilot SQL question answering</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Roster Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Authorized Personnel Directory</CardTitle>
          <CardDescription className="text-xs">
            Team accounts are hardened with bcrypt password hashes. Default root administrator cannot be revoked.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Username</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Corporate Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium hidden lg:table-cell">Joined Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {team.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/50 transition-colors">
                    <td className="py-3 font-medium text-foreground">
                      <div>{member.name}</div>
                      <div className="text-[11px] font-normal text-muted-foreground sm:hidden font-mono mt-0.5">
                        @{member.username} &bull; {member.email}
                      </div>
                    </td>
                    <td className="py-3 font-mono text-muted-foreground hidden sm:table-cell">
                      @{member.username}
                    </td>
                    <td className="py-3 text-muted-foreground hidden md:table-cell">
                      {member.email}
                    </td>
                    <td className="py-3">{getRoleBadge(member.role)}</td>
                    <td className="py-3 text-muted-foreground hidden lg:table-cell">{member.joinedAt}</td>
                    <td className="py-3">
                      {member.active ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="text-destructive font-medium">Deactivated</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {member.username === "ardfrmn" ? (
                        <span className="text-[11px] text-muted-foreground italic">
                          Permanent Root
                        </span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRevokeMember(member.id)}
                          className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Deactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Provision Member Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Provision Team Member</DialogTitle>
            <DialogDescription className="text-xs">
              Create an authentic account with password encryption and RBAC role assignment.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
              {formErrors.name && (
                <p className="text-[11px] text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Username
              </label>
              <Input
                placeholder="e.g. sarah.connor"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="sarah@fixentra.my.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 text-xs"
                  required
                />
              </div>
              {formErrors.email && (
                <p className="text-[11px] text-destructive">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Role Assignment
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="OPERATOR" className="bg-background">Operator (Standard)</option>
                <option value="FINANCE_MANAGER" className="bg-background">Finance Manager (Ledger & Export)</option>
                <option value="SUPER_ADMIN" className="bg-background">Super Admin (Full Root Authority)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Initial Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9 text-xs"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-[11px] text-destructive">{formErrors.password}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Provision Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
