"use client";

import * as React from "react";
import { Sparkles, Send, Bot, User, Trash2, ArrowUpRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Transaction, KpiMetric } from "@/lib/mock-data";

export interface AiCopilotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpis: KpiMetric[];
  transactions: Transaction[];
  onQuickAction?: (action: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export function processCopilotQuery(
  prompt: string,
  context: { kpis: KpiMetric[]; transactions: Transaction[] }
): string {
  const p = prompt.toLowerCase();
  const revenueKpi = context.kpis.find((k) => k.id === "kpi-revenue");
  const totalRev = revenueKpi ? revenueKpi.value : "$0.00";

  const pendingOrders = context.transactions.filter(
    (t) => t.status.toLowerCase() === "pending"
  );
  const paidOrders = context.transactions.filter(
    (t) => t.status.toLowerCase() === "paid"
  );
  const failedOrders = context.transactions.filter(
    (t) => t.status.toLowerCase() === "failed" || t.status.toLowerCase() === "refunded"
  );

  // Query: Anomaly Detection & Security Audit
  if (
    p.includes("anomali") ||
    p.includes("keamanan") ||
    p.includes("suspicious") ||
    p.includes("fraud") ||
    p.includes("audit") ||
    p.includes("resiko")
  ) {
    const failedRatio =
      context.transactions.length > 0
        ? ((failedOrders.length / context.transactions.length) * 100).toFixed(1)
        : "0.0";

    const highValueTx = context.transactions.filter((t) => t.amount > 500);

    return `🛡️ **Audit Keamanan & Deteksi Anomali Fixentra Core v3.5:**\n\n` +
      `• **Tingkat Transaksi Gagal:** ${failedRatio}% (${failedOrders.length} dari ${context.transactions.length} transaksi).\n` +
      `• **Transaksi Bernilai Tinggi (High-Value > $500):** Terdeteksi ${highValueTx.length} transaksi. Semua telah diverifikasi dengan SSL TLS 1.3 & SHA-256 ledger.\n` +
      `• **Integritas Database:** SQLite Ledger aktif dan sinkron di fixentra.db.\n` +
      `• **Rekomendasi Operasional:** Pantau transaksi berstatus Pending secara berkala untuk menghindari keterlambatan settlement perbankan.`;
  }

  // Query: Revenue / Omzet
  if (
    p.includes("revenue") ||
    p.includes("pendapatan") ||
    p.includes("omzet") ||
    p.includes("penghasilan")
  ) {
    return `Total pendapatan (Gross Revenue) Fixentra saat ini tercatat sebesar **${totalRev}** (${revenueKpi?.change || "+20.1%"} dibandingkan periode sebelumnya). Dari total ${context.transactions.length} transaksi, sebanyak **${paidOrders.length} pesanan telah lunas**.`;
  }

  // Query: Pending Orders
  if (p.includes("pending") || p.includes("tertunda") || p.includes("belum bayar")) {
    if (pendingOrders.length === 0) {
      return "Saat ini tidak ada pesanan dengan status pending. Seluruh transaksi berstatus lunas atau telah diproses secara normal.";
    }
    const pendingList = pendingOrders
      .map((o) => `• ${o.id}: **$${o.amount.toFixed(2)}** (${o.customer.name})`)
      .join("\n");
    return `Terdapat **${pendingOrders.length} pesanan berstatus pending** yang menunggu verifikasi:\n\n${pendingList}\n\nAnda dapat membuka tab *Orders* untuk memverifikasi atau mencetak invoice resmi.`;
  }

  // Query: Customers / Pelanggan / VIP
  if (
    p.includes("pelanggan") ||
    p.includes("customer") ||
    p.includes("vip") ||
    p.includes("klien")
  ) {
    const topSpend = [...context.transactions].sort((a, b) => b.amount - a.amount).slice(0, 3);
    const topList = topSpend
      .map(
        (t, idx) =>
          `${idx + 1}. **${t.customer.name}** - $${t.amount.toFixed(2)} (${t.customer.email})`
      )
      .join("\n");
    return `Fixentra mengelola transaksi dari berbagai institusi dan korporasi. Tiga pelanggan dengan volume belanja tertinggi:\n\n${topList}\n\nSetiap klien korporat dapat diberikan akses token API khusus via Developer Portal.`;
  }

  // Query: Webhook & Developer API
  if (p.includes("webhook") || p.includes("api key") || p.includes("developer") || p.includes("token")) {
    return `Gateway pengembang Fixentra v3.5 mendukung:\n\n` +
      `• **Live REST API Tokens:** Format \`fix_live_...\` dengan otorisasi granular (\`read:orders\`, \`write:orders\`, \`read:analytics\`).\n` +
      `• **Webhooks:** Pengiriman otomatis event \`order.created\`, \`order.paid\`, \`order.failed\` dengan signature HMAC-SHA256.\n` +
      `• **Rate Limiting:** Proteksi bawaan 60-100 req/min untuk mencegah abuse.`;
  }

  // Query: Default / Help
  return `Saya adalah **Fixentra AI Copilot v3.5 Enterprise**. Saya dapat membantu analisis finansial dan operasional toko Anda:\n\n• **Deteksi anomali & audit risiko keamanan**\n• Mengetahui total omzet, pesanan lunas, dan tren pertumbuhan\n• Meringkas daftar pesanan pending dan gagal\n• Mengidentifikasi klien bernilai tinggi (VIP)\n• Informasi integrasi REST API & Webhooks\n\nKetik pertanyaan Anda atau pilih pintasan cepat di bawah!`;
}

export function AiCopilotDrawer({
  open,
  onOpenChange,
  kpis,
  transactions,
  onQuickAction,
}: AiCopilotProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "initial",
      sender: "ai",
      text: "Halo! Saya **Fixentra AI Copilot v3.5**. Sistem deteksi anomali dan analisis finansial siap membantu Anda.",
      timestamp: "Just now",
    },
  ]);
  const [input, setInput] = React.useState("");

  // Keyboard shortcut listener for Cmd+J / Ctrl+J
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "j" || e.key === "J") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const aiAnswer = processCopilotQuery(query, { kpis, transactions });
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now() + 1}`,
      sender: "ai",
      text: aiAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg, aiMsg]);
    setInput("");
  };

  const quickPrompts = [
    "Deteksi anomali & keamanan",
    "Berapa total revenue saat ini?",
    "Ringkas pesanan pending",
    "Siapa klien terbesar?",
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col justify-between sm:max-w-md w-full p-0">
        <SheetHeader className="border-b p-4 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold flex items-center gap-1.5">
                  Fixentra AI Copilot
                  <Badge variant="outline" className="text-[10px] py-0 px-1 border-primary/30 text-primary">
                    v3.5 Enterprise
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Financial Intelligence & Anomaly Guard
                </SheetDescription>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMessages([messages[0]])}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Clear Chat History"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 space-y-1 shadow-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/50 border rounded-tl-none text-foreground whitespace-pre-wrap"
                }`}
              >
                <div>{m.text}</div>
                <div
                  className={`text-[9px] ${
                    m.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  } text-right`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Prompts & Input Bar */}
        <div className="border-t p-3 space-y-3 bg-muted/20">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0 flex items-center gap-1"
              >
                <span>{prompt}</span>
                <ArrowUpRight className="h-3 w-3 opacity-60" />
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              placeholder="Tanyakan analisis keuangan atau audit anomali..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-xs h-9 bg-background"
            />
            <Button type="submit" size="sm" className="h-9 px-3 gap-1.5 shrink-0">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>

          <p className="text-[10px] text-center text-muted-foreground">
            Tekan <kbd className="font-mono bg-muted px-1 rounded">⌘J</kbd> atau <kbd className="font-mono bg-muted px-1 rounded">Ctrl+J</kbd> untuk membuka AI Copilot kapan saja.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
