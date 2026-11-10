const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  description:   { type: String, required: true, trim: true },
  hsnSac:        { type: String, trim: true, default: '' },
  quantity:      { type: Number, required: true, min: 0 },
  unit:          { type: String, trim: true, default: 'Nos' },
  rate:          { type: Number, required: true, min: 0 },
  discount:      { type: Number, default: 0, min: 0 },
  discountType:  { type: String, enum: ['%', 'flat'], default: '%' },
  taxableValue:  { type: Number, default: 0 },
  gstRate:       { type: Number, enum: [0, 5, 12, 18, 28], default: 18 },
  cgstAmount:    { type: Number, default: 0 },
  sgstAmount:    { type: Number, default: 0 },
  igstAmount:    { type: Number, default: 0 },
  totalAmount:   { type: Number, default: 0 }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  businessId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  invoiceNumber:  { type: String, required: true, trim: true },
  invoiceDate:    { type: String, required: true }, // YYYY-MM-DD
  dueDate:        { type: String, default: '' },    // YYYY-MM-DD

  // Supplier (auto-filled from business profile)
  supplierName:      { type: String, trim: true, default: '' },
  supplierAddress:   { type: String, trim: true, default: '' },
  supplierGSTIN:     { type: String, trim: true, uppercase: true, default: '' },
  supplierState:     { type: String, trim: true, default: '' },
  supplierStateCode: { type: String, trim: true, default: '' },
  supplierPhone:     { type: String, trim: true, default: '' },
  supplierEmail:     { type: String, trim: true, default: '' },

  // Customer / Buyer
  customerName:      { type: String, required: true, trim: true },
  customerAddress:   { type: String, trim: true, default: '' },
  customerGSTIN:     { type: String, trim: true, uppercase: true, default: '' },
  customerState:     { type: String, trim: true, default: '' },
  customerStateCode: { type: String, trim: true, default: '' },
  customerPhone:     { type: String, trim: true, default: '' },
  customerEmail:     { type: String, trim: true, default: '' },

  // Place of supply determines IGST vs CGST+SGST
  placeOfSupply:     { type: String, trim: true, default: '' },
  placeOfSupplyCode: { type: String, trim: true, default: '' },
  isInterState:      { type: Boolean, default: false },

  // Line items
  items: [InvoiceItemSchema],

  // Computed totals
  subtotal:   { type: Number, default: 0 },
  totalCGST:  { type: Number, default: 0 },
  totalSGST:  { type: Number, default: 0 },
  totalIGST:  { type: Number, default: 0 },
  totalTax:   { type: Number, default: 0 },
  roundOff:   { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  amountInWords: { type: String, default: '' },

  // Additional info
  reverseCharge:      { type: Boolean, default: false },
  notes:              { type: String, trim: true, default: '' },
  termsAndConditions: { type: String, trim: true, default: '' },
  bankName:           { type: String, trim: true, default: '' },
  bankAccount:        { type: String, trim: true, default: '' },
  bankIFSC:           { type: String, trim: true, default: '' },
  bankBranch:         { type: String, trim: true, default: '' },

  // Status tracking
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Cancelled'], default: 'Draft' }
}, { timestamps: true });

// Compound index: unique invoice number per business
InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ businessId: 1, invoiceDate: -1 });
InvoiceSchema.index({ businessId: 1, status: 1 });

module.exports = mongoose.model('Invoice', InvoiceSchema);

