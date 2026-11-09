# Design Document: Modern SaaS Analytics & Operations Dashboard Demo

**Date:** 2026-11-10  
**Status:** In Review  
**Topic:** Next.js + shadcn/ui Interactive SaaS Dashboard

---

## 1. Intent & The Why
The goal is to build an interactive, production-grade demo website that showcases the elegance, accessibility, composability, and UX capabilities of **shadcn/ui** components. Rather than presenting isolated UI widgets, this demo places shadcn/ui into a realistic SaaS operational context (Analytics & Operations Dashboard) where data visualization, tabular data, keyboard navigation, modal overlays, and dark mode work together harmoniously.

---

## 2. Goals, Non-Goals, & Anti-Goals

### Goals
- **Full Dashboard Layout:** Responsive application shell with collapsible sidebar, breadcrumbs, top navigation bar, global search trigger, notifications, and theme toggle.
- **KPI Metrics Cards:** 4 metric cards (Total Revenue, Active Subscriptions, Sales Volume, Pending Orders) featuring Lucide icons and percentage trends.
- **Interactive Data Visualizations:** High-quality charts (Revenue Overview Area Chart and Sales by Category Bar Chart) built using shadcn/ui chart patterns (Recharts) with timeframe switcher tabs (7 days, 30 days, 12 months).
- **Rich Data Table:** Orders/transactions table featuring text search filtering, status badge filters (Completed, Processing, Failed), sortable columns, row action dropdown menus, and pagination.
- **Side Sheet / Drawer Inspection:** Clicking an order opens a slide-over sheet (`Sheet` component) displaying customer profile, order items, timeline status, and quick refund/re-send actions.
- **Modal Dialog Form:** "New Transaction / Invoice" dialog (`Dialog` component) with validated input fields (`Input`, `Select`, `Textarea`, `Button`) and instant feedback via Toast notifications (`Sonner`).
- **Command Palette (`Cmd + K`):** Global command search dialog (`Command` component) for keyboard-first navigation between sections and quick actions.
- **Full Dark / Light Mode Support:** Fluid theme transitions powered by `next-themes` and Tailwind CSS variables.

### Non-Goals
- Real backend database persistence (PostgreSQL/Supabase/Prisma). In-memory mock data with client-side state mutation is sufficient for a demo.
- Complex third-party OAuth authentication (NextAuth/Clerk). The demo runs directly without login barriers, with a mock profile switcher.
- Production payment processing (Stripe integration).

### Anti-Goals
- **Non-interactive dummy buttons:** Avoiding dead ends where clicking does nothing. Every core action (filtering, searching, opening details, adding record, toggling theme) must provide visible user feedback.
- **Un-styled fallback controls:** Avoiding raw unstyled HTML elements; all UI must strictly adhere to the polished shadcn/ui design system tokens.

---

## 3. Approaches Considered & Selected

1. **Approach 1: Modern SaaS Analytics & Operations Dashboard (Selected)**
   - *Pros:* Comprehensive showcase of diverse shadcn/ui components (`Table`, `Card`, `Chart`, `Dialog`, `Sheet`, `Command`, `DropdownMenu`, `Badge`, `Tabs`, `Avatar`, `Tooltip`, `Sonner`). Represents real-world enterprise/SaaS UX.
   - *Trade-offs:* Focuses on business app workflow rather than public marketing content.
   - *Decision:* Chosen because it best highlights the functional strengths and polish of shadcn/ui.

2. **Approach 2: Interactive Component Showcase / Playground (Rejected)**
   - *Pros:* Modular testing of individual components.
   - *Cons:* Feels like technical documentation or Storybook rather than a complete application.

3. **Approach 3: All-in-One Marketing Landing Page + Mini Portal (Rejected)**
   - *Pros:* Balances public landing page and app UI.
   - *Cons:* Dilutes the depth of the dashboard and leaves less room for rich data tables, charts, and operational dialogs.

---

## 4. Technical Stack & Architecture

- **Framework:** Next.js 15 / 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS with CSS Variables for themes
- **Component Primitives:** Radix UI primitives via shadcn/ui
- **Icons:** `lucide-react`
- **Charts:** `recharts` (configured with shadcn/ui chart theme variables)
- **Theme:** `next-themes`
- **Notifications:** `sonner`
- **State Management:** React state + hooks with realistic mock data generator

---

## 5. UI Layout & Component Breakdown

```
+-----------------------------------------------------------------------------------+
|  [Sidebar]        | [Header] Search (Cmd+K) | Notifications | Theme Toggle | User |
|  - Dashboard      +---------------------------------------------------------------+
|  - Analytics      | [KPI Metrics: 4 Cards with Badges & Lucide Icons]             |
|  - Orders         +---------------------------------------------------------------+
|  - Customers      | [Chart: Revenue Trend]        | [Chart: Category Breakdown]   |
|  - Settings       +---------------------------------------------------------------+
|                   | [Orders Data Table: Search, Filter Tabs, Actions, Pagination] |
+-----------------------------------------------------------------------------------+
```

### Key Interactive Flows:
1. **Explore & Filter Table:** User types in search box or selects status tabs ("All", "Paid", "Pending", "Refunded"); table updates in real-time.
2. **Inspect Transaction:** User clicks a table row or clicks "View Details" in the row dropdown menu; a slide-over `Sheet` animates from the right showing full breakdown.
3. **Create Order:** User clicks "+ New Order" button; a `Dialog` pops up with form inputs. Submitting adds the item to the table and triggers a success `Sonner` toast.
4. **Command Palette:** Pressing `Cmd+K` or `Ctrl+K` (or clicking the header search input) opens `CommandDialog` with fuzzy search for quick actions.
5. **Theme Switching:** Clicking the theme toggle switches between Light, Dark, and System modes seamlessly.

---

## 6. What's Left to the Builder
- Selection between standard Tailwind v4 setup or Tailwind v3 compatible shadcn/ui CLI configuration.
- Exact mock dataset records (customer names, amounts, transaction dates, realistic company logos/avatars).
- Micro-interactions (hover transitions, active tab styling, table row highlight).
