"use client";

import * as React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  RefreshCw,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChartsSection } from "./charts-section";
import { REVENUE_ANALYTICS } from "@/lib/mock-data";

export function AnalyticsView() {
  const metrics = [
    {
      title: "Avg Order Value (AOV)",
      value: "$482.10",
      change: "+8.4%",
      trend: "up",
      description: "vs previous quarter",
      icon: DollarSign,
    },
    {
      title: "Conversion Rate",
      value: "3.42%",
      change: "+1.2%",
      trend: "up",
      description: "visitor to checkout",
      icon: Percent,
    },
    {
      title: "Customer Churn",
      value: "1.18%",
      change: "-0.4%",
      trend: "down",
      description: "monthly attrition rate",
      icon: RefreshCw,
    },
    {
      title: "Revenue per User (ARPU)",
      value: "$89.50",
      change: "+14.2%",
      trend: "up",
      description: "annual active average",
      icon: Users,
    },
  ];

  const monthlyData = REVENUE_ANALYTICS["12m"] || [];

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          const isUp = m.trend === "up";
          return (
            <Card key={m.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {m.title}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{m.value}</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Badge
                    variant={isUp ? "success" : "secondary"}
                    className="px-1.5 py-0 text-[10px]"
                  >
                    {isUp ? (
                      <TrendingUp className="mr-0.5 inline h-3 w-3" />
                    ) : (
                      <TrendingDown className="mr-0.5 inline h-3 w-3" />
                    )}
                    {m.change}
                  </Badge>
                  <span>{m.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Charts */}
      <ChartsSection />

      {/* Monthly Financial Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Monthly Performance Audit
          </CardTitle>
          <CardDescription>
            Historical revenue vs operational expenditure breakdown (12-month window)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead>Month</TableHead>
                  <TableHead>Gross Revenue</TableHead>
                  <TableHead>Operating Expenses</TableHead>
                  <TableHead>Net Profit</TableHead>
                  <TableHead className="text-right">Profit Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((d) => {
                  const profit = d.revenue - d.expenses;
                  const margin = ((profit / d.revenue) * 100).toFixed(1);
                  return (
                    <TableRow key={d.date} className="hover:bg-muted/50">
                      <TableCell className="font-semibold">{d.date}</TableCell>
                      <TableCell className="font-mono">${d.revenue.toLocaleString()}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        ${d.expenses.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        +${profit.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                          {margin}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
