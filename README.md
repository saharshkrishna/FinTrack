# FinTrack — Modern Multi-Business Financial Management & GST Invoicing

> **FinTrack** is an all-in-one financial ledger, multi-entity cash flow tracker, and GST-compliant tax invoicing platform designed for small-to-medium enterprises (SMEs), startups, agencies, and multi-business owners.

---

## 💡 What FinTrack Solves

Managing financial transactions across multiple ventures often leads to fragmented spreadsheets, disconnected billing tools, and manual accounting headaches. FinTrack eliminates these pain points with a unified, high-performance platform:

| Core Problem | How FinTrack Solves It |
|---|---|
| **Multi-Business Chaos** | **One Account, Multiple Entities**: Switch between businesses instantly. Every transaction, invoice, party, category, and loan is strictly isolated to its respective business profile. |
| **Cash vs. Credit Confusion** | **Clear 4-Way Transaction Model**: Separate tracking for liquid inflows/outflows (`Cash In`, `Cash Out`) versus future receivables and obligations (`Credit`, `Debit`), keeping working capital transparent. |
| **Complex GST Billing** | **Automated GST Invoicing Engine**: Create GST-compliant invoices with automatic HSN/SAC lookups, state-based tax detection (Intra-State CGST+SGST vs. Inter-State IGST), and Indian currency word conversion (`INR Lakhs/Crores`). |
| **Manual Data Entry Fatigue** | **Smart Bulk Excel Importer**: Import hundreds of transactions in seconds with fuzzy column header matching, date normalization, and automatic auto-seeding of missing categories and counterparties. |
| **Financial Blind Spots** | **Executive Analytics & AI Diagnostics**: Instant health score (0–100), monthly burn rate, cash runway estimation, 5 interactive Recharts visualizations, and actionable cost-cutting recommendations. |
| **Debt & EMI Blindness** | **Loan & EMI Repayment Tracker**: Manage external loans, interest rates, daily/monthly EMIs, closing amounts, and repayment histories in a dedicated ledger. |
| **Network Interruptions** | **Resilient Network Handling**: Real-time connection monitoring with global request indicators, automatic offline banners, and a 6-second auto-reconnect probe that re-syncs state upon recovery. |

---

## 🚀 Key Modules & Capabilities

### 1. 📒 Expense Book (`/expense-book` or `/`)
- **Centralized Ledger**: Scrollable table with sticky headers, pagination, and multi-row selection for batch deletions.
- **Deep Filtering**: Filter transactions by Horizon (`Today`, `Yesterday`, `Last 7 Days`, `Last 30 Days`, `This Month`, `Custom Range`), Type (`Cash In`, `Cash Out`, `Credit`, `Debit`), Counterparty, Category, and Payment Mode.
- **Unified Fast Search**: Real-time searching across remarks, party names, categories, payment modes, and amounts.
- **Inspection Drawer**: Slide-over details panel displaying transaction history, created/modified timestamps, attached receipts, and one-click edit triggers.

### 2. 🧾 Billing & GST Tax Invoices (`/billing`)
- **GST Compliance**: Select customer, line items, quantities, rates, and GST brackets (0%, 5%, 12%, 18%, 28%).
- **Tax Intelligence**: Auto-compares supplier state and customer state to dynamically apply:
  - **Intra-State**: 50% CGST + 50% SGST
  - **Inter-State**: 100% IGST
- **Automated Invoice Sequencing**: Predictable format (`INV-YYYY-YY/0001`).
- **Instant PDF Downloads**: High-resolution print-ready invoices created client-side via `jspdf` and `jspdf-autotable`, complete with seller details, bank settlement coordinates, and amount in words.

### 3. 📊 Financial Overview & Analytics (`/financial-overview`)
- **KPI Summary Cards**: Net Cash Flow, Total Inflows, Total Outflows, Net Cash Margin %, Outstanding Receivables, Active Debt, and Runway.
- **Interactive Recharts Visualizations**:
  - *Outflow Expenses by Category* (Donut Chart)
  - *Cash Flow & Liquidity Breakdown* (Color-coded Bar Chart)
  - *Monthly Inflow vs Outflow Trajectory* (Area/Line Chart)
  - *Payment Channel Distribution* (Bar Chart)
  - *Top Counterparties by Volume* (Horizontal Bar Chart)
- **AI Diagnostics & Checklist**: Algorithmic financial health assessment highlighting high expense concentration, negative cash flow warnings, and an interactive checklist persisted in browser storage.

### 4. 📂 Bulk Excel Importer (`BulkEntryModal`)
- Drag-and-drop `.xlsx` or `.xls` files.
- Fuzzy column detection matching columns for Date, Type, Amount, Party, Category, Payment Mode, and Remarks.
- Inline row editing and row-by-row validation prior to database submission.
- Automatic upsert of newly encountered categories, payment modes, and counterparties.

### 5. 👥 Business Settings & Administration (`/settings`)
- **Business Profile**: Edit trade name, GSTIN, registered address, state code, and contact coordinates.
- **Metadata Management**: Add, edit, or delete custom categories and payment modes.
- **Counterparties Directory**: Maintain a verified list of suppliers and customers with contact details.
- **Team Access**: Invite team members to collaborate on a ledger.

---

## 🛠️ Technology Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **State Management**: React Context API (`AuthContext`, `DataContext`, `SidebarContext`, `NetworkContext`)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Spreadsheet Processing**: [XLSX (SheetJS)](https://sheetjs.com/)
- **Icons**: `react-icons` (Feather `Fi`, FontAwesome `Fa`) & `lucide-react`
- **Notifications**: `react-toastify`

---

## 🌐 Network & Error Resilience

FinTrack is built to withstand real-world network fluctuations:
- **`GlobalNetworkLoader`**: Top-mounted progress indicator displaying active HTTP operations.
- **`NetworkStatusBar`**: Displays offline or disconnected notices with an auto-retry countdown.
- **`ErrorBoundary`**: Root-level catch to prevent white-screen crashes, providing diagnostic traces in development mode.
- **Auto-Sync on Recovery**: Listens for the `fintrack:network-restored` event to automatically refresh backend data when internet access returns.

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- FinTrack Backend service running on port `5000`

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd FinTrack/Frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

The application will start on `http://localhost:5173`.

### Production Build
```bash
# Compile and optimize for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 Architectural Conventions for Contributors

1. **Date Format**: Transaction and invoice dates must strictly follow the `"YYYY-MM-DD"` string convention.
2. **Transaction Types**: Always use the four enum types: `"Cash In"`, `"Cash Out"`, `"Credit"`, `"Debit"`.
3. **Invoice Statuses**: Use strictly `"Draft"`, `"Sent"`, `"Paid"`, `"Cancelled"`.
4. **Modal Design Standard**: Follow the standardized layout documented in [`MODAL_LAYOUT_STANDARD.md`](./src/components/modal/MODAL_LAYOUT_STANDARD.md).
5. **Multi-Tenancy**: Every network request must provide the active business ID through the `x-business-id` HTTP header (handled automatically by `DataContext`).
