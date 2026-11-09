import { Transaction } from "./mock-data";

export interface AggregatedCustomer {
  email: string;
  name: string;
  avatar: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: "VIP" | "Active" | "New";
}

export function formatTransactionsAsCSV(transactions: Transaction[]): string {
  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Email",
    "Amount",
    "Status",
    "Date",
    "Payment Method",
    "Items Count",
    "Notes",
  ];

  const rows = transactions.map((tx) => [
    `"${tx.id}"`,
    `"${tx.customer.name.replace(/"/g, '""')}"`,
    `"${tx.customer.email.replace(/"/g, '""')}"`,
    tx.amount.toFixed(2),
    `"${tx.status}"`,
    `"${tx.date}"`,
    `"${tx.method}"`,
    tx.itemsCount,
    `"${(tx.note || "").replace(/"/g, '""')}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export function triggerCSVDownload(transactions: Transaction[]): void {
  if (typeof window === "undefined") return;

  const csvContent = formatTransactionsAsCSV(transactions);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().split("T")[0];

  link.setAttribute("href", url);
  link.setAttribute("download", `orders-export-${timestamp}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function deriveCustomerDirectory(
  transactions: Transaction[]
): AggregatedCustomer[] {
  const customerMap = new Map<string, AggregatedCustomer>();

  for (const tx of transactions) {
    const email = tx.customer.email.toLowerCase();
    const existing = customerMap.get(email);

    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += tx.amount;
      if (tx.date > existing.lastOrderDate) {
        existing.lastOrderDate = tx.date;
      }
      if (existing.totalSpent > 1000) {
        existing.status = "VIP";
      }
    } else {
      customerMap.set(email, {
        email: tx.customer.email,
        name: tx.customer.name,
        avatar: tx.customer.avatar,
        totalOrders: 1,
        totalSpent: tx.amount,
        lastOrderDate: tx.date,
        status: tx.amount > 1000 ? "VIP" : "Active",
      });
    }
  }

  return Array.from(customerMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  );
}

export function openPrintableInvoice(transaction: Transaction): void {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${transaction.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
          .meta { margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .box { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { text-align: left; padding: 12px; background: #f1f5f9; border-bottom: 2px solid #cbd5e1; font-size: 13px; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
          .total { margin-top: 20px; text-align: right; font-size: 18px; font-weight: bold; }
          .btn-print { margin-top: 30px; background: #2563eb; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; }
          @media print { .btn-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">ACME FLOW</div>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Operations & Billing Suite</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px;">INVOICE</h2>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">#${transaction.id}</p>
            <p style="margin: 4px 0 0; color: #64748b; font-size: 13px;">Date: ${transaction.date}</p>
          </div>
        </div>

        <div class="meta">
          <div class="box">
            <strong style="font-size: 12px; text-transform: uppercase; color: #64748b;">Billed To:</strong>
            <p style="margin: 6px 0 2px; font-weight: 600;">${transaction.customer.name}</p>
            <p style="margin: 0; color: #64748b; font-size: 13px;">${transaction.customer.email}</p>
          </div>
          <div class="box">
            <strong style="font-size: 12px; text-transform: uppercase; color: #64748b;">Payment Details:</strong>
            <p style="margin: 6px 0 2px; font-weight: 600;">Method: ${transaction.method}</p>
            <p style="margin: 0; color: #64748b; font-size: 13px;">Status: <span style="text-transform: uppercase; font-weight: bold; color: ${transaction.status === "paid" ? "#16a34a" : "#dc2626"};">${transaction.status}</span></p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>SaaS Subscription License / Plan Allocation (${transaction.note || "Standard Plan"})</td>
              <td>${transaction.itemsCount}</td>
              <td>$${(transaction.amount / transaction.itemsCount).toFixed(2)}</td>
              <td style="text-align: right;">$${transaction.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Total Amount: $${transaction.amount.toFixed(2)} USD
        </div>

        <div style="text-align: center;">
          <button class="btn-print" onclick="window.print()">Print or Save as PDF</button>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
