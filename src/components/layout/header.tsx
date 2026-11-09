"use client";

import * as React from "react";
import {
  Bell,
  Search,
  Menu,
  Command,
  User,
  LogOut,
  CreditCard,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleMobileSidebar: () => void;
  activeSectionTitle?: string;
}

export function Header({
  onOpenCommandPalette,
  onToggleMobileSidebar,
  activeSectionTitle = "Overview",
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 sm:px-6">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleMobileSidebar}
          className="md:hidden h-9 w-9"
          aria-label="Open navigation sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Dashboard
          </span>
          <span className="text-xs text-muted-foreground hidden sm:inline">/</span>
          <h1 className="text-sm font-semibold capitalize text-foreground sm:text-base">
            {activeSectionTitle}
          </h1>
        </div>
      </div>

      {/* Right Controls: Search Trigger, Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 w-40 sm:w-60 items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Search commands...</span>
          </div>
          <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Notifications Popover Trigger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <span className="text-xs font-normal text-muted-foreground">
                2 unread
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              onClick={() => toast.info("Order ORD-7281 approved")}
            >
              <span className="text-xs font-semibold text-foreground">
                New Enterprise Order
              </span>
              <span className="text-xs text-muted-foreground">
                Olivia Martin completed \$1,999.00 payment
              </span>
              <span className="text-[10px] text-muted-foreground/70">10m ago</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              onClick={() => toast.info("Monitoring quota alert")}
            >
              <span className="text-xs font-semibold text-foreground">
                System Health Normal
              </span>
              <span className="text-xs text-muted-foreground">
                All cloud clusters operational at 99.98% uptime
              </span>
              <span className="text-[10px] text-muted-foreground/70">1h ago</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme mode toggle */}
        <ModeToggle />

        {/* User Profile Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full p-0"
              aria-label="User account menu"
            >
              <Avatar className="h-9 w-9 border">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  FA
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Firman Ardiansyah</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@acmeflow.dev
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => toast.info("Profile settings opened")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Billing & plan management")}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Billing & Plan</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Team preferences")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Workspace Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => toast.success("Signed out of demo session")}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
