"use client";

import * as React from "react";
import { Plus, Download, Sparkles, FileJson, Package, Activity, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ChartsSection } from "@/components/dashboard/charts-section";
import { OrdersTable } from "@/components/dashboard/orders-table";
import { CustomersView } from "@/components/dashboard/customers-view";
import { AnalyticsView } from "@/components/dashboard/analytics-view";
import { SettingsView } from "@/components/dashboard/settings-view";
import { ProductsView } from "@/components/dashboard/products-view";
import { AiCopilotDrawer } from "@/components/dashboard/ai-copilot";
import { OrderDetailSheet } from "@/components/dashboard/order-detail-sheet";
import { CreateOrderDialog } from "@/components/dashboard/create-order-dialog";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LoginScreen } from "@/components/auth/login-screen";
import { getStoredSession, clearStoredSession } from "@/lib/auth";
import {
  INITIAL_KPIS,
  INITIAL_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRODUCTS,
  Transaction,
  TransactionStatus,
  KpiMetric,
  AppNotification,
  ProductTier,
  accumulateRevenue,
} from "@/lib/mock-data";
import { triggerCSVDownload, triggerJSONDownload } from "@/lib/export-utils";
import { createAuditEntry, INITIAL_AUDIT_LOGS, AuditLogEntry } from "@/lib/audit-log";
import { toast } from "sonner";

export default function FixentraApp() {
  const [mounted, setMounted] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState("ardfrmn");

  // Application Data States
  const [activeSection, setActiveSection] = React.useState("overview");
  const [transactions, setTransactions] = React.useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [products, setProducts] = React.useState<ProductTier[]>(INITIAL_PRODUCTS);
  const [kpis, setKpis] = React.useState<KpiMetric[]>(INITIAL_KPIS);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // Overlays State
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [copilotOpen, setCopilotOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Initial Auth Session Check
  React.useEffect(() => {
    const session = getStoredSession();
    if (session.authenticated && session.username) {
      setIsAuthenticated(true);
      setCurrentUser(session.username);
    }
    setMounted(true);
  }, []);

  const handleLoginSuccess = (user: string) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAuditLogs((prev) => [
      createAuditEntry("USER_LOGIN", `Session unlocked for ${user}`, user),
      ...prev,
    ]);
    toast.success(`Welcome back, ${user}!`, {
      description: "Fixentra v2.0 Enterprise Suite unlocked.",
    });
  };

  const handleLogout = () => {
    clearStoredSession();
    setIsAuthenticated(false);
    toast.info("Session locked", {
      description: "You have signed out of Fixentra OS.",
    });
  };

  // Status mutation
  const handleStatusChange = (id: string, newStatus: TransactionStatus) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, status: newStatus } : tx))
    );

    if (selectedTransaction && selectedTransaction.id === id) {
      setSelectedTransaction((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    setAuditLogs((prev) => [
      createAuditEntry("ORDER_STATUS_CHANGED", `Order ${id} changed to ${newStatus.toUpperCase()}`, currentUser),
      ...prev,
    ]);

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

    setAuditLogs((prev) => [
      createAuditEntry("ORDER_DELETED", `Order ${id} removed by administrator`, currentUser),
      ...prev,
    ]);

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

    // Prepend notification & audit log
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

    setAuditLogs((prev) => [
      createAuditEntry("ORDER_CREATED", `Created ${newOrder.id} ($${newOrder.amount.toFixed(2)}) for ${newOrder.customer.name}`, currentUser),
      ...prev,
    ]);
  };

  // Add Product Tier
  const handleAddProduct = (newProd: ProductTier) => {
    setProducts((prev) => [newProd, ...prev]);
    setAuditLogs((prev) => [
      createAuditEntry("PRODUCT_CREATED", `Added tier ${newProd.title} (${newProd.sku}) at $${newProd.price}`, currentUser),
      ...prev,
    ]);
  };

  // Toggle Product Status
  const handleToggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    setAuditLogs((prev) => [
      createAuditEntry("PRODUCT_STATUS_CHANGED", `Toggled product status for ID ${id}`, currentUser),
      ...prev,
    ]);
  };

  // Real CSV & JSON File Exports
  const handleExportCSV = () => {
    triggerCSVDownload(transactions);
    setAuditLogs((prev) => [
      createAuditEntry("DATA_EXPORTED", `Exported CSV archive (${transactions.length} rows)`, currentUser),
      ...prev,
    ]);
    toast.success("CSV file downloaded", {
      description: `Saved ${transactions.length} transaction records.`,
    });
  };

  const handleExportJSON = () => {
    triggerJSONDownload(`fixentra-audit-export-${new Date().toISOString().split("T")[0]}`, {
      exportDate: new Date().toISOString(),
      platform: "Fixentra v2.0 (fixentra.my.id)",
      currentUser,
      kpis,
      transactions,
      products,
      auditLogs,
    });
    setAuditLogs((prev) => [
      createAuditEntry("DATA_EXPORTED", "Exported complete JSON operational snapshot", currentUser),
      ...prev,
    ]);
    toast.success("JSON archive downloaded", {
      description: "Full audit state and transactions exported as JSON.",
    });
  };

  // Reset demo data
  const handleResetData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setKpis(INITIAL_KPIS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setProducts(INITIAL_PRODUCTS);
    setAuditLogs((prev) => [
      createAuditEntry("DATA_RESET", "Restored demo factory seed dataset", currentUser),
      ...prev,
    ]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-mono text-muted-foreground">Initializing Fixentra OS...</span>
        </div>
      </div>
    );
  }

  // PUBLIC ENTRANCE: If not authenticated, render LoginScreen gate
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // AUTHENTICATED: Render Fixentra Enterprise Suite v2.0
  const renderActiveView = () => {
    switch (activeSection) {
      case "products":
        return (
          <ProductsView
            products={products}
            onAddProduct={handleAddProduct}
            onToggleStatus={handleToggleProductStatus}
          />
        );
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
              onSelectTransaction={(tx) => {
                setSelectedTransaction(tx);
                setSheetOpen(true);
              }}
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
                  onClick={() => setCopilotOpen(true)}
                  className="text-xs text-primary hidden sm:flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask Fixentra AI (⌘J)
                </Button>
              </div>

              <OrdersTable
                transactions={transactions}
                onSelectTransaction={(tx) => {
                  setSelectedTransaction(tx);
                  setSheetOpen(true);
                }}
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
          onOpenCopilot={() => setCopilotOpen(true)}
          onLogout={handleLogout}
          currentUser={currentUser}
          notifications={notifications}
          onMarkAllNotificationsRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onDismissNotification={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            )
          }
        />

        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Top Banner & Quick Actions */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
                Fixentra Operations
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  v2.0 Live
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Enterprise operations, AI Copilot, and financial intelligence on <span className="font-mono text-xs text-primary font-medium">fixentra.my.id</span>
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="gap-1.5 text-xs shadow-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                className="gap-1.5 text-xs shadow-sm"
              >
                <FileJson className="h-3.5 w-3.5" />
                Export JSON
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

      <AiCopilotDrawer
        open={copilotOpen}
        onOpenChange={setCopilotOpen}
        kpis={kpis}
        transactions={transactions}
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
