"use client";

import * as React from "react";
import { CheckCircle2, RefreshCcw, Download, Calendar, CreditCard, Tag } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Transaction, TransactionStatus } from "@/lib/mock-data";

export interface OrderDetailSheetProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (id: string, newStatus: TransactionStatus) => void;
}

export function OrderDetailSheet({
  transaction,
  open,
  onOpenChange,
  onStatusUpdate,
}: OrderDetailSheetProps) {
  if (!transaction) return null;

  const handleStatusChange = (newStatus: TransactionStatus) => {
    onStatusUpdate(transaction.id, newStatus);
    toast.success(`Order ${transaction.id} updated`, {
      description: `Status changed to ${newStatus.toUpperCase()}`,
    });
  };

  const handleDownloadInvoice = () => {
    toast.success(`Invoice for ${transaction.id} downloaded`, {
      description: `Sent PDF export to downloads folder`,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col justify-between overflow-y-auto">
        <div className="space-y-6">
          <SheetHeader className="text-left border-b pb-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-primary">
                {transaction.id}
              </span>
              <Badge
                variant={
                  transaction.status === "paid"
                    ? "success"
                    : transaction.status === "refunded"
                    ? "destructive"
                    : "secondary"
                }
              >
                {transaction.status.toUpperCase()}
              </Badge>
            </div>
            <SheetTitle className="text-xl">Transaction Breakdown</SheetTitle>
            <SheetDescription>
              Detailed view of order, customer profile, and payment audit.
            </SheetDescription>
          </SheetHeader>

          {/* Customer Profile Section */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer Info
            </span>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{transaction.customer.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{transaction.customer.name}</span>
                <span className="text-xs text-muted-foreground">{transaction.customer.email}</span>
              </div>
            </div>
          </div>

          {/* Transaction Metadata */}
          <div className="space-y-3 text-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Order Details
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 rounded-md border p-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground">Date</span>
                  <span className="font-medium text-xs">{transaction.date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md border p-2.5">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-[11px] text-muted-foreground">Method</span>
                  <span className="font-medium text-xs">{transaction.method}</span>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs font-medium">Items Count</span>
              </div>
              <span className="text-sm font-semibold">{transaction.itemsCount} license(s)</span>
            </div>

            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 flex justify-between items-center">
              <div>
                <span className="text-xs font-medium text-muted-foreground">Total Charged</span>
                <p className="text-2xl font-bold text-foreground">
                  ${transaction.amount.toFixed(2)}
                </p>
              </div>
              <Badge variant="outline" className="border-primary/40 text-primary">
                USD
              </Badge>
            </div>

            {transaction.note && (
              <div className="rounded-md border bg-muted/20 p-3 space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Notes</span>
                <p className="text-xs text-foreground italic">{transaction.note}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <SheetFooter className="border-t pt-4 flex-col sm:flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleDownloadInvoice}
            className="w-full gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF Invoice
          </Button>

          <div className="grid grid-cols-2 gap-2 w-full">
            {transaction.status !== "paid" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleStatusChange("paid")}
                className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Paid
              </Button>
            )}
            {transaction.status !== "refunded" && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleStatusChange("refunded")}
                className="gap-1.5 text-xs"
              >
                <RefreshCcw className="h-3.5 w-3.5" />
                Refund
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
