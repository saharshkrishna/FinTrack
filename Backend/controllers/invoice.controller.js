const Invoice = require('../MongoDb/models/userModels/Invoice');
const Business = require('../MongoDb/models/userModels/Business');

// Helper: Convert number to Indian Rupee words
const numberToWords = (num) => {
  if (num === 0) return 'Zero Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertBelow1000 = (n) => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertBelow1000(n % 100) : '');
  };

  // Indian numbering: Lakh (1,00,000), Crore (1,00,00,000)
  const parts = [];
  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = Math.floor(num % 1000);
  const paise = Math.round((num % 1) * 100);

  if (crore) parts.push(convertBelow1000(crore) + ' Crore');
  if (lakh) parts.push(convertBelow1000(lakh) + ' Lakh');
  if (thousand) parts.push(convertBelow1000(thousand) + ' Thousand');
  if (remainder) parts.push(convertBelow1000(remainder));

  let words = 'INR ' + parts.join(' ');
  if (paise > 0) {
    words += ' and ' + convertBelow1000(paise) + ' Paise';
  }
  return words + ' Only';
};

// Helper: Compute item-level and invoice-level totals
const computeInvoiceTotals = (items, isInterState) => {
  let subtotal = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0;

  const computedItems = items.map(item => {
    const grossValue = item.quantity * item.rate;
    let discountAmount = 0;
    if (item.discountType === '%') {
      discountAmount = grossValue * (item.discount || 0) / 100;
    } else {
      discountAmount = item.discount || 0;
    }
    const taxableValue = Math.max(0, grossValue - discountAmount);
    const taxAmount = taxableValue * (item.gstRate || 0) / 100;

    let cgstAmount = 0, sgstAmount = 0, igstAmount = 0;
    if (isInterState) {
      igstAmount = Math.round(taxAmount * 100) / 100;
    } else {
      cgstAmount = Math.round((taxAmount / 2) * 100) / 100;
      sgstAmount = Math.round((taxAmount / 2) * 100) / 100;
    }

    const totalAmount = Math.round((taxableValue + cgstAmount + sgstAmount + igstAmount) * 100) / 100;
    subtotal += taxableValue;
    totalCGST += cgstAmount;
    totalSGST += sgstAmount;
    totalIGST += igstAmount;

    return { ...item, taxableValue, cgstAmount, sgstAmount, igstAmount, totalAmount };
  });

  subtotal = Math.round(subtotal * 100) / 100;
  totalCGST = Math.round(totalCGST * 100) / 100;
  totalSGST = Math.round(totalSGST * 100) / 100;
  totalIGST = Math.round(totalIGST * 100) / 100;
  const totalTax = Math.round((totalCGST + totalSGST + totalIGST) * 100) / 100;
  const rawTotal = subtotal + totalTax;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;
  const amountInWords = numberToWords(grandTotal);

  return { computedItems, subtotal, totalCGST, totalSGST, totalIGST, totalTax, roundOff, grandTotal, amountInWords };
};

