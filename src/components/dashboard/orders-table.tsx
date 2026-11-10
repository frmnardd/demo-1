"use client";

import * as React from "react";
import {
  Search,
  MoreHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  RefreshCcw,
  X,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Transaction,
  TransactionStatus,
  filterTransactions,
  sortTransactions,
} from "@/lib/mock-data";

export interface OrdersTableProps {
  transactions: Transaction[];
  onSelectTransaction: (transaction: Transaction) => void;
  onStatusChange: (id: string, newStatus: TransactionStatus) => void;
  onDeleteOrder?: (id: string) => void;
}

export function OrdersTable({
  transactions,
  onSelectTransaction,
  onStatusChange,
  onDeleteOrder,
}: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [sortField, setSortField] = React.useState<keyof Transaction>("date");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const filtered = React.useMemo(() => {
    const list = filterTransactions(transactions, searchQuery, statusFilter);
    return sortTransactions(list, sortField, sortDirection);
  }, [transactions, searchQuery, statusFilter, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedTransactions = React.useMemo(() => {
    const start = (safeCurrentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, safeCurrentPage]);

  const toggleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getStatusBadge = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20">Pending</Badge>;
      case "refunded":
        return <Badge variant="destructive">Refunded</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search orders, customers, email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter status buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "paid", label: "Paid" },
            { id: "pending", label: "Pending" },
            { id: "refunded", label: "Refunded" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={statusFilter === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className="h-8 text-xs capitalize"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[85px] sm:w-[120px]">Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort("date")}
                  className="-ml-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Date
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSort("amount")}
                  className="-ml-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Amount
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px] sm:w-[60px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((tx) => (
                <TableRow
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="cursor-pointer transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-mono text-[11px] sm:text-xs font-semibold text-primary whitespace-nowrap">
                    {tx.id}
                  </TableCell>
                  <TableCell className="max-w-[140px] sm:max-w-none">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                        <AvatarFallback className="text-[10px] sm:text-xs">{tx.customer.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm font-medium leading-none text-foreground truncate">
                          {tx.customer.name}
                        </span>
                        <span className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate hidden sm:inline">
                          {tx.customer.email}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 md:hidden">
                          {tx.date}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {tx.date}
                  </TableCell>
                  <TableCell className="font-semibold text-xs sm:text-sm text-foreground whitespace-nowrap">
                    ${tx.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {tx.method}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{getStatusBadge(tx.status)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onSelectTransaction(tx)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {tx.status !== "paid" && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(tx.id, "paid")}
                            className="text-emerald-600 focus:text-emerald-600"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        {tx.status !== "refunded" && (
                          <DropdownMenuItem
                            onClick={() => onStatusChange(tx.id, "refunded")}
                            className="text-amber-600 focus:text-amber-600"
                          >
                            <RefreshCcw className="mr-2 h-4 w-4" />
                            Refund Order
                          </DropdownMenuItem>
                        )}
                        {onDeleteOrder && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDeleteOrder(tx.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Order
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      No orders found matching your search
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try clearing filters or searching with a different keyword.
                    </p>
                    {searchQuery && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="mt-2 text-xs"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div>
          Showing {paginatedTransactions.length} of {filtered.length} order(s)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage <= 1}
            className="h-8 gap-1 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </Button>
          <span className="font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage >= totalPages}
            className="h-8 gap-1 text-xs"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
