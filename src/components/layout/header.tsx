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
  Sparkles,
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

import { AppNotification } from "@/lib/mock-data";

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleMobileSidebar: () => void;
  activeSectionTitle?: string;
  notifications?: AppNotification[];
  onMarkAllNotificationsRead?: () => void;
  onDismissNotification?: (id: string) => void;
  onOpenCopilot?: () => void;
  onLogout?: () => void;
  currentUser?: string;
}

export function Header({
  onOpenCommandPalette,
  onToggleMobileSidebar,
  activeSectionTitle = "Overview",
  notifications = [],
  onMarkAllNotificationsRead,
  onDismissNotification,
  onOpenCopilot,
  onLogout,
  currentUser = "ardfrmn",
}: HeaderProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
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
        {/* Fixentra AI Copilot Button */}
        {onOpenCopilot && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenCopilot}
            className="h-9 gap-1.5 border-primary/30 bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium shadow-sm transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="hidden lg:inline">Fixentra AI</span>
            <kbd className="hidden sm:inline-flex pointer-events-none h-4 select-none items-center rounded border bg-background/50 px-1 font-mono text-[9px] text-muted-foreground">
              ⌘J
            </kbd>
          </Button>
        )}

        {/* Search trigger button */}
        <button
          onClick={onOpenCommandPalette}
          className="flex h-9 w-36 sm:w-56 items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Search...</span>
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
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              {unreadCount > 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAllNotificationsRead?.();
                    toast.success("All notifications marked as read");
                  }}
                  className="text-xs font-normal text-primary hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              ) : (
                <span className="text-xs font-normal text-muted-foreground">
                  All caught up
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  className={`flex flex-col items-start gap-1 p-3 cursor-pointer ${
                    !notif.read ? "bg-muted/40 font-medium" : "opacity-80"
                  }`}
                  onClick={() => {
                    onDismissNotification?.(notif.id);
                    toast.info(`Notification: ${notif.title}`);
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">
                      {notif.title}
                    </span>
                    {!notif.read && (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {notif.description}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">
                    {notif.time}
                  </span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No new notifications
              </div>
            )}
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
              <Avatar className="h-9 w-9 border border-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                  {currentUser.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{currentUser}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {currentUser}@fixentra.my.id
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
              <span>Fixentra License</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Team preferences")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Workspace Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                if (onLogout) {
                  onLogout();
                } else {
                  toast.success("Signed out of session");
                }
              }}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out (Lock Session)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
