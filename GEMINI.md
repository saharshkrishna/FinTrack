# FinTrack — Codebase Memory & Architecture Guide

> **Automatic Agent Memory File**: This file is automatically loaded into Antigravity's context for all tasks in `FinTrack`. It provides the complete architectural blueprint, database schemas, API map, network resiliency mechanisms, and key frontend workflows so that deep codebase re-analysis is not required.

---

## 1. Project Overview & Tech Stack

- **Purpose**: Full-featured multi-business expense, ledger, and GST financial management system. Features include double-entry cash flow records (Inflow/Outflow/Credit/Debit), comprehensive GST tax invoicing with instant PDF downloads, loan & daily/monthly EMI tracking, counterparty ledgers, category & payment mode configurations, bulk Excel spreadsheet ingestion, automated network fault tolerance, and visual financial diagnostics.
- **Frontend**:
  - React 18, Vite 7, Tailwind CSS 3.4
  - State Management: React Context API (`AuthContext`, `DataContext`, `SidebarContext`, `NetworkContext`)
  - Error Handling: Root `ErrorBoundary` with dev-mode inspection, `NetworkStatusBar`, and `GlobalNetworkLoader`
  - Icons: `react-icons` (Fi, Fa), `lucide-react`
  - Visualizations: `recharts` (Pie, Bar, Area/Line charts)
  - PDF & Export: `jspdf`, `jspdf-autotable` (v5 with `autoTable(doc, ...)`), `html2canvas`, `xlsx`
  - Notifications: `react-toastify`
  - Running on: `http://localhost:5173` (dev)
- **Backend**:
  - Node.js, Express.js (REST API on port `5000`)
  - Database: MongoDB Atlas via Mongoose
  - Auth: JWT (`jsonwebtoken`) with `Bearer` token header (testing bypass enabled)
  - Multi-Tenancy: Scoped strictly per business using `x-business-id` header
  - File Storage: Local filesystem (`Backend/uploads/`) served at `/uploads`
  - Health & Diagnostics: `GET /api/health` with process uptime and status
  - Running on: `http://localhost:5000`

---

## 2. Directory Structure Map

