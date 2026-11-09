"use client";

import * as React from "react";
import { Sparkles, Send, Bot, User, Trash2, ArrowUpRight, TrendingUp } from "lucide-react";
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

  const pendingOrders = context.transactions.filter((t) => t.status === "pending");
  const paidOrders = context.transactions.filter((t) => t.status === "paid");
  const refundedOrders = context.transactions.filter((t) => t.status === "refunded");

  // Query: Revenue / Omzet
  if (p.includes("revenue") || p.includes("pendapatan") || p.includes("omzet") || p.includes("penghasilan")) {
    return `Total pendapatan (Gross Revenue) Fixentra saat ini tercatat sebesar **${totalRev}** (${revenueKpi?.change || "+20.1%"} dibandingkan bulan lalu). Dari total ${context.transactions.length} transaksi, ${paidOrders.length} pesanan telah lunas terbayar.`;
  }

  // Query: Pending Orders
  if (p.includes("pending") || p.includes("tertunda") || p.includes("belum bayar")) {
    if (pendingOrders.length === 0) {
      return "Saat ini tidak ada pesanan dengan status pending. Seluruh transaksi berstatus lunas atau telah diproses.";
    }
    const pendingList = pendingOrders
      .map((o) => `• ${o.id}: **$${o.amount.toFixed(2)}** (${o.customer.name})`)
      .join("\n");
    return `Terdapat **${pendingOrders.length} pesanan berstatus pending** yang menunggu pembayaran:\n\n${pendingList}\n\nAnda dapat membuka tab *Orders* untuk meninjau atau memverifikasi pembayaran.`;
  }

  // Query: Customers / Pelanggan / VIP
  if (p.includes("pelanggan") || p.includes("customer") || p.includes("vip") || p.includes("klien")) {
    const topSpend = [...context.transactions].sort((a, b) => b.amount - a.amount).slice(0, 3);
    const topList = topSpend
      .map((t, idx) => `${idx + 1}. **${t.customer.name}** - $${t.amount.toFixed(2)} (${t.customer.email})`)
      .join("\n");
    return `Fixentra mencatat transaksi dari berbagai klien enterprise. Tiga transaksi dengan nilai terbesar saat ini:\n\n${topList}\n\nSemua klien dengan total belanja di atas $1,000 otomatis berstatus tier **VIP**.`;
  }

  // Query: Refund / Pengembalian
  if (p.includes("refund") || p.includes("retur") || p.includes("kembali")) {
    return `Tercatat ada **${refundedOrders.length} transaksi berstatus refunded**. Rata-rata klaim refund diselesaikan dalam waktu kurang dari 24 jam dengan audit log tercatat secara otomatis.`;
  }

  // Query: Default / Help
  return `Saya adalah **Fixentra AI Copilot v2.0**. Saya dapat membantu Anda menganalisis data toko secara instan:\n\n• Mengetahui total revenue & tren bulanan\n• Meringkas daftar pesanan pending\n• Memeriksa pelanggan dengan tier VIP\n• Memberikan wawasan performa konversi\n\nKetik pertanyaan Anda atau klik salah satu saran cepat di bawah!`;
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
      text: "Halo! Saya **Fixentra AI Copilot**. Apa yang ingin Anda ketahui tentang performa operasional atau pesanan hari ini?",
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
    "Berapa revenue saat ini?",
    "Ringkas pesanan pending",
    "Siapa pelanggan VIP teratas?",
    "Status transaksi refund",
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
                    v2.0
                  </Badge>
                </SheetTitle>
                <SheetDescription className="text-xs">
                  Operational Assistant & Analytics Intelligence
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
              placeholder="Ask Fixentra AI anything about your store..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="text-xs h-9 bg-background"
            />
            <Button type="submit" size="sm" className="h-9 px-3 gap-1.5 shrink-0">
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>

          <p className="text-[10px] text-center text-muted-foreground">
            Press <kbd className="font-mono bg-muted px-1 rounded">⌘J</kbd> or <kbd className="font-mono bg-muted px-1 rounded">Ctrl+J</kbd> to toggle AI Copilot anytime.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
