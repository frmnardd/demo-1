export interface Customer {
  name: string;
  email: string;
  avatar: string;
}

export type TransactionStatus = "paid" | "pending" | "refunded";

export interface Transaction {
  id: string;
  customer: Customer;
  amount: number;
  status: TransactionStatus;
  date: string;
  itemsCount: number;
  method: string;
  note?: string;
}

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  description: string;
  iconName: "DollarSign" | "Users" | "CreditCard" | "Activity";
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  expenses: number;
}

export interface CategorySalesDataPoint {
  category: string;
  sales: number;
  share: number;
}

export const INITIAL_KPIS: KpiMetric[] = [
  {
    id: "kpi-revenue",
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    trend: "up",
    description: "from last month",
    iconName: "DollarSign",
  },
  {
    id: "kpi-subscriptions",
    title: "Subscriptions",
    value: "+2,350",
    change: "+180.1%",
    trend: "up",
    description: "from last month",
    iconName: "Users",
  },
  {
    id: "kpi-sales",
    title: "Sales Volume",
    value: "+12,234",
    change: "+19%",
    trend: "up",
    description: "from last month",
    iconName: "CreditCard",
  },
  {
    id: "kpi-active",
    title: "Active Now",
    value: "+573",
    change: "-4.5%",
    trend: "down",
    description: "since last hour",
    iconName: "Activity",
  },
];

export const REVENUE_ANALYTICS: Record<string, RevenueDataPoint[]> = {
  "7d": [
    { date: "Mon", revenue: 4200, expenses: 2400 },
    { date: "Tue", revenue: 3800, expenses: 1398 },
    { date: "Wed", revenue: 5100, expenses: 2800 },
    { date: "Thu", revenue: 4600, expenses: 2108 },
    { date: "Fri", revenue: 6400, expenses: 3100 },
    { date: "Sat", revenue: 7200, expenses: 3800 },
    { date: "Sun", revenue: 6800, expenses: 3200 },
  ],
  "30d": [
    { date: "Week 1", revenue: 24000, expenses: 14000 },
    { date: "Week 2", revenue: 28500, expenses: 15800 },
    { date: "Week 3", revenue: 32100, expenses: 17200 },
    { date: "Week 4", revenue: 39800, expenses: 19500 },
  ],
  "12m": [
    { date: "Jan", revenue: 28500, expenses: 16000 },
    { date: "Feb", revenue: 31200, expenses: 17500 },
    { date: "Mar", revenue: 35400, expenses: 19000 },
    { date: "Apr", revenue: 33800, expenses: 18200 },
    { date: "May", revenue: 41200, expenses: 22000 },
    { date: "Jun", revenue: 44500, expenses: 23500 },
    { date: "Jul", revenue: 48000, expenses: 25000 },
    { date: "Aug", revenue: 46700, expenses: 24100 },
    { date: "Sep", revenue: 52400, expenses: 27000 },
    { date: "Oct", revenue: 56900, expenses: 28500 },
    { date: "Nov", revenue: 61200, expenses: 31000 },
    { date: "Dec", revenue: 68500, expenses: 34000 },
  ],
};

