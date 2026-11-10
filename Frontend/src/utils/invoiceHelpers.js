// Indian states with codes for GST
export const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' },
  { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' },
  { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' },
  { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' },
  { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' },
  { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' },
  { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' },
  { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' },
  { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' },
  { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' },
  { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' },
  { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' },
  { code: '24', name: 'Gujarat' },
  { code: '26', name: 'Dadra & Nagar Haveli and Daman & Diu' },
  { code: '27', name: 'Maharashtra' },
  { code: '28', name: 'Andhra Pradesh (Old)' },
  { code: '29', name: 'Karnataka' },
  { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' },
  { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' },
  { code: '34', name: 'Puducherry' },
  { code: '35', name: 'Andaman & Nicobar Islands' },
  { code: '36', name: 'Telangana' },
  { code: '37', name: 'Andhra Pradesh' },
  { code: '38', name: 'Ladakh' },
];

export const GST_RATES = [0, 5, 12, 18, 28];

export const UNITS = ['Nos', 'Pcs', 'Kgs', 'Gms', 'Ltrs', 'Mtrs', 'Sq.Ft', 'Sq.Mtrs', 'Box', 'Set', 'Pair', 'Hrs', 'Days'];

export const INVOICE_STATUSES = ['Draft', 'Sent', 'Paid', 'Cancelled'];

// Compute item-level tax (mirrors backend logic)
export const computeItemTotals = (item, isInterState) => {
  const grossValue = (item.quantity || 0) * (item.rate || 0);
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
  return { taxableValue, cgstAmount, sgstAmount, igstAmount, totalAmount };
};

// Compute full invoice totals from items
export const computeInvoiceTotals = (items, isInterState) => {
  let subtotal = 0, totalCGST = 0, totalSGST = 0, totalIGST = 0;

  const computedItems = items.map(item => {
    const computed = computeItemTotals(item, isInterState);
    subtotal += computed.taxableValue;
    totalCGST += computed.cgstAmount;
    totalSGST += computed.sgstAmount;
    totalIGST += computed.igstAmount;
    return { ...item, ...computed };
  });

  subtotal = Math.round(subtotal * 100) / 100;
  totalCGST = Math.round(totalCGST * 100) / 100;
  totalSGST = Math.round(totalSGST * 100) / 100;
  totalIGST = Math.round(totalIGST * 100) / 100;
  const totalTax = Math.round((totalCGST + totalSGST + totalIGST) * 100) / 100;
  const rawTotal = subtotal + totalTax;
  const grandTotal = Math.round(rawTotal);
  const roundOff = Math.round((grandTotal - rawTotal) * 100) / 100;

  return { computedItems, subtotal, totalCGST, totalSGST, totalIGST, totalTax, roundOff, grandTotal };
};

// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount || 0);
};

