import { useState, useEffect, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  FiX, 
  FiPlus, 
  FiTrash2, 
  FiFileText, 
  FiDownload, 
  FiCheck, 
  FiAlertCircle,
  FiUser,
  FiBriefcase
} from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { 
  INDIAN_STATES, 
  GST_RATES, 
  UNITS, 
  INVOICE_STATUSES, 
  computeInvoiceTotals,
  formatCurrency 
} from '../../utils/invoiceHelpers';
import { generateInvoicePDF } from '../../utils/invoicePdfGenerator';
import { toast } from 'react-toastify';

const createEmptyItem = () => ({
  description: '',
  hsnSac: '',
  quantity: 1,
  unit: 'Nos',
  rate: 0,
  discount: 0,
  discountType: '%',
  gstRate: 18,
  taxableValue: 0,
  cgstAmount: 0,
  sgstAmount: 0,
  igstAmount: 0,
  totalAmount: 0
});

const InvoiceModal = ({ isOpen, onClose, initialData = null, onSaved = null }) => {
  const { activeBusiness } = useContext(AuthContext);
  const { parties, createInvoice, updateInvoice, getNextInvoiceNumber } = useContext(DataContext);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('Draft');
  const [reverseCharge, setReverseCharge] = useState(false);

  // Supplier info (from active business)
  const [supplierName, setSupplierName] = useState('');
  const [supplierGSTIN, setSupplierGSTIN] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierState, setSupplierState] = useState('');
  const [supplierStateCode, setSupplierStateCode] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');

  // Customer info
  const [customerName, setCustomerName] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerState, setCustomerState] = useState('');
  const [customerStateCode, setCustomerStateCode] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [placeOfSupply, setPlaceOfSupply] = useState('');

  // Inter-state toggle
  const [isInterState, setIsInterState] = useState(false);

  // Items
  const [items, setItems] = useState([createEmptyItem()]);

  // Bank & notes
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIFSC, setBankIFSC] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [notes, setNotes] = useState('Payment is due within 15 days of invoice date.');
  const [termsAndConditions, setTermsAndConditions] = useState('1. Goods/Services once sold will not be returned.\n2. Interest @ 18% p.a. will be charged after due date.');

  // Initialize or reset form
  useEffect(() => {
    if (!isOpen) return;
    setError('');

    if (initialData) {
      // Edit mode
      setInvoiceNumber(initialData.invoiceNumber || '');
      setInvoiceDate(initialData.invoiceDate || new Date().toISOString().slice(0, 10));
      setDueDate(initialData.dueDate || '');
      setStatus(initialData.status || 'Draft');
      setReverseCharge(Boolean(initialData.reverseCharge));

      setSupplierName(initialData.supplierName || '');
      setSupplierGSTIN(initialData.supplierGSTIN || '');
      setSupplierAddress(initialData.supplierAddress || '');
      setSupplierState(initialData.supplierState || '');
      setSupplierStateCode(initialData.supplierStateCode || '');
      setSupplierPhone(initialData.supplierPhone || '');
      setSupplierEmail(initialData.supplierEmail || '');

      setCustomerName(initialData.customerName || '');
      setCustomerGSTIN(initialData.customerGSTIN || '');
      setCustomerAddress(initialData.customerAddress || '');
      setCustomerState(initialData.customerState || '');
      setCustomerStateCode(initialData.customerStateCode || '');
      setCustomerPhone(initialData.customerPhone || '');
      setCustomerEmail(initialData.customerEmail || '');
      setPlaceOfSupply(initialData.placeOfSupply || '');
      setIsInterState(Boolean(initialData.isInterState));

      setItems(initialData.items && initialData.items.length > 0 ? initialData.items : [createEmptyItem()]);

      setBankName(initialData.bankName || '');
      setBankAccount(initialData.bankAccount || '');
      setBankIFSC(initialData.bankIFSC || '');
      setBankBranch(initialData.bankBranch || '');
      setNotes(initialData.notes || '');
      setTermsAndConditions(initialData.termsAndConditions || '');
    } else {
      // Create mode: prefill from active business
      const bizName = activeBusiness?.name || '';
      const bizGst = activeBusiness?.gstNumber || '';
      const bizAddr = activeBusiness?.address || '';
      const bizState = activeBusiness?.state || 'Maharashtra';
      const bizStateCode = activeBusiness?.stateCode || '27';
      const bizPhone = activeBusiness?.phone || '';
      const bizEmail = activeBusiness?.email || '';

      setSupplierName(bizName);
      setSupplierGSTIN(bizGst);
      setSupplierAddress(bizAddr);
      setSupplierState(bizState);
      setSupplierStateCode(bizStateCode);
      setSupplierPhone(bizPhone);
      setSupplierEmail(bizEmail);

      setCustomerName('');
      setCustomerGSTIN('');
      setCustomerAddress('');
      setCustomerState(bizState); // default same state
      setCustomerStateCode(bizStateCode);
      setCustomerPhone('');
      setCustomerEmail('');
      setPlaceOfSupply(bizState);
      setIsInterState(false);

      setItems([createEmptyItem()]);
      setStatus('Draft');
      setReverseCharge(false);

      // Fetch auto-generated invoice number
      getNextInvoiceNumber().then((num) => {
        setInvoiceNumber(num);
      });
    }
  }, [isOpen, initialData, activeBusiness, getNextInvoiceNumber]);

  // Handle party auto-complete
  const handleSelectParty = (partyId) => {
    if (!partyId) return;
    const party = parties.find(p => p._id === partyId || p.partyName === partyId);
    if (party) {
      setCustomerName(party.partyName || '');
      if (party.phone) setCustomerPhone(party.phone);
      if (party.email) setCustomerEmail(party.email);
      if (party.gstNumber) setCustomerGSTIN(party.gstNumber);
      if (party.address) setCustomerAddress(party.address);
      if (party.state) {
        setCustomerState(party.state);
        const stateObj = INDIAN_STATES.find(s => s.name.toLowerCase() === party.state.toLowerCase());
        if (stateObj) setCustomerStateCode(stateObj.code);
        setPlaceOfSupply(party.state);
        // Auto-check inter-state
        if (supplierState && party.state.toLowerCase() !== supplierState.toLowerCase()) {
          setIsInterState(true);
        } else {
          setIsInterState(false);
        }
      }
    }
  };

  // State selection change handler
  const handleCustomerStateChange = (stateName) => {
    setCustomerState(stateName);
    setPlaceOfSupply(stateName);
    const found = INDIAN_STATES.find(s => s.name === stateName);
    if (found) {
      setCustomerStateCode(found.code);
    }
    // Auto-detect inter-state tax if supplier state is defined
    if (supplierState && stateName && supplierState.toLowerCase() !== stateName.toLowerCase()) {
      setIsInterState(true);
    } else {
      setIsInterState(false);
    }
  };

  // Dynamic Item row handlers
  const handleItemChange = (index, field, value) => {
    setItems((prevItems) => {
      const next = [...prevItems];
      let formattedVal = value;
      if (['quantity', 'rate', 'discount', 'gstRate'].includes(field)) {
        formattedVal = value === '' ? '' : Number(value);
      }
      next[index] = { ...next[index], [field]: formattedVal };
      return next;
    });
  };

  const handleAddItem = () => {
    setItems(prev => [...prev, createEmptyItem()]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Real-time calculated totals
  const calculated = useMemo(() => {
    return computeInvoiceTotals(items, isInterState);
  }, [items, isInterState]);

  // Submit form handler
  const handleSave = async (andDownload = false) => {
    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!invoiceNumber.trim()) {
      setError('Invoice number is required.');
      return;
    }
    if (!items.length || items.every(i => !i.description.trim())) {
      setError('Please add at least one item description.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const payload = {
        invoiceNumber,
        invoiceDate,
        dueDate,
        status,
        reverseCharge,
        isInterState,
        placeOfSupply: placeOfSupply || customerState,
        placeOfSupplyCode: customerStateCode,

        supplierName,
        supplierGSTIN,
        supplierAddress,
        supplierState,
        supplierStateCode,
        supplierPhone,
        supplierEmail,

        customerName,
        customerGSTIN,
        customerAddress,
        customerState,
        customerStateCode,
        customerPhone,
        customerEmail,

        items: calculated.computedItems,

        bankName,
        bankAccount,
        bankIFSC,
        bankBranch,
        notes,
        termsAndConditions
      };

      let savedInvoice = null;
      if (initialData?._id) {
        savedInvoice = await updateInvoice(initialData._id, payload);
      } else {
        savedInvoice = await createInvoice(payload);
      }

      if (andDownload && savedInvoice) {
        try {
          generateInvoicePDF(savedInvoice, true);
          toast.success(`Invoice ${savedInvoice.invoiceNumber} PDF downloaded!`);
        } catch (pdfErr) {
          console.error('PDF download error:', pdfErr);
          toast.warn('Invoice saved, but PDF download failed.');
        }
      }

      if (onSaved) onSaved(savedInvoice);
      onClose();
    } catch (err) {
      console.error('Invoice save failed:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <FiFileText className="text-xl" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {initialData ? 'Edit Tax Invoice' : 'Create Tax Invoice & GST Bill'}
              </h2>
              <p className="text-xs text-slate-500">
                Indian GST compliant with auto CGST/SGST and IGST split calculation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              aria-label="Close"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <FiAlertCircle className="text-base shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Invoice Metadata Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-50/60 border border-slate-200/80">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-2024-25/0001"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {INVOICE_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2 text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={reverseCharge}
                  onChange={(e) => setReverseCharge(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Reverse Charge</span>
              </label>
            </div>
          </div>

          {/* Section 2: Supplier (Bill From) & Customer (Bill To) 2-column */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Bill From (Supplier) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FiBriefcase className="text-blue-600" /> Bill From (Your Company)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">SUPPLIER</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Legal Name
                  </label>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    GSTIN
                  </label>
                  <input
                    type="text"
                    value={supplierGSTIN}
                    onChange={(e) => setSupplierGSTIN(e.target.value.toUpperCase())}
                    placeholder="27AAAAA0000A1Z5"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg uppercase font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    State
                  </label>
                  <select
                    value={supplierState}
                    onChange={(e) => {
                      setSupplierState(e.target.value);
                      const s = INDIAN_STATES.find(st => st.name === e.target.value);
                      if (s) setSupplierStateCode(s.code);
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s.code} value={s.name}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    placeholder="Street, City, Pincode"
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Bill To (Customer) */}
            <div className="p-4 rounded-xl border border-blue-200/70 bg-blue-50/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <FiUser className="text-blue-600" /> Billed To (Customer Details) *
                </span>
                {parties?.length > 0 && (
                  <select
                    onChange={(e) => handleSelectParty(e.target.value)}
                    className="text-[11px] bg-white border border-blue-300 rounded px-2 py-0.5 text-blue-700 font-medium cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>Load Saved Party</option>
                    {parties.map(p => (
                      <option key={p._id} value={p._id}>{p.partyName}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Acme Corporation Ltd."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Customer GSTIN
                  </label>
                  <input
                    type="text"
                    value={customerGSTIN}
                    onChange={(e) => setCustomerGSTIN(e.target.value.toUpperCase())}
                    placeholder="Optional for B2C"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg uppercase font-mono text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Place of Supply (State)
                  </label>
                  <select
                    value={customerState}
                    onChange={(e) => handleCustomerStateChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(s => (
                      <option key={s.code} value={s.name}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Customer Address
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="Office / Billing address"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="accounts@client.com"
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>

              {/* Inter-state Tax Notice */}
              <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-medium">
                  Tax Type: <strong className={isInterState ? "text-purple-700" : "text-blue-700"}>
                    {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST + SGST)'}
                  </strong>
                </span>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-900">
                  <input
                    type="checkbox"
                    checked={isInterState}
                    onChange={(e) => setIsInterState(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                  />
                  <span>Force Inter-State (IGST)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Line Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <div className="p-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Line Items ({items.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                <FiPlus className="text-sm" /> Add Item Row
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-2.5 px-2 text-center w-8">#</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Item / Service Description *</th>
                    <th className="py-2.5 px-2 w-24">HSN/SAC</th>
                    <th className="py-2.5 px-2 w-16 text-center">Qty</th>
                    <th className="py-2.5 px-2 w-20">Unit</th>
                    <th className="py-2.5 px-2 w-24 text-right">Rate (₹)</th>
                    <th className="py-2.5 px-2 w-20 text-center">Disc (%)</th>
                    <th className="py-2.5 px-2 w-20 text-center">GST %</th>
                    <th className="py-2.5 px-3 w-28 text-right">Taxable</th>
                    <th className="py-2.5 px-3 w-28 text-right">Total (₹)</th>
                    <th className="py-2.5 px-2 text-center w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => {
                    const rowComp = calculated.computedItems[idx] || item;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-2 text-center text-slate-400 font-mono">
                          {idx + 1}
                        </td>

                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                            placeholder="Consulting services / Product name"
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-2 px-2">
                          <input
                            type="text"
                            value={item.hsnSac}
                            onChange={(e) => handleItemChange(idx, 'hsnSac', e.target.value)}
                            placeholder="998311"
                            className="w-full px-2 py-1.5 border border-slate-200 rounded font-mono text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-center text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-2 px-2">
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-full px-1 py-1.5 border border-slate-200 rounded text-xs bg-white"
                          >
                            {UNITS.map(u => (
                              <option key={u} value={u}>{u}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.rate}
                            onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded text-right font-mono text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-2 px-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount}
                            onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                            placeholder="0"
                            className="w-full px-1.5 py-1.5 border border-slate-200 rounded text-center font-mono text-xs focus:ring-1 focus:ring-blue-500"
                          />
                        </td>

                        <td className="py-2 px-2">
                          <select
                            value={item.gstRate}
                            onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                            className="w-full px-1.5 py-1.5 border border-slate-200 rounded font-semibold text-xs bg-white"
                          >
                            {GST_RATES.map(r => (
                              <option key={r} value={r}>{r}%</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-2 px-3 text-right font-mono text-slate-700">
                          ₹{Number(rowComp.taxableValue || 0).toFixed(2)}
                        </td>

                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ₹{Number(rowComp.totalAmount || 0).toFixed(2)}
                        </td>

                        <td className="py-2 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={items.length <= 1}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              items.length <= 1
                                ? 'text-slate-300 cursor-not-allowed'
                                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            }`}
                            title="Remove row"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Totals & Tax Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            
            {/* Left Column: Bank details & terms */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                  Bank Details for Invoice
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Bank Name (HDFC, SBI...)"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  />
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Account Number"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono text-xs"
                  />
                  <input
                    type="text"
                    value={bankIFSC}
                    onChange={(e) => setBankIFSC(e.target.value.toUpperCase())}
                    placeholder="IFSC Code"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded font-mono uppercase text-xs"
                  />
                  <input
                    type="text"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    placeholder="Branch Name"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows="2"
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Right Column: Live Computed Totals Card */}
            <div className="p-5 rounded-xl border border-slate-300 bg-slate-900 text-white shadow-lg space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Invoice Summary
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                  {isInterState ? 'IGST Applicable' : 'CGST + SGST Applicable'}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono">{formatCurrency(calculated.subtotal)}</span>
                </div>

                {isInterState ? (
                  <div className="flex justify-between text-purple-300">
                    <span>Total IGST:</span>
                    <span className="font-mono">{formatCurrency(calculated.totalIGST)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between text-blue-300">
                      <span>Total CGST:</span>
                      <span className="font-mono">{formatCurrency(calculated.totalCGST)}</span>
                    </div>
                    <div className="flex justify-between text-blue-300">
                      <span>Total SGST:</span>
                      <span className="font-mono">{formatCurrency(calculated.totalSGST)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Total Tax:</span>
                  <span className="font-mono">{formatCurrency(calculated.totalTax)}</span>
                </div>

                {calculated.roundOff !== 0 && (
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Round Off:</span>
                    <span className="font-mono">₹{calculated.roundOff > 0 ? `+${calculated.roundOff}` : calculated.roundOff}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-bold block text-white">Grand Total</span>
                  <span className="text-[10px] text-slate-400">Inclusive of all taxes</span>
                </div>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatCurrency(calculated.grandTotal)}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(false)}
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <FiCheck className="text-sm" />
              <span>{loading ? 'Saving...' : 'Save Invoice'}</span>
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSave(true)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <FiDownload className="text-sm" />
              <span>{loading ? 'Generating...' : 'Save & Download PDF'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

InvoiceModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onSaved: PropTypes.func
};

export default InvoiceModal;

