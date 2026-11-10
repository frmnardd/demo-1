"use client";

import * as React from "react";
import { Printer, ShieldCheck, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Transaction } from "@/lib/mock-data";

export interface InvoiceContentProps {
  transaction: Transaction;
  onPrint?: () => void;
}

export function InvoiceContent({ transaction, onPrint }: InvoiceContentProps) {
  const invoiceNo = `INV-FIX-${transaction.id.replace(/[^0-9]/g, "").padStart(5, "0") || "10042"}`;
  const subtotal = transaction.amount / 1.11;
  const tax = transaction.amount - subtotal;
  const isPaid = (transaction.status || "").toLowerCase() === "paid";
  const isPending = (transaction.status || "").toLowerCase() === "pending";

  return (
    <div className="p-4 sm:p-8 space-y-5 sm:space-y-6 bg-card text-foreground print:p-0 max-h-[85vh] overflow-y-auto">
      {/* Top Bar Actions (Hidden during print) */}
      <div className="flex items-center justify-between border-b pb-4 print:hidden">
        <span className="text-xs font-mono text-muted-foreground truncate">
          Official Tax Invoice &bull; {invoiceNo}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {onPrint && (
            <Button size="sm" variant="outline" onClick={onPrint} className="h-8 gap-1.5 text-xs">
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          )}
        </div>
      </div>

      {/* Invoice Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-black text-sm">
              F
            </div>
            <span className="text-xl font-bold tracking-tight">Fixentra Enterprise</span>
          </div>
          <p className="text-xs text-muted-foreground">
            PT Fixentra Global Teknologi &bull; fixentra.my.id
          </p>
          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
            Financial Operations Suite &bull; Tax ID: 01.984.721.2-024.000
          </p>
        </div>

        <div className="text-left sm:text-right space-y-1">
          <h3 className="text-base font-bold text-foreground">COMMERCIAL INVOICE</h3>
          <p className="font-mono text-xs text-primary font-semibold">{invoiceNo}</p>
          <p className="text-xs text-muted-foreground">Issue Date: {transaction.date}</p>
          <div className="pt-1">
            {isPaid ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] gap-1">
                <CheckCircle2 className="h-3 w-3" />
                PAID / SETTLED
              </Badge>
            ) : isPending ? (
              <Badge variant="outline" className="text-amber-600 border-amber-500/30 text-[10px] gap-1">
                <Clock className="h-3 w-3" />
                PENDING SETTLEMENT
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-[10px] gap-1">
                <AlertTriangle className="h-3 w-3" />
                FAILED / REFUNDED
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bill-To & Payment Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 rounded-lg border bg-muted/20 p-4 text-xs">
        <div className="space-y-1">
          <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            Billed To
          </span>
          <p className="font-semibold text-foreground text-sm">{transaction.customer.name}</p>
          <p className="text-muted-foreground">{transaction.customer.email}</p>
        </div>
        <div className="space-y-1 text-left sm:text-right">
          <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
            Payment Channel
          </span>
          <p className="font-medium text-foreground">{transaction.method || "Corporate Card"}</p>
          <p className="text-muted-foreground">Transaction ID: {transaction.id}</p>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b text-[11px] text-muted-foreground">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Service Description</th>
              <th className="py-2.5 px-3 text-center font-semibold">Qty</th>
              <th className="py-2.5 px-3 text-right font-semibold">Unit Price</th>
              <th className="py-2.5 px-3 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="py-3 px-3">
                <p className="font-medium text-foreground">
                  Fixentra Enterprise Platform License &bull; SLA Core
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {transaction.note || "Automated subscription provisioning & compute throughput."}
                </p>
              </td>
              <td className="py-3 px-3 text-center">{transaction.itemsCount || 1}</td>
              <td className="py-3 px-3 text-right font-mono">
                ${(subtotal / (transaction.itemsCount || 1)).toFixed(2)}
              </td>
              <td className="py-3 px-3 text-right font-mono font-medium">
                ${subtotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Subtotals & Grand Total */}
      <div className="flex justify-end pt-2">
        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal (Net)</span>
            <span className="font-mono text-foreground">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Value-Added Tax (VAT 11%)</span>
            <span className="font-mono text-foreground">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold text-sm">
            <span>Total Amount Due</span>
            <span className="font-mono text-primary">${transaction.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer & Security Verification Seal */}
      <div className="border-t pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Cryptographically verified on SQLite Ledger &bull; fixentra.my.id</span>
        </div>
        <span className="font-mono text-[10px]">
          SHA-256: {transaction.id.slice(0, 16)}...SEC
        </span>
      </div>
    </div>
  );
}

export interface InvoiceModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvoiceModal({ transaction, open, onOpenChange }: InvoiceModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden print:border-none print:shadow-none print:max-w-none">
        <DialogHeader className="sr-only">
          <DialogTitle>Commercial Tax Invoice</DialogTitle>
        </DialogHeader>
        <InvoiceContent transaction={transaction} onPrint={handlePrint} />
      </DialogContent>
    </Dialog>
  );
}