```
FinTrack/
├── GEMINI.md                                  # <-- This memory file (auto-loaded)
├── Backend/
│   ├── index.js                              # Server entry point, route mounting & DB connection
│   ├── MongoDb/
│   │   ├── connect.js                        # Mongoose connection logic
│   │   └── models/userModels/                # Mongoose schemas
│   │       ├── User.js                       # User credentials & businesses array
│   │       ├── Business.js                   # Business profile (GSTIN, address, state, team)
│   │       ├── Transaction.js                # Core transaction model (min amount >= 0)
│   │       ├── Invoice.js                    # GST Billing model with line items & tax breakdown
│   │       ├── Category.js                   # Transaction category
│   │       ├── Party.js                      # Counterparty details (Suppliers / Customers)
│   │       ├── Payment.js                    # Payment channels (Cash, Bank, UPI, Cheque, etc.)
│   │       ├── Loan.js                       # Loans tracker
│   │       └── LoanRe.js                     # Loan repayment entries
│   ├── controllers/                          # Business logic handlers
│   │   ├── auth.controller.js                # login, signup, verify
│   │   ├── business.controller.js            # business CRUD, profile & team access
│   │   ├── transaction.controller.js         # single, bulk & type-queried transactions
│   │   ├── invoice.controller.js             # GST calculation, invoice numbering & CRUD
│   │   ├── party.controller.js               # counterparty CRUD & auto-sync
│   │   ├── category.controller.js            # category CRUD & default seeding
│   │   ├── Payment.controller.js             # payment mode CRUD & default seeding
│   │   ├── loan.controller.js                # loan issuance CRUD
│   │   └── loanRe.controller.js              # loan repayments CRUD
│   ├── middleware/
│   │   ├── auth.js                           # verifyToken middleware (relaxed for testing)
│   │   └── business.js                       # Extracts and attaches businessId from header/user
│   └── routes/                               # Express route files
│       ├── auth.routes.js                    # /api/auth
│       ├── business.routes.js                # /api/business
│       ├── transaction.routes.js             # /api/user/transactions
│       ├── invoice.routes.js                 # /api/user/invoices
│       ├── party.routes.js                   # /api/user/parties
│       ├── category.routes.js                # /api/user/category
│       ├── payment.routes.js                 # /api/user/paymentMode
│       ├── loan.routes.js                    # /api/user/loans
│       ├── loanRe.routes.js                  # /api/user/loanRe
│       └── file.routes.js                    # /api/user/uploads
└── Frontend/
    ├── README.md                             # Software purpose, features & setup guide
    ├── src/
    │   ├── App.jsx                           # Application router & provider nesting
    │   ├── context/
    │   │   ├── AuthContext.jsx               # Auth state, token persistence, activeBusiness
    │   │   ├── DataContext.jsx               # Shared data store, API calls, interceptors
    │   │   ├── NetworkContext.jsx            # Offline detection, auto-retry & active request count
    │   │   └── SidebarContext.jsx            # Responsive navigation collapse state
    │   ├── pages/
    │   │   ├── ExpenseBook.jsx               # Primary transaction ledger & batch management
    │   │   ├── FinancialOverview.jsx         # Executive analytics, KPIs, Recharts & AI advice
    │   │   ├── BillingPage.jsx               # GST Billing dashboard, KPI strip & PDF invoices
    │   │   ├── BusinessSettings.jsx          # Settings (Profile, Categories, Modes, Parties, Team)
    │   │   ├── Landing.jsx                   # Modern SaaS landing page
    │   │   ├── Login.jsx & Signup.jsx        # Authentication screens
    │   │   └── Auth.css
    │   ├── components/
    │   │   ├── Header.jsx                    # Top bar with active business & bulk/report triggers
    │   │   ├── Filters.jsx                   # Date, Type, Party, PaymentMode, Category filters
    │   │   ├── SearchAndActnbtn.jsx          # Search bar & action triggers (Cash In/Out, Credit, Debit, Loan)
    │   │   ├── Summary.jsx                   # 7 KPI summary cards
    │   │   ├── Table.jsx                     # Transactions table (sticky headers, batch delete)
    │   │   ├── Pagination.jsx                # Table page controls
    │   │   ├── Sidebar.jsx                   # Navigation menu & business switcher
    │   │   ├── common/
    │   │   │   ├── ErrorBoundary.jsx         # Safe React error boundary (import.meta.env.DEV)
    │   │   │   ├── GlobalNetworkLoader.jsx   # Top loading bar during active Axios requests
    │   │   │   ├── NetworkStatusBar.jsx      # Sticky offline / reconnecting warning banner
    │   │   │   └── NetworkErrorCard.jsx      # In-page network retry card
    │   │   ├── overview/
    │   │   │   ├── OverviewHeader.jsx        # Time-range selectors & report export
    │   │   │   ├── OverviewKpis.jsx          # Burn rate, net cash, margin, runway, health score
    │   │   │   ├── OverviewCharts.jsx        # 5 Recharts visualizations
    │   │   │   └── OverviewDiagnostics.jsx   # Actionable financial advice & checklist
    │   │   └── modal/
    │   │       ├── InvoiceModal.jsx          # Comprehensive GST Tax Invoice creation/editor
    │   │       ├── BulkEntryModal.jsx        # Excel import modal with fuzzy column mapping
    │   │       ├── ReportModal.jsx           # Financial analytics PDF generator
    │   │       ├── CashinModal.jsx           # Cash Inflow entry modal
    │   │       ├── CashoutModal.jsx          # Cash Outflow entry modal
    │   │       ├── CreditModal.jsx           # Receivable entry modal
    │   │       ├── DebitModal.jsx            # Payable entry modal
    │   │       ├── LoanModal.jsx             # Loan entry modal
    │   │       ├── LoanReModal.jsx           # Loan repayment modal
    │   │       ├── EntryDetails.jsx          # Transaction slide-over inspection drawer
    │   │       ├── LoanEntryDetails.jsx      # Loan slide-over inspection drawer
    │   │       ├── AddBusinessModal.jsx      # Create new business modal
    │   │       ├── PartyModal.jsx            # Add party modal
    │   │       ├── AddingModal.jsx           # Add category / payment mode modal
    │   │       └── DateModal.jsx             # Custom date range picker modal
    │   └── utils/
    │       ├── invoiceHelpers.js             # GST tax formulas, Indian states, number-to-words
    │       └── invoicePdfGenerator.js        # jsPDF + autoTable invoice PDF generator
```

