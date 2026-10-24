# FinTrack — Codebase Memory & Architecture Guide

> **Automatic Agent Memory File**: This file is automatically loaded into Antigravity's context for all tasks in `FinTrack`. It provides the complete architectural blueprint, database schemas, API map, and key frontend workflows so that deep codebase re-analysis is not required.

---

## 1. Project Overview & Tech Stack

- **Purpose**: Multi-business expense and financial transaction tracker with support for loans, parties, categories, payment modes, bulk Excel import, and PDF statistical reports.
- **Frontend**:
  - React 18, Vite 7, Tailwind CSS 3.4
  - State Management: React Context API (`AuthContext`, `DataContext`, `SidebarContext`)
  - Icons: `react-icons` (Fi, Fa)
  - Visualizations: `recharts`
  - PDF & Export: `jspdf`, `jspdf-autotable`, `html2canvas`, `xlsx`
  - Notifications: `react-toastify`
  - Running on: `http://localhost:5173` (dev)
- **Backend**:
  - Node.js, Express.js (REST API on port `5000`)
  - Database: MongoDB via Mongoose
  - Auth: JWT (`jsonwebtoken`) with `Bearer` token header
  - File Storage: Local filesystem (`Backend/uploads/`) served at `/uploads`
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
│   │       ├── Business.js                   # Multi-business profile
│   │       ├── Transaction.js                # Core transaction model
│   │       ├── Category.js                   # Transaction category
│   │       ├── Party.js                      # Counterparty details
│   │       ├── PaymentMode.js                # Cash, Bank, UPI, etc.
│   │       └── Loan.js                       # Loans & Loan repayments
│   ├── controllers/                          # Business logic handlers
│   │   ├── auth.controller.js                # login, signup, verify
│   │   ├── business.controller.js            # business CRUD & switching
│   │   ├── transaction.controller.js         # single & bulk transaction operations
│   │   ├── party.controller.js
│   │   ├── category.controller.js
│   │   ├── paymentMode.controller.js
│   │   └── loan.controller.js
│   ├── middleware/
│   │   ├── auth.js                           # verifyToken middleware
│   │   └── business.js                       # Extracts and attaches businessId from header/user
│   └── routes/                               # Express route files
│       ├── auth.routes.js                    # /api/auth
│       ├── business.routes.js                # /api/business
│       ├── transaction.routes.js             # /api/user/transactions
│       ├── party.routes.js                   # /api/user/parties
│       ├── category.routes.js                # /api/user/category
│       ├── payment.routes.js                 # /api/user/paymentMode
│       ├── loan.routes.js                    # /api/user/loans
│       ├── loanRe.routes.js                  # /api/user/loanRe
│       └── file.routes.js                    # /api/user/uploads
└── Frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx               # User auth, token, activeBusiness management
    │   │   ├── DataContext.jsx               # Central data store (transactions, parties, etc.)
    │   │   └── SidebarContext.jsx            # Sidebar collapse state
    │   ├── pages/
    │   │   ├── ExpenseBook.jsx               # Main dashboard with table, filters & actions
    │   │   ├── Landing.jsx                   # Public landing page
    │   │   ├── Login.jsx & Signup.jsx        # Authentication screens
    │   │   └── Auth.css
    │   └── components/
    │       ├── Header.jsx                    # Top bar with business name/ID, Bulk & Reports triggers
    │       ├── Filters.jsx                   # Duration, Type, Party, PaymentMode, Category filters
    │       ├── SearchAndActnbtn.jsx          # Search bar & buttons for Cash In/Out, Credit, Debit, Loan
    │       ├── Summary.jsx                   # 7 KPI summary cards (Cash In/Out, Debit, Credit, Loans, Net)
    │       ├── Table.jsx                     # Transactions table (scrollable, batch delete, pagination)
    │       ├── Pagination.jsx                # Table page controls
    │       ├── Sidebar.jsx                   # Navigation menu & business switcher
    │       └── modal/
    │           ├── BulkEntryModal.jsx        # Excel import modal with mapping, preview & validation
    │           ├── ReportModal.jsx           # PDF generator with filters, custom name & charts
    │           ├── CashinModal.jsx           # Cash In entry form
    │           ├── CashoutModal.jsx          # Cash Out entry form
    │           ├── CreditModal.jsx           # Credit entry form
    │           ├── DebitModal.jsx            # Debit entry form
    │           ├── LoanModal.jsx             # Loan entry form
    │           ├── LoanReModal.jsx           # Loan Re entry form
    │           ├── EntryDetails.jsx          # Transaction view/edit modal
    │           ├── LoanEntryDetails.jsx      # Loan view/edit modal
    │           ├── AddBusinessModal.jsx      # Create new business modal
    │           ├── PartyModal.jsx            # Add/edit party modal
    │           └── DateModal.jsx             # Custom date range picker modal
