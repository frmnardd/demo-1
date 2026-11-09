"use client";

import * as React from "react";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Users,
  Settings,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { FixentraLogo } from "@/components/brand/fixentra-logo";

interface SidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  className?: string;
  onCloseMobile?: () => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, badge: null },
  { id: "products", label: "Products", icon: Package, badge: "v2.0" },
  { id: "analytics", label: "Analytics", icon: BarChart3, badge: null },
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
        <div className="px-2 py-1.5">
          <FixentraLogo />
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

      {/* Bottom Status Card */}
      <div className="rounded-xl border bg-muted/30 p-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="text-muted-foreground">System Status</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/80">
          All services and APIs running smoothly.
        </p>
      </div>
    </aside>
  );
}
