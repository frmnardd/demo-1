"use client";

import * as React from "react";
import { Plus, Download, Sparkles, FileJson, Package, Activity, ShieldCheck, Terminal, Users } from "lucide-react";
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
import { DeveloperPortal } from "@/components/dashboard/developer-portal";
import { TeamView, TeamMember } from "@/components/dashboard/team-view";
import { AiCopilotDrawer } from "@/components/dashboard/ai-copilot";
import { OrderDetailSheet } from "@/components/dashboard/order-detail-sheet";
import { CreateOrderDialog } from "@/components/dashboard/create-order-dialog";
import { CommandPalette } from "@/components/dashboard/command-palette";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { LoginScreen } from "@/components/auth/login-screen";
import { getStoredSession, clearStoredSession, UserRole } from "@/lib/auth";
import { ApiKeyRecord, ApiScope } from "@/lib/api-gateway";
import { generateApiKeySecret, hashPassword } from "@/lib/crypto";
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

const INITIAL_API_KEYS: ApiKeyRecord[] = [
  {
    id: "key-prod-01",
    name: "Enterprise ERP Ingestion Key",
    keyPrefix: "fix_live_9f8a...4b12",
    keyHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    permissions: ["read:orders", "write:orders", "read:analytics"],
    createdAt: "2026-11-09",
    lastUsed: "2026-11-10T02:15:00.000Z",
    active: true,
  },
  {
    id: "key-prod-02",
    name: "Read-Only Analytics Bridge",
    keyPrefix: "fix_live_3c21...8e90",
    keyHash: "ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb",
    permissions: ["read:orders", "read:analytics"],
    createdAt: "2026-11-10",
    lastUsed: "Just now",
    active: true,
  },
];

const INITIAL_TEAM: TeamMember[] = [
  {
    id: "usr-admin",
    username: "ardfrmn",
    name: "Firman Ardiansyah",
    email: "firman@fixentra.my.id",
    role: "SUPER_ADMIN",
    joinedAt: "2026-11-09",
    active: true,
  },
  {
    id: "usr-fin-01",
    username: "nadia.finance",
    name: "Nadia Rahmawati",
    email: "nadia@fixentra.my.id",
    role: "FINANCE_MANAGER",
    joinedAt: "2026-11-10",
    active: true,
  },
];

