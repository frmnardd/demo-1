import * as React from "react";
import { DollarSign, Users, CreditCard, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KpiMetric } from "@/lib/mock-data";

const iconMap = {
  DollarSign,
  Users,
  CreditCard,
  Activity,
};

interface KpiCardsProps {
  kpis: KpiMetric[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.iconName] || Activity;
        const isPositive = kpi.trend === "up";

        return (
          <Card key={kpi.id} className="relative overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Badge
                  variant={isPositive ? "success" : "destructive"}
                  className="px-1.5 py-0 text-[11px] font-medium"
                >
                  {isPositive ? (
                    <TrendingUp className="mr-0.5 inline h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-0.5 inline h-3 w-3" />
                  )}
                  {kpi.change}
                </Badge>
                <span>{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