```

---

## 3. Database Schema Reference

### `Transaction` (`Backend/MongoDb/models/userModels/Transaction.js`)
| Field | Type | Required | Notes |
|---|---|---|---|
| `businessId` | `ObjectId (ref: 'Business')` | Yes | Indexed for multi-tenancy |
| `type` | `String` | Yes | Enum: `["Cash In", "Cash Out", "Credit", "Debit"]` |
| `date` | `String` | Yes | Stored strictly as `"YYYY-MM-DD"` |
| `amount` | `Number` | Yes | Numerical value (INR) |
| `partyName` | `String` | No | Default `""` |
| `remarks` | `String` | No | Default `""` |
| `category` | `String` | No | Default `""` |
| `paymentMode`| `String` | No | Default `"Cash"` |
| `files` | `[String]` | No | URLs/paths of attached receipt images or PDFs |
| `timestamps` | `Boolean` | Yes | Auto `createdAt`, `updatedAt` |
| *Indexes* | | | `{ businessId: 1, date: -1 }`, `{ businessId: 1, type: 1 }` |

### `Business` (`Backend/MongoDb/models/userModels/Business.js`)
- `userId`: `ObjectId (ref: 'User')`
- `name`: `String` (Required)
- `businessId`: `String` (Unique display code)
- `category`: `String`

### `User` (`Backend/MongoDb/models/userModels/User.js`)
- `name`, `email`, `password` (hashed)
- `businesses`: Array of `ObjectId (ref: 'Business')` or embedded references

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
| `/api/auth/login` | POST | `auth.login` | Authenticate with email or business_id |
| `/api/auth/signup` | POST | `auth.signup` | Register new user |
| `/api/auth/verify` | GET | `auth.verifyToken` | Verify JWT & return active businesses |
| `/api/business` | POST | `business.createBusiness` | Create new business profile |
| `/api/user/transactions` | GET | `transaction.getAll` | Fetch all transactions for active business |
| `/api/user/transactions` | POST | `transaction.createTransaction` | Create single transaction |
| `/api/user/transactions/bulk` | POST | `transaction.createBulkTransactions` | Bulk insert array of transactions |
| `/api/user/transactions/:id` | PUT | `transaction.updateTransaction` | Update transaction by ID |
| `/api/user/transactions/delete` | POST | `transaction.deleteTransactions` | Batch delete transactions by array of IDs |
| `/api/user/parties` | GET/POST/PUT/DEL | `party.controller` | Party counterparty CRUD |
| `/api/user/category` | GET/POST/PUT/DEL | `category.controller` | Category CRUD |
| `/api/user/paymentMode` | GET/POST/PUT/DEL | `paymentMode.controller` | Payment mode CRUD |
| `/api/user/loans` | GET/POST/PUT/DEL | `loan.controller` | Loan records CRUD |

---

## 5. Frontend State Management

### `AuthContext` (`Frontend/src/context/AuthContext.jsx`)
- State: `user`, `activeBusiness`, `businesses`, `loading`
- Actions: `login()`, `signup()`, `logout()`, `switchBusiness(businessId)`, `createBusiness(data)`
- Persistence: `localStorage.getItem('token')`, `localStorage.getItem('businessId')`

### `DataContext` (`Frontend/src/context/DataContext.jsx`)
- State: `transactions`, `parties`, `categories`, `paymentModes`, `loans`, `loading`, `error`
- Auto-sync: Triggers `fetchAllData()` on mount and when `activeBusiness?._id` changes.
- Transaction Actions:
  - `createTransaction(entry)`
  - `createBulkTransactions(list)`
  - `updateTransaction(id, data)`
  - `deleteTransactions(ids)`
  - `refreshData()`

---

## 6. Key Workflows & Features

### 1. Bulk Excel Import (`BulkEntryModal.jsx`)
- Triggered from header button: `<Header onOpenBulkImport={...} />`
- Parses `.xlsx` and `.xls` using `xlsx` library in-browser.
- Automatic fuzzy column header detection (Date, Type, Amount, Party, Category, Payment Mode, Remarks).
- Interactive mapping dropdowns, date normalization to `YYYY-MM-DD`, inline row editing, and validation.
- Sends batch payload to `POST /api/user/transactions/bulk` and updates `DataContext`.

### 2. PDF Report Generation with Charts (`ReportModal.jsx`)
- Triggered from header button: `<Header onOpenReport={...} />`
- Filterable by: Custom filename, date range (start/end), transaction types, payment modes.
- Visual Analytics: Live preview with `recharts` (distribution pie, payment mode bars, monthly trend lines, top categories).
- Export: Uses `jsPDF`, `jspdf-autotable`, and `html2canvas` to render high-resolution executive PDF reports with summary KPI cards, embedded chart images, and color-coded transaction tables.

### 3. Table UI & Scroll Behavior (`Table.jsx`)
- Fixed-height internal scrolling container (`max-h-[calc(100vh-380px)] min-h-[300px] overflow-y-auto`) so page header and action buttons stay visible.
- Sticky header (`thead.sticky.top-0`).
- Checkbox multi-select with persistent batch delete bar.
- File attachment badges with icon detection (`.pdf`, `.jpg`, `.xlsx`, etc.).

---

## 7. Developer Guidelines & Constraints

1. **Git Workflow**: Do not run Git commands (`git add`, `git commit`, `git push`, branch switching) unless explicitly asked.
2. **Minimal Changes**: Modify only the necessary files. Do not perform wide, unrequested refactors.
3. **Date Format**: Always use `"YYYY-MM-DD"` string format for all transaction dates.
4. **Transaction Types**: Always use strictly the enum values: `"Cash In"`, `"Cash Out"`, `"Credit"`, `"Debit"`.
5. **Multi-Business Context**: Any new database model or query touching business transactions must respect `businessId`.
6. **Testing Mode (Token Validation Bypassed)**: Strict JWT verification in `Backend/middleware/auth.js` and `Backend/controllers/auth.controller.js` (`verifyToken`) is bypassed for testing so operations never get blocked with 401 Invalid Token errors.