export default function FixentraApp() {
  const [mounted, setMounted] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState("ardfrmn");

  // Core Data States
  const [activeSection, setActiveSection] = React.useState("overview");
  const [transactions, setTransactions] = React.useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [products, setProducts] = React.useState<ProductTier[]>(INITIAL_PRODUCTS);
  const [kpis, setKpis] = React.useState<KpiMetric[]>(INITIAL_KPIS);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = React.useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);

  // v3.0 Enterprise States (Developer API Keys & Team RBAC)
  const [apiKeys, setApiKeys] = React.useState<ApiKeyRecord[]>(INITIAL_API_KEYS);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>(INITIAL_TEAM);

  // Overlays State
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [newOrderDialogOpen, setNewOrderDialogOpen] = React.useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false);
  const [copilotOpen, setCopilotOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  // Initial Auth Session & Persistence Check
  React.useEffect(() => {
    const session = getStoredSession();
    if (session.authenticated && session.username) {
      setIsAuthenticated(true);
      setCurrentUser(session.username);
    }

    try {
      const storedKeys = localStorage.getItem("fixentra_api_keys");
      if (storedKeys) {
        setApiKeys(JSON.parse(storedKeys));
      }
      const storedTeam = localStorage.getItem("fixentra_team_members");
      if (storedTeam) {
        setTeamMembers(JSON.parse(storedTeam));
      }
    } catch {
      // ignore parse errors
    }

    setMounted(true);
  }, []);

  const handleLoginSuccess = (user: string) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAuditLogs((prev) => [
      createAuditEntry("USER_LOGIN", `Authenticated session verified for ${user}`, user),
      ...prev,
    ]);
    toast.success(`Welcome back, ${user}!`, {
      description: "Fixentra Enterprise Production v3.0 Core active.",
    });
  };

  const handleLogout = () => {
    clearStoredSession();
    setIsAuthenticated(false);
    toast.info("Session closed", {
      description: "You have signed out of Fixentra Enterprise.",
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
      createAuditEntry("ORDER_STATUS_CHANGED", `Order ${id} transitioned to ${newStatus.toUpperCase()}`, currentUser),
      ...prev,
    ]);

    toast.success(`Order ${id} updated to ${newStatus.toUpperCase()}`);
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
      createAuditEntry("ORDER_DELETED", `Order ${id} removed by ${currentUser}`, currentUser),
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

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "New Transaction Logged",
        description: `${newOrder.customer.name} completed $${newOrder.amount.toFixed(2)} transaction`,
        time: "Just now",
        read: false,
      },
      ...prev,
    ]);

    setAuditLogs((prev) => [
      createAuditEntry("ORDER_CREATED", `Recorded ${newOrder.id} ($${newOrder.amount.toFixed(2)}) for ${newOrder.customer.name}`, currentUser),
      ...prev,
    ]);
  };

  // Add Product Tier
  const handleAddProduct = (newProd: ProductTier) => {
    setProducts((prev) => [newProd, ...prev]);
    setAuditLogs((prev) => [
      createAuditEntry("PRODUCT_CREATED", `Catalog tier ${newProd.title} (${newProd.sku}) created at $${newProd.price}`, currentUser),
      ...prev,
    ]);
  };

  // Toggle Product Status
  const handleToggleProductStatus = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
    setAuditLogs((prev) => [
      createAuditEntry("PRODUCT_STATUS_CHANGED", `Catalog state altered for ${id}`, currentUser),
      ...prev,
    ]);
  };

  // Real CSV & JSON File Exports
  const handleExportCSV = () => {
    triggerCSVDownload(transactions);
    setAuditLogs((prev) => [
      createAuditEntry("DATA_EXPORTED", `Exported corporate CSV ledger (${transactions.length} entries)`, currentUser),
      ...prev,
    ]);
    toast.success("CSV file downloaded", {
      description: `Saved ${transactions.length} transaction records.`,
    });
  };

  const handleExportJSON = () => {
    triggerJSONDownload(`fixentra-ledger-export-${new Date().toISOString().split("T")[0]}`, {
      exportDate: new Date().toISOString(),
      platform: "Fixentra Enterprise v3.0 (fixentra.my.id)",
      currentUser,
      kpis,
      transactions,
      products,
      apiKeysCount: apiKeys.length,
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

  // Developer API Key Generation
  const handleGenerateApiKey = (name: string, permissions: ApiScope[]) => {
    const { secretKey, keyPrefix, keyHash } = generateApiKeySecret();
    const newRecord: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name,
      keyPrefix,
      keyHash,
      permissions,
      createdAt: new Date().toISOString().split("T")[0],
      active: true,
    };

    const updated = [newRecord, ...apiKeys];
    setApiKeys(updated);
    try {
      localStorage.setItem("fixentra_api_keys", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setAuditLogs((prev) => [
      createAuditEntry("API_KEY_CREATED", `Generated live API key "${name}" with scopes [${permissions.join(", ")}]`, currentUser),
      ...prev,
    ]);

    return { secretKey, keyRecord: newRecord };
  };

  // Developer API Key Revocation
  const handleRevokeApiKey = (id: string) => {
    const target = apiKeys.find((k) => k.id === id);
    const updated = apiKeys.map((k) => (k.id === id ? { ...k, active: false } : k));
    setApiKeys(updated);
    try {
      localStorage.setItem("fixentra_api_keys", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setAuditLogs((prev) => [
      createAuditEntry("API_KEY_REVOKED", `Revoked API key "${target?.name || id}"`, currentUser),
      ...prev,
    ]);

    toast.success("API Key Revoked", {
      description: `Access token ${target?.keyPrefix} has been permanently deactivated.`,
    });
  };

  // Team RBAC Provisioning
  const handleAddTeamMember = (member: {
    username: string;
    name: string;
    email: string;
    role: UserRole;
    password: string;
  }) => {
    const newMember: TeamMember = {
      id: `usr-${Date.now()}`,
      username: member.username,
      name: member.name,
      email: member.email,
      role: member.role,
      joinedAt: new Date().toISOString().split("T")[0],
      active: true,
      passwordHash: hashPassword(member.password),
    };

    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    try {
      localStorage.setItem("fixentra_team_members", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setAuditLogs((prev) => [
      createAuditEntry("TEAM_MEMBER_PROVISIONED", `Provisioned verified member @${member.username} as ${member.role}`, currentUser),
      ...prev,
    ]);
  };

  // Team Member Revocation
  const handleRevokeTeamMember = (id: string) => {
    const member = teamMembers.find((m) => m.id === id);
    if (member?.username === "ardfrmn") {
      toast.error("Root administrator account cannot be deactivated.");
      return;
    }

    const updated = teamMembers.map((m) => (m.id === id ? { ...m, active: false } : m));
    setTeamMembers(updated);
    try {
      localStorage.setItem("fixentra_team_members", JSON.stringify(updated));
    } catch {
      // ignore
    }

    setAuditLogs((prev) => [
      createAuditEntry("TEAM_MEMBER_DEACTIVATED", `Deactivated account @${member?.username || id}`, currentUser),
      ...prev,
    ]);

    toast.info(`Team member @${member?.username} deactivated.`);
  };

  // Re-synchronize SQLite Ledger
  const handleResyncDatabase = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setProducts(INITIAL_PRODUCTS);
    setKpis(INITIAL_KPIS);
    setAuditLogs((prev) => [
      createAuditEntry("LEDGER_RESYNC", "Verified SQLite persistence and refreshed transactional indices", currentUser),
      ...prev,
    ]);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-xs font-mono text-muted-foreground">Initializing Fixentra Core v3.0...</span>
        </div>
      </div>
    );
  }

  // PUBLIC ENTRANCE: If not authenticated, render LoginScreen gate
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // AUTHENTICATED: Render Fixentra Enterprise Suite v3.0
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
      case "developers":
        return (
          <DeveloperPortal
            apiKeys={apiKeys}
            onGenerateKey={handleGenerateApiKey}
            onRevokeKey={handleRevokeApiKey}
          />
        );
      case "team":
        return (
          <TeamView
            team={teamMembers}
            onAddMember={handleAddTeamMember}
            onRevokeMember={handleRevokeTeamMember}
          />
        );
      case "settings":
        return <SettingsView onResyncDatabase={handleResyncDatabase} currentUser={currentUser} />;
      case "orders":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">
                  Orders Management
                </h3>
                <p className="text-xs text-muted-foreground">
                  Inspect commercial transactions, update lifecycle status, and download audit logs.
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
                    Inspect transactional events and trigger real-time actions.
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
                Fixentra Enterprise
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  v3.0 Production Core
                </span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Enterprise operations, API Gateway, and database persistence on <span className="font-mono text-xs text-primary font-medium">fixentra.my.id</span>
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