// Helper: Generate next invoice number for a business
const generateInvoiceNumber = async (businessId) => {
  const now = new Date();
  const fy = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
  const fyStr = `${fy}-${(fy + 1).toString().slice(-2)}`;
  const prefix = `INV-${fyStr}/`;

  const lastInvoice = await Invoice.findOne({
    businessId,
    invoiceNumber: { $regex: `^${prefix}` }
  }).sort({ invoiceNumber: -1 }).lean();

  let nextSeq = 1;
  if (lastInvoice) {
    const lastSeqStr = lastInvoice.invoiceNumber.replace(prefix, '');
    const lastSeq = parseInt(lastSeqStr, 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
};

// GET all invoices for a business
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ businessId: req.businessId })
      .sort({ invoiceDate: -1, createdAt: -1 })
      .lean();
    res.json({ invoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// GET single invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId }).lean();
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

// Helper: Normalize invoice status
const normalizeStatus = (status) => {
  if (!status || typeof status !== 'string') return undefined;
  const capitalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  const valid = ['Draft', 'Sent', 'Paid', 'Cancelled'];
  return valid.includes(capitalized) ? capitalized : undefined;
};

// POST create invoice
exports.createInvoice = async (req, res) => {
  try {
    const { items = [], isInterState = false, ...rest } = req.body;

    if (!items.length) {
      return res.status(400).json({ error: 'At least one line item is required' });
    }

    if (rest.status) {
      const normalized = normalizeStatus(rest.status);
      if (normalized) {
        rest.status = normalized;
      } else {
        return res.status(400).json({ error: `Invalid status '${rest.status}'. Valid statuses are: Draft, Sent, Paid, Cancelled` });
      }
    }

    // Auto-generate invoice number if not provided
    let invoiceNumber = rest.invoiceNumber;
    if (!invoiceNumber) {
      invoiceNumber = await generateInvoiceNumber(req.businessId);
    }

    // Auto-fill supplier details from business if not provided
    if (!rest.supplierName || !rest.supplierGSTIN) {
      const business = await Business.findById(req.businessId).lean();
      if (business) {
        rest.supplierName = rest.supplierName || business.name || '';
        rest.supplierGSTIN = rest.supplierGSTIN || business.gstNumber || '';
        rest.supplierAddress = rest.supplierAddress || business.address || '';
        rest.supplierState = rest.supplierState || business.state || '';
        rest.supplierStateCode = rest.supplierStateCode || business.stateCode || '';
        rest.supplierPhone = rest.supplierPhone || business.phone || '';
        rest.supplierEmail = rest.supplierEmail || business.email || '';
      }
    }

    const { computedItems, subtotal, totalCGST, totalSGST, totalIGST, totalTax, roundOff, grandTotal, amountInWords } =
      computeInvoiceTotals(items, isInterState);

    const invoice = new Invoice({
      ...rest,
      businessId: req.businessId,
      invoiceNumber,
      isInterState,
      items: computedItems,
      subtotal,
      totalCGST,
      totalSGST,
      totalIGST,
      totalTax,
      roundOff,
      grandTotal,
      amountInWords
    });

    await invoice.save();
    res.status(201).json({ invoice, message: 'Invoice created successfully' });
  } catch (error) {
    console.error('Error creating invoice:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Invoice number already exists for this business' });
    }
    res.status(500).json({ error: error.message || 'Failed to create invoice' });
  }
};

// PUT update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const existing = await Invoice.findOne({ _id: req.params.id, businessId: req.businessId });
    if (!existing) return res.status(404).json({ error: 'Invoice not found' });

    const { items, isInterState, ...rest } = req.body;
    const interState = isInterState !== undefined ? isInterState : existing.isInterState;

    if (rest.status) {
      const normalized = normalizeStatus(rest.status);
      if (normalized) {
        rest.status = normalized;
      } else {
        return res.status(400).json({ error: `Invalid status '${rest.status}'. Valid statuses are: Draft, Sent, Paid, Cancelled` });
      }
    }

    if (items && items.length > 0) {
      const { computedItems, subtotal, totalCGST, totalSGST, totalIGST, totalTax, roundOff, grandTotal, amountInWords } =
        computeInvoiceTotals(items, interState);
      rest.items = computedItems;
      rest.subtotal = subtotal;
      rest.totalCGST = totalCGST;
      rest.totalSGST = totalSGST;
      rest.totalIGST = totalIGST;
      rest.totalTax = totalTax;
      rest.roundOff = roundOff;
      rest.grandTotal = grandTotal;
      rest.amountInWords = amountInWords;
    }

    rest.isInterState = interState;
    Object.assign(existing, rest);
    await existing.save();

    res.json({ invoice: existing, message: 'Invoice updated successfully' });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: error.message || 'Failed to update invoice' });
  }
};

// DELETE invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, businessId: req.businessId });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

// GET next invoice number preview
exports.getNextInvoiceNumber = async (req, res) => {
  try {
    const invoiceNumber = await generateInvoiceNumber(req.businessId);
    res.json({ invoiceNumber });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    res.status(500).json({ error: 'Failed to generate invoice number' });
  }
};