export const CATEGORY_SALES: CategorySalesDataPoint[] = [
  { category: "SaaS Enterprise", sales: 42500, share: 45 },
  { category: "Pro Plans", sales: 28400, share: 30 },
  { category: "Add-ons & APIs", sales: 14200, share: 15 },
  { category: "Consulting", sales: 9500, share: 10 },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "ORD-7281",
    customer: { name: "Olivia Martin", email: "olivia.martin@email.com", avatar: "OM" },
    amount: 1999.0,
    status: "paid",
    date: "2026-11-09",
    itemsCount: 3,
    method: "Credit Card",
    note: "Enterprise Annual License tier with priority SLA support.",
  },
  {
    id: "ORD-7282",
    customer: { name: "Jackson Lee", email: "jackson.lee@email.com", avatar: "JL" },
    amount: 39.0,
    status: "pending",
    date: "2026-11-09",
    itemsCount: 1,
    method: "PayPal",
    note: "Pro monthly seat upgrade awaiting bank clearance.",
  },
  {
    id: "ORD-7283",
    customer: { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", avatar: "IN" },
    amount: 299.0,
    status: "paid",
    date: "2026-11-08",
    itemsCount: 2,
    method: "Stripe Checkout",
    note: "Developer team plan subscription renewal.",
  },
  {
    id: "ORD-7284",
    customer: { name: "William Kim", email: "will@email.com", avatar: "WK" },
    amount: 99.0,
    status: "refunded",
    date: "2026-11-08",
    itemsCount: 1,
    method: "Credit Card",
    note: "Accidental duplicate checkout - refund issued within 1 hr.",
  },
  {
    id: "ORD-7285",
    customer: { name: "Sofia Davis", email: "sofia.davis@email.com", avatar: "SD" },
    amount: 399.0,
    status: "paid",
    date: "2026-11-07",
    itemsCount: 4,
    method: "Apple Pay",
    note: "API credits top-up bundle.",
  },
  {
    id: "ORD-7286",
    customer: { name: "Liam Johnson", email: "liam.j@acmecorp.com", avatar: "LJ" },
    amount: 1450.0,
    status: "paid",
    date: "2026-11-07",
    itemsCount: 5,
    method: "Wire Transfer",
    note: "Quarterly invoicing for engineering cluster.",
  },
  {
    id: "ORD-7287",
    customer: { name: "Emma Watson", email: "emma.w@designcraft.io", avatar: "EW" },
    amount: 149.0,
    status: "pending",
    date: "2026-11-06",
    itemsCount: 1,
    method: "Credit Card",
    note: "Design tokens sync module purchase.",
  },
  {
    id: "ORD-7288",
    customer: { name: "Noah Martinez", email: "noah.m@cloudscale.net", avatar: "NM" },
    amount: 850.0,
    status: "paid",
    date: "2026-11-05",
    itemsCount: 2,
    method: "Credit Card",
    note: "Premium monitoring agent license.",
  },
  {
    id: "ORD-7289",
    customer: { name: "Ava Chen", email: "ava.chen@fintechx.com", avatar: "AC" },
    amount: 520.0,
    status: "refunded",
    date: "2026-11-04",
    itemsCount: 2,
    method: "PayPal",
    note: "Customer switched to yearly billing with credit rollover.",
  },
  {
    id: "ORD-7290",
    customer: { name: "Lucas Brown", email: "lucas.b@devops.co", avatar: "LB" },
    amount: 79.0,
    status: "paid",
    date: "2026-11-04",
    itemsCount: 1,
    method: "Google Pay",
    note: "Single user Starter plan.",
  },
];

export function filterTransactions(
  transactions: Transaction[],
  query: string,
  status: string
): Transaction[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedStatus = status.toLowerCase();

  return transactions.filter((t) => {
    const matchesStatus =
      normalizedStatus === "all" || !normalizedStatus
        ? true
        : t.status.toLowerCase() === normalizedStatus;

    const matchesQuery =
      !normalizedQuery ||
      t.id.toLowerCase().includes(normalizedQuery) ||
      t.customer.name.toLowerCase().includes(normalizedQuery) ||
      t.customer.email.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

export function accumulateRevenue(
  currentKpiValue: string,
  newAmount: number
): string {
  // Strip formatting to parse raw number
  const numericVal = parseFloat(currentKpiValue.replace(/[^0-9.]+/g, "")) || 0;
  const updated = numericVal + newAmount;
  return `$${updated.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function sortTransactions(
  transactions: Transaction[],
  field: keyof Transaction,
  direction: "asc" | "desc"
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal === undefined || bVal === undefined) return 0;

    let comparison = 0;
    if (typeof aVal === "number" && typeof bVal === "number") {
      comparison = aVal - bVal;
    } else {
      comparison = String(aVal).localeCompare(String(bVal));
    }

    return direction === "asc" ? comparison : -comparison;
  });
}
