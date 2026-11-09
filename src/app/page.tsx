"use client";

import * as React from "react";
import { Plus, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { OrderDetailSheet } from "@/components/dashboard/order-detail-sheet";
import { CreateOrderDialog } from "@/components/dashboard/create-order-dialog";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  INITIAL_KPIS,
  INITIAL_TRANSACTIONS,
  Transaction,
  TransactionStatus,
  KpiMetric,
} from "@/lib/mock-data";
import { toast } from "sonner";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = React.useState("overview");
  const [transactions, setTransactions] = React.useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [kpis, setKpis] = React.useState<KpiMetric[]>(INITIAL_KPIS);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Handle transaction status mutation
  const handleStatusChange = (id: string, newStatus: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: newStatus } : tx))
    );

    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    toast.success(`Order ${id} status updated to ${newStatus.toUpperCase()}`);
  };

  // Handle new order creation
  const handleCreateOrder = (newOrder: Transaction) => {
    setTransactions((prev) => [newOrder, ...prev]);

    // Dynamically update total revenue KPI
    setKpis((prev) =>
      prev.map((kpi) => {
        if (kpi.id === "kpi-revenue") {
          const currentTotal = 45231.89;
          const newTotal = currentTotal + newOrder.amount;
          return {
            ...kpi,
            value: `$${newTotal.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
          };
        }
        return kpi;
      })
    );
  };

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setSheetOpen(true);
  };

  const handleExportData = () => {
    toast.success("Transaction dataset exported", {
      description: `Generated CSV file with ${transactions.length} rows.`,
    });
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
          className="fixed inset-y-0 left-0 z-40"
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
            onCloseMobile={() => setMobileSidebarOpen(false)}
            className="w-full border-r-0"
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-64">
        <Header
          activeSectionTitle={activeSection}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Top Hero Banner & Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
                Operations & Growth
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Real-time metrics, interactive charts, and transactions powered by shadcn/ui.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="gap-1.5 text-xs shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button
                size="sm"
                onClick={() => setNewOrderDialogOpen(true)}
                className="gap-1.5 text-xs shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </div>
          </div>

          {/* Section: KPI Cards */}
          <section id="overview" className="space-y-4">
            <KpiCards kpis={kpis} />
          </section>

          {/* Section: Analytics & Visualizations */}
          <section id="charts" className="space-y-4">
            <ChartsSection />
          </section>

          {/* Section: Transactions Data Table */}
          <section id="orders" className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
                <p className="text-xs text-muted-foreground">
                  Click any order to inspect details or trigger quick actions.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCommandPaletteOpen(true)}
                className="text-xs text-muted-foreground hidden sm:flex items-center gap-1"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Press ⌘K for quick actions
              </Button>
            </div>

            <OrdersTable
              transactions={transactions}
              onSelectTransaction={handleSelectTransaction}
              onStatusChange={handleStatusChange}
            />
          </section>
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <OrderDetailSheet
        transaction={selectedTransaction}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onStatusUpdate={handleStatusChange}
      />

      <CreateOrderDialog
        open={newOrderDialogOpen}
        onOpenChange={setNewOrderDialogOpen}
        onCreateOrder={handleCreateOrder}
      />

      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        onOpenNewOrder={() => setNewOrderDialogOpen(true)}
        onNavigateSection={(sectionId) => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