---

## 3. Database Schema Reference

### `Transaction` (`Backend/MongoDb/models/userModels/Transaction.js`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `businessId` | `ObjectId (ref: 'Business')` | Yes | Indexed for multi-tenancy |
| `type` | `String` | Yes | Enum: `["Cash In", "Cash Out", "Credit", "Debit"]` |
| `date` | `String` | Yes | Stored strictly as `"YYYY-MM-DD"` |
| `amount` | `Number` | Yes | Must be `>= 0` |
| `partyName` | `String` | No | Default `""` |
| `remarks` | `String` | No | Default `""` |
| `category` | `String` | No | Default `""` |
| `paymentMode`| `String` | No | Default `"Cash"` |
| `files` | `[String]` | No | URLs/paths of attached receipt images or PDFs |
| `timestamps` | `Boolean` | Yes | Auto `createdAt`, `updatedAt` |
| *Indexes* | | | `{ businessId: 1, date: -1 }`, `{ businessId: 1, type: 1 }` |

### `Invoice` (`Backend/MongoDb/models/userModels/Invoice.js`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `businessId` | `ObjectId (ref: 'Business')` | Yes | Indexed for multi-tenancy |
| `invoiceNumber` | `String` | Yes | Auto-formatted sequence: `INV-YYYY-YY/NNNN` |
| `invoiceDate` | `String` | Yes | Format `"YYYY-MM-DD"` |
| `dueDate` | `String` | No | Format `"YYYY-MM-DD"` |
| `supplierName` | `String` | No | Auto-filled from active business profile |
| `supplierGSTIN`| `String` | No | Uppercase GSTIN |
| `supplierAddress`, `supplierState`, `supplierStateCode`, `supplierPhone`, `supplierEmail` | `String` | No | Supplier contact & tax origin |
| `customerName` | `String` | Yes | Client / Buyer company name |
| `customerGSTIN`| `String` | No | Customer GST number |
| `customerAddress`, `customerState`, `customerStateCode`, `customerPhone`, `customerEmail` | `String` | No | Buyer contact & destination |
| `placeOfSupply`, `placeOfSupplyCode` | `String` | No | State determining tax split |
| `isInterState` | `Boolean` | No | `false` = CGST + SGST (50/50); `true` = IGST |
| `items` | `[InvoiceItemSchema]` | Yes | Array of line items (description, HSN, quantity, rate, discount, gstRate, tax amounts, line total) |
| `subtotal`, `totalCGST`, `totalSGST`, `totalIGST`, `totalTax`, `roundOff`, `grandTotal` | `Number` | Yes | Automatically calculated financial figures |
| `amountInWords` | `String` | Yes | English representation in Indian numbering (Lakhs/Crores) |
| `bankName`, `bankAccount`, `bankIFSC`, `bankBranch` | `String` | No | Bank settlement details |
| `status` | `String` | Yes | Enum: `['Draft', 'Sent', 'Paid', 'Cancelled']` (case-normalized) |

### `Business` (`Backend/MongoDb/models/userModels/Business.js`)
- `userId`: `ObjectId (ref: 'User')`
- `name`: `String` (Required)
- `businessId`: `String` (Unique display code, e.g. `BIZ-XXXXX`)
- `category`: `String`
- `gstNumber`: `String`
- `address`, `state`, `stateCode`, `city`, `pincode`, `phone`, `email`: `String` (auto-used for invoices)
- `currency`: `String` (Default: `"INR"`)
- `teamMembers`: `[String]` (Email list of invited staff)

