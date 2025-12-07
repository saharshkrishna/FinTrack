# FinTrack Multi-Business Backend Implementation Guide

## Overview
This guide provides complete implementation for a multi-business backend system where:
- One user can manage multiple businesses
- Each business is completely isolated (data cannot mix)
- All data is filtered by `userId` and `businessId`
- JWT authentication with secure access control

---

## Folder Structure
```
Backend/
├── MongoDb/
│   ├── models/
│   │   ├── User.js
│   │   ├── Business.js
│   │   ├── Transaction.js
│   │   ├── Category.js
│   │   ├── PaymentMode.js
│   │   ├── Party.js
│   │   ├── Loan.js
│   │   └── File.js
│   └── connect.js
├── controllers/
│   ├── authController.js
│   ├── businessController.js
│   ├── transactionController.js
│   ├── categoryController.js
│   ├── paymentModeController.js
│   ├── partyController.js
│   ├── loanController.js
│   └── fileController.js
├── routes/
│   ├── authRoutes.js
│   ├── businessRoutes.js
│   ├── transactionRoutes.js
│   ├── categoryRoutes.js
│   ├── paymentModeRoutes.js
│   ├── partyRoutes.js
│   ├── loanRoutes.js
│   └── fileRoutes.js
├── middleware/
│   ├── auth.js
│   └── businessAccess.js
└── index.js
```

---

## 1. MONGOOSE MODELS

### User Model (Backend/MongoDb/models/User.js)
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  businesses: [{
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business'
    },
    name: String,
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
```

### Business Model (Backend/MongoDb/models/Business.js)
```javascript
const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['retail', 'service', 'manufacturing', 'other']
  },
  gstNumber: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
businessSchema.index({ userId: 1 });

module.exports = mongoose.model('Business', businessSchema);
```

### Transaction Model (Backend/MongoDb/models/Transaction.js)
```javascript
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense', 'loan', 'repayment']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  paymentModeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentMode'
  },
  partyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Party'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
transactionSchema.index({ userId: 1, businessId: 1 });
transactionSchema.index({ userId: 1, businessId: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
```

### Category Model (Backend/MongoDb/models/Category.js)
```javascript
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  }
});

categorySchema.index({ userId: 1, businessId: 1 });

module.exports = mongoose.model('Category', categorySchema);
```

### PaymentMode Model (Backend/MongoDb/models/PaymentMode.js)
```javascript
const mongoose = require('mongoose');

const paymentModeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  }
});

paymentModeSchema.index({ userId: 1, businessId: 1 });

module.exports = mongoose.model('PaymentMode', paymentModeSchema);
```

### Party Model (Backend/MongoDb/models/Party.js)
```javascript
const mongoose = require('mongoose');

const partySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['vendor', 'customer']
  }
});

partySchema.index({ userId: 1, businessId: 1 });

module.exports = mongoose.model('Party', partySchema);
```

### Loan Model (Backend/MongoDb/models/Loan.js)
```javascript
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    default: 0,
    min: 0
  },
  dailyInterestAmount: {
    type: Number,
    default: 0
  },
  loanTerm: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  issuedBy: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

loanSchema.index({ userId: 1, businessId: 1 });

module.exports = mongoose.model('Loan', loanSchema);
```

### File Model (Backend/MongoDb/models/File.js)
```javascript
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

fileSchema.index({ userId: 1, businessId: 1 });

module.exports = mongoose.model('File', fileSchema);
```

---

## 2. MIDDLEWARE

### Auth Middleware (Backend/middleware/auth.js)
```javascript
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = auth;
```

### Business Access Middleware (Backend/middleware/businessAccess.js)
```javascript
const Business = require('../MongoDb/models/Business');

const businessAccess = async (req, res, next) => {
  try {
    const { businessId } = req.params.businessId ? req.params : req.body;
    
    if (!businessId) {
      return res.status(400).json({ error: 'Business ID required' });
    }

    // Verify the business belongs to the user
    const business = await Business.findOne({
      _id: businessId,
      userId: req.userId
    });

    if (!business) {
      return res.status(403).json({ error: 'Access denied to this business' });
    }

    req.businessId = businessId;
    req.business = business;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Business verification failed' });
  }
};

module.exports = businessAccess;
```

---

## CRITICAL: Due to character limits, this is Part 1 of the implementation guide.

The complete guide includes:
- ✅ All 8 Mongoose Models with proper indexing
- ✅ Authentication & Business Access Middleware
- ⏳ CRUD Controllers for all models (Part 2)
- ⏳ Express Routes for all models (Part 2)
- ⏳ Server setup with all routes (Part 2)

**Next Steps:**
1. Create each model file from the code above
2. Create middleware files
3. Request Part 2 for complete controllers and routes

**Key Features Implemented:**
- ✅ userId + businessId in ALL models
- ✅ Compound indexes for fast queries
- ✅ JWT authentication
- ✅ Business ownership verification
- ✅ Complete data isolation between businesses
- ✅ Scalable architecture
