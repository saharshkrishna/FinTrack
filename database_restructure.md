# Database Restructure: Multi-Business Support

## Overview

This document defines all schema modifications required to upgrade the existing single-business MongoDB database into a **multi-tenant architecture** where multiple businesses can be managed independently within a single MongoDB cluster.

---

## Architecture Decision

**Approach: Shared Collections with `businessId` field**

All collections remain unified. Each document is scoped to a business via a `businessId` reference field. Uniqueness constraints that were previously global (e.g. `partyName`, `category`) are now enforced per-business using compound indexes.

---

## Summary of Changes

| Schema | Change |
|---|---|
| `Business` | **New collection** — root entity for all businesses |
| `User` | Added `businesses[]` array referencing owned businesses |
| `Transaction` | Added `businessId` (required, indexed) |
| `Party` | Added `businessId`; `partyName` unique per business (not globally) |
| `Category` | Added `businessId`; `category` unique per business |
| `PaymentMode` | Added `businessId`; `paymentMode` unique per business |
| `Loan` | Added `businessId` (required, indexed) |
| `LoanRe` | Added `businessId` (required, indexed) |

---

## Schemas

### 1. `Business.js` *(New)*

Root entity. All other collections reference this.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const BusinessSchema = new Schema({
  name:        { type: String, required: true, trim: true },
  owner:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  currency:    { type: String, default: 'INR' },
  createdAt:   { type: Date, default: Date.now }
});

export default mongoose.model('Business', BusinessSchema);
```

---

### 2. `User.js`

Added `businesses[]` — an array of business references owned/accessible by the user.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  name:       { type: String, required: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },  // hashed via bcrypt
  businesses: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
  createdAt:  { type: Date, default: Date.now }
});

export default mongoose.model('User', UserSchema);
```

---

### 3. `Transaction.js`

Added `businessId`. Compound indexes added for `date` and `type` queries scoped per business.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const TransactionSchema = new Schema({
  businessId:  { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  type:        { type: String, required: true, enum: ['Cash In', 'Cash Out', 'Credit', 'Debit'] },
  date:        { type: String, required: true },  // format: "YYYY-MM-DD"
  amount:      { type: Number, required: true },
  partyName:   { type: String, default: '' },
  remarks:     { type: String, default: '' },
  category:    { type: String, default: '' },
  paymentMode: { type: String, default: 'Cash' },
  files:       [{ type: String }]
}, { timestamps: true });

TransactionSchema.index({ businessId: 1, date: -1 });
TransactionSchema.index({ businessId: 1, type: 1 });

export default mongoose.model('Transaction', TransactionSchema);
```

---

### 4. `Party.js`

Added `businessId`. Removed global `unique: true` on `partyName`. Uniqueness is now enforced per business via compound index.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PartySchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  partyName:  { type: String, required: true, trim: true },
  phone:      { type: String, default: '' },
  partyType:  { type: String, enum: ['Supplier', 'Customer'] }
});

// partyName unique within a business, not globally
PartySchema.index({ businessId: 1, partyName: 1 }, { unique: true });

export default mongoose.model('Party', PartySchema);
```

> ⚠️ **Breaking change:** Remove the old `unique: true` on `partyName`. The compound index above replaces it.

---

### 5. `Category.js`

Added `businessId`. `category` is now unique per business via compound index.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const CategorySchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  category:   { type: String, required: true }
});

CategorySchema.index({ businessId: 1, category: 1 }, { unique: true });

export default mongoose.model('Category', CategorySchema);
```

> ⚠️ **Breaking change:** Remove the old `unique: true` on `category`.

---

### 6. `PaymentMode.js`

Added `businessId`. `paymentMode` is now unique per business via compound index.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PaymentModeSchema = new Schema({
  businessId:  { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  paymentMode: { type: String, required: true }
});

PaymentModeSchema.index({ businessId: 1, paymentMode: 1 }, { unique: true });

export default mongoose.model('PaymentMode', PaymentModeSchema);
```

> ⚠️ **Breaking change:** Remove the old `unique: true` on `paymentMode`.

---

### 7. `Loan.js`