### `User` (`Backend/MongoDb/models/userModels/User.js`)
- `name`, `email`, `password` (hashed)
- `businesses`: Array of `ObjectId (ref: 'Business')`

---

## 4. API & Backend Architecture

### Headers & Multi-Tenancy Convention
Every API call from the frontend passes:
1. `Authorization: Bearer <token>` (JWT)
2. `x-business-id: <business_id>` (active business identifier)
*Configured globally in Axios interceptors inside `Frontend/src/context/DataContext.jsx`.*

### Key Endpoints:
| Route | Method | Controller Handler | Purpose |
|---|---|---|---|
| `/api/health` | GET | Inline handler | Health probe (uptime, status) |
| `/api/auth/login` | POST | `auth.login` | Authenticate with email or business_id |
| `/api/auth/signup` | POST | `auth.signup` | Register new user |
| `/api/auth/verify` | GET | `auth.verifyToken` | Verify JWT & return active businesses |
| `/api/business` | POST | `business.createBusiness` | Create new business profile |
| `/api/business/:id` | PUT/DELETE | `business.updateBusiness` | Edit business info or delete |
| `/api/user/transactions` | GET | `transaction.getAllTransactions` | Fetch all transactions for active business |
| `/api/user/transactions` | POST | `transaction.createTransaction` | Create single transaction (validates amount >= 0) |
| `/api/user/transactions/:type` | GET | `transaction.getTransactionsByType` | Filter transactions by enum type |
| `/api/user/transactions/bulk` | POST | `transaction.createBulkTransactions` | Bulk insert array `{ transactions: [...] }` |
| `/api/user/transactions/:id` | PUT | `transaction.updateTransaction` | Update transaction by ID |
| `/api/user/transactions/delete` | POST | `transaction.deleteTransactions` | Batch delete transactions by array of IDs |
| `/api/user/invoices` | GET | `invoice.getInvoices` | Fetch all invoices for active business |
| `/api/user/invoices` | POST | `invoice.createInvoice` | Create GST tax invoice with calculations |
| `/api/user/invoices/:id` | GET/PUT/DEL | `invoice.controller` | Single invoice operations |
| `/api/user/invoices/next-number` | GET | `invoice.getNextInvoiceNumber` | Auto-sequence preview (`INV-YYYY-YY/NNNN`) |
| `/api/user/parties` | GET/POST/PUT/DEL | `party.controller` | Counterparty CRUD |
| `/api/user/category` | GET/POST/PUT/DEL | `category.controller` | Category CRUD & auto-seeding |
| `/api/user/paymentMode` | GET/POST/PUT/DEL | `Payment.controller` | Payment mode CRUD & auto-seeding |
| `/api/user/loans` | GET/POST/PUT/DEL | `loan.controller` | Loan records CRUD |
| `/api/user/loanRe` | GET/POST/PUT/DEL | `loanRe.controller` | Loan repayment records CRUD |

---

## 5. Frontend State Management & Resiliency

### `AuthContext` (`Frontend/src/context/AuthContext.jsx`)
- State: `user`, `activeBusiness`, `businesses`, `loading`
- Actions: `login()`, `signup()`, `logout()`, `switchBusiness(businessId)`, `createBusiness(data)`
- Persistence: `localStorage.getItem('token')`, `localStorage.getItem('businessId')`

### `DataContext` (`Frontend/src/context/DataContext.jsx`)
- State: `transactions`, `invoices`, `parties`, `categories`, `paymentModes`, `loans`, `loading`, `error`
- Auto-sync: Triggers `fetchAllData()` on mount and when `activeBusiness?._id` changes.
- Integrated Operations: Full CRUD for transactions, invoices, categories, payment modes, parties, and loans.
- Axios Interceptors: Attaches JWT & `x-business-id` headers; triggers `fintrack:request-start` / `fintrack:request-end` events for top loading bar; dispatches `fintrack:network-error` on network failure.

