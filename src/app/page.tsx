"use client";

import * as React from "react";
import { Plus, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { CustomersView } from "@/components/dashboard/customers-view";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { SettingsView } from "@/components/dashboard/settings-view";
import { OrderDetailSheet } from "@/components/dashboard/order-detail-sheet";
import { CreateOrderDialog } from "@/components/dashboard/create-order-dialog";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  INITIAL_KPIS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  Transaction,
  TransactionStatus,
  KpiMetric,
  AppNotification,
  accumulateRevenue,
} from "@/lib/mock-data";
import { triggerCSVDownload } from "@/lib/export-utils";
import { toast } from "sonner";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = React.useState("overview");
  const [transactions, setTransactions] = React.useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [kpis, setKpis] = React.useState<KpiMetric[]>(INITIAL_KPIS);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Status mutation
  const handleStatusChange = (id: string, newStatus: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: newStatus } : tx))
    );

    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    toast.success(`Order ${id} status updated to ${newStatus.toUpperCase()}`);
  };

  // Delete transaction
  const handleDeleteOrder = (id: string) => {
    const deletedOrder = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (selectedTransaction?.id === id) {
      setSheetOpen(false);
      setSelectedTransaction(null);
    }

    toast.success(`Order ${id} deleted`, {
      description: deletedOrder
        ? `Removed ${deletedOrder.customer.name}'s order of $${deletedOrder.amount.toFixed(2)}`
        : undefined,
    });
  };

  // Create new order
  const handleCreateOrder = (newOrder: Transaction) => {
    setTransactions((prev) => [newOrder, ...prev]);

    // Update revenue KPI cumulatively
    setKpis((prev) =>
      prev.map((kpi) => {
        if (kpi.id === "kpi-revenue") {
          return {
            ...kpi,
            value: accumulateRevenue(kpi.value, newOrder.amount),
          };
        }
        return kpi;
      })
    );

    // Prepend a notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "New Order Placed",
        description: `${newOrder.customer.name} completed $${newOrder.amount.toFixed(2)} order`,
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const handleSelectTransaction = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setSheetOpen(true);
  };

  // Real CSV File Export
  const handleExportData = () => {
    triggerCSVDownload(transactions);
    toast.success("CSV file downloaded", {
      description: `Saved ${transactions.length} transaction records to your downloads folder.`,
    });
  };

  // Reset to factory state
  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setKpis(INITIAL_KPIS);
    setNotifications(INITIAL_NOTIFICATIONS);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const renderActiveView = () => {
    switch (activeSection) {
      case "analytics":
        return <AnalyticsView />;
      case "customers":
        return <CustomersView transactions={transactions} />;
      case "settings":
        return <SettingsView onResetData={handleResetData} />;
      case "orders":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Orders Management
                </h3>
                <p className="text-xs text-muted-foreground">
                  Search, inspect, update status, and export commercial invoices.
                </p>
              </div>
              <Button
                size="sm"
                onClick={() => setNewOrderDialogOpen(true)}
                className="gap-1.5 text-xs shadow-sm"
              >
                <Plus className="h-4 w-4" />
                New Order
              </Button>
            </div>
            <OrdersTable
              transactions={transactions}
              onSelectTransaction={handleSelectTransaction}
              onStatusChange={handleStatusChange}
              onDeleteOrder={handleDeleteOrder}
            />
          </div>
        );
      case "overview":
      default:
        return (
          <div className="space-y-6">
            {/* KPI Cards */}
            <section id="overview" className="space-y-4">
              <KpiCards kpis={kpis} />
            </section>

            {/* Analytics Overview Charts */}
            <section id="charts" className="space-y-4">
              <ChartsSection />
            </section>

            {/* Transactions Table */}
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
                onDeleteOrder={handleDeleteOrder}
              />
            </section>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeSection={activeSection}
          onSelectSection={(section) => {
            setActiveSection(section);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed inset-y-0 left-0 z-40"
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Mobile sidebar navigation menu</SheetDescription>
          <Sidebar
            activeSection={activeSection}
            onSelectSection={(section) => {
              setActiveSection(section);
              setMobileSidebarOpen(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
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
          notifications={notifications}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onDismissNotification={handleDismissNotification}
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Top Banner & Quick Actions */}
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
                Real-time business metrics, interactive charts, and transactions.
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

          {/* Active View Container */}
          {renderActiveView()}
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
          setActiveSection(sectionId);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
