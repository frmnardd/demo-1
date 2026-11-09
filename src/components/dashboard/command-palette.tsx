"use client";

import * as React from "react";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  PlusCircle,
  Sun,
  Moon,
  Laptop,
  Settings,
  CreditCard,
  FileSpreadsheet,
} from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenNewOrder: () => void;
  onNavigateSection?: (sectionId: string) => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  onOpenNewOrder,
  onNavigateSection,
}: CommandPaletteProps) {
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                onOpenNewOrder();
              })
            }
          >
            <PlusCircle className="mr-2 h-4 w-4 text-primary" />
            <span>Create New Order</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                toast.success("Data refreshed", {
                  description: "Dashboard metrics and charts synchronized.",
                });
              })
            }
          >
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Refresh Transactions</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                toast.success("CSV export ready", {
                  description: "Full transaction audit exported to CSV.",
                });
              })
            }
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Export Transaction CSV</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                onNavigateSection?.("overview");
                toast.info("Navigated to Overview");
              })
            }
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Overview & KPIs</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                onNavigateSection?.("charts");
                toast.info("Navigated to Analytics Charts");
              })
            }
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Revenue & Sales Charts</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                onNavigateSection?.("orders");
                toast.info("Navigated to Recent Orders Table");
              })
            }
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            <span>Recent Orders Table</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              runCommand(() => {
                toast.info("Settings modal / page opened");
              })
            }
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings & Preferences</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System Default</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
