"use client";

import * as React from "react";
import { Search, Users, Mail, ShoppingBag, DollarSign, Calendar, Sparkles } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deriveCustomerDirectory, AggregatedCustomer } from "@/lib/export-utils";
import { Transaction } from "@/lib/mock-data";

interface CustomersViewProps {
  transactions: Transaction[];
  onSelectCustomerOrders?: (email: string) => void;
}

export function CustomersView({ transactions }: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const customers = React.useMemo(() => deriveCustomerDirectory(transactions), [transactions]);

  const filtered = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const totalRevenue = React.useMemo(() => {
    return customers.reduce((sum, c) => sum + c.totalSpent, 0);
  }, [customers]);

  const vipCount = React.useMemo(() => {
    return customers.filter((c) => c.status === "VIP").length;
  }, [customers]);

  return (
    <div className="space-y-6">
      {/* Top Customer KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Customers
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique client accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              VIP Accounts
            </CardTitle>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vipCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Spend &gt; $1,000 threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Lifetime Value
            </CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${customers.length ? (totalRevenue / customers.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Average revenue per client</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Customer Directory</CardTitle>
            <CardDescription>
              Manage client relationships, purchase histories, and tiers
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Customer</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead className="text-center">Total Orders</TableHead>
                  <TableHead>Last Order Date</TableHead>
                  <TableHead className="text-right">Total Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((client) => (
                    <TableRow key={client.email} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{client.avatar}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {client.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {client.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={client.status === "VIP" ? "default" : "secondary"}
                          className="text-[11px]"
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs font-medium">
                        {client.totalOrders} order(s)
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {client.lastOrderDate}
                      </TableCell>
                      <TableCell className="text-right font-semibold font-mono text-foreground">
                        ${client.totalSpent.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                      No customers found matching &quot;{searchQuery}&quot;
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