Added `businessId`. Compound index added for date-scoped queries per business.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const LoanSchema = new Schema({
  businessId:          { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  date:                { type: String, required: true },  // format: "YYYY-MM-DD"
  loanTitle:           { type: String, required: true },
  loanAmount:          { type: Number, required: true },
  interestRate:        { type: Number },
  loanTerm:            { type: Number },
  dailyInterestAmount: { type: Number },
  closingAmount:       { type: Number },
  dailyEMI:            { type: Number },
  emiDate:             { type: String },
  dueDate:             { type: String },
  reimbursementPlan:   { type: String, enum: ['yes', 'no'], default: 'no' },
  loanIssuedBy:        { type: String },
  partyName:           { type: String },
  remarks:             { type: String },
  paymentMode:         { type: String, default: 'Cash' },
  files:               [{ type: String }]
}, { timestamps: true });

LoanSchema.index({ businessId: 1, date: -1 });

export default mongoose.model('Loan', LoanSchema);
```

---

### 8. `LoanRe.js`

Added `businessId`. Compound indexes added for `loanId` and `date` queries scoped per business.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const LoanReSchema = new Schema({
  businessId:   { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  date:         { type: String, required: true },
  loanId:       { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
  loanTitle:    { type: String },
  loanAmount:   { type: Number },
  interestRate: { type: Number },
  originalEMI:  { type: Number },
  emiAmount:    { type: Number, required: true },
  emiType:      { type: String, enum: ['normal', 'custom'], default: 'normal' },
  partyName:    { type: String },
  remarks:      { type: String },
  paymentMode:  { type: String },
  type:         { type: String, default: 'LoanRe' }
}, { timestamps: true });

LoanReSchema.index({ businessId: 1, loanId: 1 });
LoanReSchema.index({ businessId: 1, date: -1 });

export default mongoose.model('LoanRe', LoanReSchema);
```

---

## Index Reference

| Collection | Index | Type |
|---|---|---|
| `Transaction` | `businessId + date` | Compound |
| `Transaction` | `businessId + type` | Compound |
| `Party` | `businessId + partyName` | Compound Unique |
| `Category` | `businessId + category` | Compound Unique |
| `PaymentMode` | `businessId + paymentMode` | Compound Unique |
| `Loan` | `businessId + date` | Compound |
| `LoanRe` | `businessId + loanId` | Compound |
| `LoanRe` | `businessId + date` | Compound |

---

## Migration Script

Run this **once** to assign all existing data to a default business before deploying the new schemas.

```js
import mongoose from 'mongoose';
import Business from './models/Business.js';
import User from './models/User.js';
import Transaction from './models/Transaction.js';
import Party from './models/Party.js';
import Category from './models/Category.js';
import PaymentMode from './models/PaymentMode.js';
import Loan from './models/Loan.js';
import LoanRe from './models/LoanRe.js';

await mongoose.connect('your_mongodb_uri');

// Step 1: Get your existing user
const existingUser = await User.findOne({});

// Step 2: Create a default business for existing data
const defaultBusiness = await Business.create({
  name: 'My Business',
  owner: existingUser._id,
  currency: 'INR'
});

// Step 3: Link business to user
await User.findByIdAndUpdate(existingUser._id, {
  $push: { businesses: defaultBusiness._id }
});

// Step 4: Stamp all existing documents with the new businessId
const businessId = defaultBusiness._id;

await Transaction.updateMany({}, { $set: { businessId } });
await Party.updateMany({},       { $set: { businessId } });
await Category.updateMany({},    { $set: { businessId } });
await PaymentMode.updateMany({}, { $set: { businessId } });
await Loan.updateMany({},        { $set: { businessId } });
await LoanRe.updateMany({},      { $set: { businessId } });

console.log('Migration complete. businessId:', businessId);
await mongoose.disconnect();
```

---

## Backend Query Rule

Every API route must scope queries to the active `businessId`. Store it in the JWT payload or session after login.

```js
// ✅ Correct — always filter by businessId
Transaction.find({ businessId: req.user.activeBusiness });

// ❌ Wrong — returns data across ALL businesses
Transaction.find({});
```

Middleware example to attach `activeBusiness` to every request:

```js
export const setActiveBusiness = async (req, res, next) => {
  const { businessId } = req.query || req.body || req.headers;
  if (!businessId) return res.status(400).json({ error: 'businessId is required' });
  req.activeBusiness = businessId;
  next();
};
```

---

## Breaking Changes Checklist

- [ ] Remove `unique: true` from `Party.partyName`
- [ ] Remove `unique: true` from `Category.category`
- [ ] Remove `unique: true` from `PaymentMode.paymentMode`
- [ ] Add `Business` model file
- [ ] Add `businesses[]` to `User` model
- [ ] Add `businessId` to all 6 remaining models
- [ ] Run migration script before deploying
- [ ] Update all backend routes to filter by `businessId`
- [ ] Store active `businessId` in JWT or session
