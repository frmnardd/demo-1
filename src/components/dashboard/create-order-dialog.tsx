"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction, TransactionStatus } from "@/lib/mock-data";

export interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateOrder: (order: Transaction) => void;
}

export function validateOrderInput(input: {
  customer?: { name?: string; email?: string; avatar?: string };
  amount?: number;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.customer?.name || input.customer.name.trim().length === 0) {
    errors.name = "Customer name is required";
  }

  if (input.amount === undefined || input.amount === null || isNaN(input.amount) || input.amount <= 0) {
    errors.amount = "Amount must be a positive number";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  onCreateOrder,
}: CreateOrderDialogProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [status, setStatus] = React.useState<TransactionStatus>("paid");
  const [method, setMethod] = React.useState("Credit Card");
  const [note, setNote] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const resetForm = () => {
    setName("");
    setEmail("");
    setAmount("");
    setStatus("paid");
    setMethod("Credit Card");
    setNote("");
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    const validation = validateOrderInput({
      customer: { name, email },
      amount: parsedAmount,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU";

    const newOrder: Transaction = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: {
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        avatar: initials,
      },
      amount: parsedAmount,
      status,
      date: new Date().toISOString().split("T")[0],
      itemsCount: 1,
      method,
      note: note.trim() || "Created via Dashboard Quick Action",
    };

    onCreateOrder(newOrder);
    toast.success(`Order ${newOrder.id} created successfully!`, {
      description: `$${newOrder.amount.toFixed(2)} recorded for ${newOrder.customer.name}`,
    });

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) resetForm();
      onOpenChange(v);
    }}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Record a new customer order or subscription license in the system.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Customer Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                Customer Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="e.g. jane@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="amount" className="text-sm font-medium">
                  Amount ($) <span className="text-destructive">*</span>
                </label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="249.00"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: "" }));
                  }}
                />
                {errors.amount && (
                  <p className="text-xs text-destructive">{errors.amount}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="paid" className="bg-background text-foreground">Paid</option>
                  <option value="pending" className="bg-background text-foreground">Pending</option>
                  <option value="refunded" className="bg-background text-foreground">Refunded</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="method" className="text-sm font-medium">
                Payment Method
              </label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Credit Card" className="bg-background text-foreground">Credit Card</option>
                <option value="Stripe Checkout" className="bg-background text-foreground">Stripe Checkout</option>
                <option value="PayPal" className="bg-background text-foreground">PayPal</option>
                <option value="Apple Pay" className="bg-background text-foreground">Apple Pay</option>
                <option value="Wire Transfer" className="bg-background text-foreground">Wire Transfer</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="note" className="text-sm font-medium">
                Internal Note
              </label>
              <Input
                id="note"
                placeholder="Optional notes or subscription details"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Order</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
