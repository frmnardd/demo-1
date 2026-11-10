"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Sparkles,
  BarChart3,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  onOpenCopilot: () => void;
  unreadOrderCount?: number;
}

export function MobileBottomNav({
  activeSection,
  onSelectSection,
  onOpenCopilot,
  unreadOrderCount,
}: MobileBottomNavProps) {
  const items = [
    { id: "overview", label: "Home", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingCart, badge: unreadOrderCount },
    { id: "copilot", label: "AI Copilot", icon: Sparkles, isAction: true },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur-lg px-2 py-1 flex items-center justify-around shadow-lg transition-all"
      aria-label="Mobile Navigation"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;

        if (item.isAction) {
          return (
            <button
              key={item.id}
              onClick={onOpenCopilot}
              className="flex flex-col items-center justify-center p-1 relative -top-2"
              aria-label="Open AI Copilot"
            >
              <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold text-primary mt-0.5">
                AI Copilot
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onSelectSection(item.id)}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors relative min-w-[56px]",
              isActive
                ? "text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground active:scale-95"
            )}
            aria-label={item.label}
          >
            <div className="relative">
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              {typeof item.badge === "number" && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
