"use client";

import * as React from "react";
import { Package, Plus, Check, Sparkles, Tag, Shield, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductTier } from "@/lib/mock-data";

export interface ProductsViewProps {
  products: ProductTier[];
  onAddProduct: (product: ProductTier) => void;
  onToggleStatus: (id: string) => void;
}

export function validateProductInput(input: {
  title?: string;
  price?: number;
  sku?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.title || input.title.trim().length === 0) {
    errors.title = "Product title is required";
  }

  if (input.price === undefined || input.price === null || isNaN(input.price) || input.price < 0) {
    errors.price = "Price must be a valid non-negative number";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function ProductsView({
  products,
  onAddProduct,
  onToggleStatus,
}: ProductsViewProps) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [interval, setInterval] = React.useState<"monthly" | "yearly" | "one-time">("monthly");
  const [description, setDescription] = React.useState("");
  const [featureInput, setFeatureInput] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const resetForm = () => {
    setTitle("");
    setSku("");
    setPrice("");
    setInterval("monthly");
    setDescription("");
    setFeatureInput("");
    setErrors({});
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(price);

    const validation = validateProductInput({
      title,
      price: parsedPrice,
      sku,
    });

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const generatedSku = sku.trim() || `FIX-${title.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)}`;
    const featuresList = featureInput
      ? featureInput.split(",").map((f) => f.trim()).filter(Boolean)
      : ["Full access to Fixentra features", "Standard technical support"];

    const newProduct: ProductTier = {
      id: `prod-${Date.now()}`,
      sku: generatedSku,
      title: title.trim(),
      description: description.trim() || "Commercial subscription tier managed in Fixentra v2.0.",
      price: parsedPrice,
      interval,
      features: featuresList,
      active: true,
    };

    onAddProduct(newProduct);
    toast.success(`Product ${newProduct.title} added to catalog`, {
      description: `SKU: ${newProduct.sku} - $${newProduct.price.toFixed(2)} / ${newProduct.interval}`,
    });

    resetForm();
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Product & Subscription Catalog
            <Badge variant="outline" className="border-primary/30 text-primary text-[10px]">
              {products.length} Active Plans
            </Badge>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure commercial pricing tiers, SKU identifiers, and feature access permissions.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setDialogOpen(true)}
          className="gap-1.5 text-xs shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Product Tier
        </Button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <Card
            key={p.id}
            className={`relative flex flex-col justify-between overflow-hidden transition-all hover:shadow-md ${
              !p.active ? "opacity-60 bg-muted/20" : ""
            }`}
          >
            {p.tierBadge && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                {p.tierBadge}
              </div>
            )}

            <div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-medium text-muted-foreground">
                    {p.sku}
                  </span>
                  <Badge
                    variant={p.active ? "success" : "secondary"}
                    className="text-[10px]"
                  >
                    {p.active ? "Active" : "Archived"}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-1">
                  {p.title}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {p.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-foreground">
                    ${p.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    /{p.interval === "monthly" ? "mo" : p.interval === "yearly" ? "yr" : "one-time"}
                  </span>
                </div>

                <div className="space-y-2 border-t pt-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Included Features:
                  </span>
                  <ul className="space-y-1.5">
                    {p.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </div>

            <CardFooter className="border-t pt-3 bg-muted/10">
              <Button
                variant={p.active ? "outline" : "default"}
                size="sm"
                onClick={() => {
                  onToggleStatus(p.id);
                  toast.info(`${p.title} status toggled`);
                }}
                className="w-full text-xs"
              >
                {p.active ? "Archive Tier" : "Activate Tier"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Add Product Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Add Product or License Tier</DialogTitle>
              <DialogDescription>
                Create a new digital SaaS package available for customer allocation.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium">
                  Plan / Product Title <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Fixentra Enterprise AI"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-sm"
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <label className="text-xs font-medium">SKU Code</label>
                  <Input
                    placeholder="e.g. FIX-AI-PLUS"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="text-sm uppercase font-mono"
                  />
                </div>

                <div className="grid gap-1.5">
                  <label className="text-xs font-medium">
                    Price ($) <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="299.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="text-sm"
                  />
                  {errors.price && (
                    <p className="text-xs text-destructive">{errors.price}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Billing Interval</label>
                <select
                  value={interval}
                  onChange={(e) => setInterval(e.target.value as "monthly" | "yearly" | "one-time")}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="monthly" className="bg-background">Monthly Subscription</option>
                  <option value="yearly" className="bg-background">Annual Renewal</option>
                  <option value="one-time" className="bg-background">One-time Lifetime License</option>
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">Description</label>
                <Input
                  placeholder="Brief summary of plan target audience"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium">
                  Features (comma-separated)
                </label>
                <Input
                  placeholder="e.g. 50 Seats, AI Copilot, Webhooks"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  resetForm();
                  setDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Product Tier
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
