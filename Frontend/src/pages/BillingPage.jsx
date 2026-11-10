import { useState, useContext, useMemo } from 'react';
import { 
  FiPlus, 
  FiSearch, 
  FiFileText, 
  FiDownload, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiDollarSign, 
  FiPercent, 
  FiFilter,
  FiArrowUpRight
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import InvoiceModal from '../components/modal/InvoiceModal';
import { formatCurrency } from '../utils/invoiceHelpers';
import { generateInvoicePDF } from '../utils/invoicePdfGenerator';

const BillingPage = () => {
  const { activeBusiness } = useContext(AuthContext);
  const { invoices = [], deleteInvoice, loading } = useContext(DataContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [taxFilter, setTaxFilter] = useState('All');

  // KPI Computations
  const stats = useMemo(() => {
    let totalBilled = 0;
    let totalTax = 0;
    let paidAmount = 0;
    let pendingCount = 0;
    let pendingAmount = 0;

    invoices.forEach(inv => {
      totalBilled += inv.grandTotal || 0;
      totalTax += inv.totalTax || 0;
      if (inv.status === 'Paid') {
        paidAmount += inv.grandTotal || 0;
      } else if (inv.status === 'Sent' || inv.status === 'Draft') {
        pendingCount += 1;
        pendingAmount += inv.grandTotal || 0;
      }
    });

    return {
      count: invoices.length,
      totalBilled,
      totalTax,
      paidAmount,
      pendingCount,
      pendingAmount
    };
  }, [invoices]);

  // Filtered list
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Search
      const searchMatch = !searchTerm.trim() || 
        inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerGSTIN?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status
      const statusMatch = statusFilter === 'All' || inv.status === statusFilter;

      // Tax type
      const taxMatch = taxFilter === 'All' || 
        (taxFilter === 'Inter-State' && inv.isInterState) ||
        (taxFilter === 'Intra-State' && !inv.isInterState);

      return searchMatch && statusMatch && taxMatch;
    });
  }, [invoices, searchTerm, statusFilter, taxFilter]);

  const handleCreateNew = () => {
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inv) => {
    setSelectedInvoice(inv);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = (inv) => {
    try {
      generateInvoicePDF(inv, true);
      toast.success(`Invoice ${inv.invoiceNumber} PDF downloaded!`, {
        toastId: `download-${inv._id}`,
        autoClose: 2500
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  const handleDelete = async (id, invNum) => {
    if (window.confirm(`Are you sure you want to delete invoice ${invNum}?`)) {
      try {
        await deleteInvoice(id);
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FiCheckCircle className="text-xs" /> Paid
          </span>
        );
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FiClock className="text-xs" /> Sent
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <FiXCircle className="text-xs" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
              Billing & Tax Invoices
            </h1>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-semibold">
              GST System
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Create professional GST-compliant invoices for <strong className="text-slate-700">{activeBusiness?.name || 'Active Ledger'}</strong> and download instant print-ready PDFs.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <FiPlus className="text-base" />
          <span>New Tax Invoice</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Invoices */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Invoices
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiFileText />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.count}</div>
          <div className="text-[11px] text-slate-500 mt-1">All recorded bills</div>
        </div>

        {/* Total Billed */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Billed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiDollarSign />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalBilled)}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {formatCurrency(stats.paidAmount)} collected
          </div>
        </div>

        {/* Total GST */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total GST Calculated
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiPercent />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalTax)}</div>
          <div className="text-[11px] text-slate-500 mt-1">CGST + SGST + IGST</div>
        </div>

        {/* Pending Receivables */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Outstanding / Unpaid
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiClock />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(stats.pendingAmount)}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            {stats.pendingCount} pending payment
          </div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <FiSearch className="absolute left-3 top-2.5 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice no, customer, GSTIN..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <FiFilter className="text-slate-400" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Paid">Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={taxFilter}
            onChange={(e) => setTaxFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
          >
            <option value="All">All Tax Types</option>
            <option value="Intra-State">Intra-State (CGST+SGST)</option>
            <option value="Inter-State">Inter-State (IGST)</option>
          </select>
        </div>

      </div>

      {/* Invoice List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-xs">
              <FiFileText />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Invoices Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {invoices.length === 0
                ? "You haven't created any invoices for this business yet. Create your first GST tax invoice to generate a PDF."
                : "No invoices matched your current search or status filter criteria."}
            </p>
            {invoices.length === 0 && (
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <FiPlus /> Create First Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Tax Type</th>
                  <th className="py-3 px-3 text-right">Taxable</th>
                  <th className="py-3 px-3 text-right">GST Tax</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {inv.invoiceDate}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      {inv.customerGSTIN && (
                        <div className="text-[10px] text-slate-400 font-mono">
                          GSTIN: {inv.customerGSTIN}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        inv.isInterState 
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {inv.isInterState ? 'IGST' : 'CGST+SGST'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{Number(inv.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      ₹{Number(inv.totalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(inv.grandTotal)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {getStatusBadge(inv.status)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDownloadPDF(inv)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100/80 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                          title="Download Tax Invoice PDF"
                        >
                          <FiDownload className="text-xs" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleEdit(inv)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Invoice"
                        >
                          <FiEdit2 className="text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv._id, inv.invoiceNumber)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Invoice"
                        >
                          <FiTrash2 className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal for Create / Edit */}
      <InvoiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedInvoice}
        onSaved={() => {
          // DataContext automatically updates state
        }}
      />

    </div>
  );
};

export default BillingPage;

