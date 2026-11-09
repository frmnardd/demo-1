"use client";

import * as React from "react";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Users,
  Settings,
  Zap,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  className?: string;
  onCloseMobile?: () => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
  { id: "analytics", label: "Analytics", icon: BarChart3, badge: "New" },
  { id: "orders", label: "Orders", icon: ShoppingCart, badge: "10" },
  { id: "customers", label: "Customers", icon: Users, badge: null },
  { id: "settings", label: "Settings", icon: Settings, badge: null },
];

export function Sidebar({
  activeSection,
  onSelectSection,
  className,
  onCloseMobile,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col justify-between border-r bg-card/60 backdrop-blur-md p-4 transition-all",
        className
      )}
    >
      <div className="space-y-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-tight text-foreground flex items-center gap-1.5">
              Acme Flow
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-primary/30 text-primary">
                PRO
              </Badge>
            </span>
            <span className="text-xs text-muted-foreground">SaaS Operations Suite</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectSection(item.id);
                  onCloseMobile?.();
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className={cn(
                      "text-[10px] px-1.5 py-0 h-4",
                      isActive ? "bg-white/20 text-white border-0" : ""
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Pro Card */}
      <div className="rounded-xl border bg-gradient-to-b from-primary/10 to-transparent p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-primary text-xs font-semibold">
          <Sparkles className="h-4 w-4" />
          <span>shadcn/ui Showcase</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Built with accessible Radix primitives, Tailwind CSS variables, and fluid themes.
        </p>
        <div className="pt-1">
          <a
            href="https://ui.shadcn.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between text-xs font-medium text-primary hover:underline"
          >
            Explore Component Docs
            <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </aside>
  );
}