### `NetworkContext` (`Frontend/src/context/NetworkContext.jsx`)
- State: `isOnline`, `isServerReachable`, `hasNetworkError`, `isReconnecting`, `activeRequests`, `retryCountdown`
- Automated Health Probing: Probes `GET http://localhost:5000/api/health` with a 6-second countdown when disconnected.
- Event Dispatches: Emits `fintrack:network-restored` to trigger auto data re-sync in `DataContext`.

---

## 6. Key Workflows & Features

### 1. GST Billing & Instant PDF Invoicing (`BillingPage.jsx` & `InvoiceModal.jsx`)
- Accessible via `/billing` or Sidebar "Billing & Invoices".
- Automatic line-item computations (Taxable Value, CGST, SGST, IGST, Line Total).
- State-aware tax splitting: Compares supplier state vs customer state to toggle between Intra-State (CGST+SGST) and Inter-State (IGST).
- Number-to-Words converter in Indian numbering format (Lakhs & Crores).
- Instant downloadable PDF invoices built with `jspdf` and `jspdf-autotable` (`autoTable(doc, ...)`), styled with modern typography, table borders, and fallback blob downloads.

### 2. Financial Overview & Analytics (`FinancialOverview.jsx`)
- Accessible via `/overview` or `/financial-overview`.
- Filterable by horizon: `All Time`, `This Month`, `Last 30 Days`, `Last 6 Months`, `This Year`.
- Executive KPIs: Net Cash Flow, Net Operating Margin %, Total Inflow/Outflow, Monthly Burn Rate, Inflow:Outflow Ratio, Estimated Runway, Health Score (0-100).
- 5 Recharts Visualizations: Outflow by Category, Cash Flow Breakdown, Monthly Trends, Payment Channel Distribution, Top Counterparties.
- AI Business Diagnostics: Evaluates negative cash flow, high category concentration, overdue receivables, and recommended 3-month liquidity reserve.
- Interactive Actionable Checklist: Persisted locally per business in `localStorage`.

### 3. Bulk Excel Import (`BulkEntryModal.jsx`)
- Triggered from header button: `<Header onOpenBulkImport={...} />`
- Parses `.xlsx` and `.xls` using `xlsx` in-browser with fuzzy header matching.
- Normalizes date formats to `YYYY-MM-DD` and cleans numerical amounts.
- Sends batch payload `{ transactions: [...] }` to `POST /api/user/transactions/bulk` and auto-upserts missing categories, parties, and payment modes.

### 4. Standardized Modal Design (`MODAL_LAYOUT_STANDARD.md`)
- All 8 modals (`CashinModal`, `CashoutModal`, `CreditModal`, `DebitModal`, `LoanModal`, `LoanReModal`, `PartyModal`, `AddingModal`) follow a unified pattern:
  - Centered overlay with backdrop blur (`fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4`).
  - Container: `bg-white rounded-2xl shadow-2xl max-w-lg md:max-w-xl`.
  - Themed header with rounded icon badge.
  - Safe inline arithmetic evaluation with `new Function()` (no `eval`).
  - File attachment badges with removal actions.

---

## 7. Developer Guidelines & Constraints

1. **Git Workflow**: Do not run Git commands (`git add`, `git commit`, `git push`, branch switching) unless explicitly asked.
2. **Minimal Changes**: Modify only the necessary files. Do not perform wide, unrequested refactors.
3. **Date Format**: Always use `"YYYY-MM-DD"` string format for all transaction and invoice dates.
4. **Transaction Types**: Always use strictly the enum values: `"Cash In"`, `"Cash Out"`, `"Credit"`, `"Debit"`.
5. **Invoice Status**: Always use strictly the enum values: `"Draft"`, `"Sent"`, `"Paid"`, `"Cancelled"`.
6. **Multi-Business Context**: Any new database model or query touching business transactions must respect `businessId`.
7. **Testing Mode (Token Validation Bypassed)**: Strict JWT verification in `Backend/middleware/auth.js` and `Backend/controllers/auth.controller.js` (`verifyToken`) is bypassed for testing so operations never get blocked with 401 Invalid Token errors.
