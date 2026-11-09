"use client";

import * as React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REVENUE_ANALYTICS, CATEGORY_SALES } from "@/lib/mock-data";

export function ChartsSection() {
  const [timeframe, setTimeframe] = React.useState<"7d" | "30d" | "12m">("7d");
  const revenueData = REVENUE_ANALYTICS[timeframe] || REVENUE_ANALYTICS["7d"];

  return (
    <div className="grid gap-4 md:grid-cols-7">
      <Card className="col-span-4 transition-all">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-base font-semibold">Revenue Overview</CardTitle>
            <CardDescription>
              Track total earnings vs operational expenses over time
            </CardDescription>
          </div>
          <Tabs
            value={timeframe}
            onValueChange={(val) => setTimeframe(val as "7d" | "30d" | "12m")}
          >
            <TabsList className="grid grid-cols-3 h-8 w-[180px]">
              <TabsTrigger value="7d" className="text-xs">
                7 Days
              </TabsTrigger>
              <TabsTrigger value="30d" className="text-xs">
                30 Days
              </TabsTrigger>
              <TabsTrigger value="12m" className="text-xs">
                12 Months
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2.5 shadow-md">
                          <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
                          <div className="flex flex-col gap-1 text-xs">
                            <span className="text-primary font-medium">
                              Revenue: ${Number(payload[0]?.value).toLocaleString()}
                            </span>
                            <span className="text-emerald-500 font-medium">
                              Expenses: ${Number(payload[1]?.value).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#expenseGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Expenses</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-3 transition-all">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Sales by Product Tier</CardTitle>
          <CardDescription>Breakdown across commercial subscription segments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={CATEGORY_SALES}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as { category: string; sales: number; share: number };
                      return (
                        <div className="rounded-lg border bg-background p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground mb-1">{data.category}</p>
                          <p className="text-primary font-medium">Sales: ${data.sales.toLocaleString()}</p>
                          <p className="text-muted-foreground">Share: {data.share}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
