import { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { 
  FiX, 
  FiPlus, 
  FiCalendar, 
  FiUser, 
  FiPercent, 
  FiFileText, 
  FiPaperclip, 
  FiTrash2, 
  FiCheck,
  FiAlertCircle,
  FiBriefcase 
} from 'react-icons/fi';
import PartyNameModal from './PartyModal';
import { DataContext } from '../../context/DataContext';

const LoanModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    loanTitle: '',
    loanAmount: '',
    dailyInterest: '',
    reimbursementPlan: 'no',
    loanIssuedBy: '',
    interestRate: '',
    loanTerm: '', // in months
    emi: '',
    totalClosingAmount: '',
    emiDate: '',
    partyName: '',
    remarks: '',
    paymentMode: 'Cash',
    type: 'Loan'
  });

  const [error, setError] = useState('');
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const { parties } = useContext(DataContext);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Calculate EMI and total closing amount when amount, interest rate, or loan term changes
  useEffect(() => {
    if (formData.reimbursementPlan === 'yes' && formData.loanAmount && formData.interestRate && formData.loanTerm) {
      const principal = parseFloat(formData.loanAmount);
      const ratePerMonth = parseFloat(formData.interestRate) / (12 * 100);
      const numberOfPayments = parseFloat(formData.loanTerm);

      if (principal > 0 && ratePerMonth > 0 && numberOfPayments > 0) {
        // EMI calculation
        const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, numberOfPayments)) /
                   (Math.pow(1 + ratePerMonth, numberOfPayments) - 1);

        const totalInterest = emi * numberOfPayments - principal;
        const totalClosing = principal + totalInterest;

        // Auto first EMI date (1 month after loan date)
        const d = new Date(formData.date || new Date());
        d.setMonth(d.getMonth() + 1);
        const firstEmiDate = d.toISOString().split('T')[0];

        setFormData(prev => ({
          ...prev,
          emi: emi.toFixed(2),
          totalClosingAmount: totalClosing.toFixed(2),
          emiDate: firstEmiDate
        }));
      }
    }
  }, [formData.loanAmount, formData.interestRate, formData.loanTerm, formData.reimbursementPlan, formData.date]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('0') && value.length > 1 && !value.startsWith('0.')) {
      setError('Amount cannot start with zero.');
      return;
    }
    setError('');
    setFormData(prev => ({ ...prev, loanAmount: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.loanTitle.trim()) {
      setError('Loan title is required.');
      return;
    }

    const principal = parseFloat(formData.loanAmount);
    if (!principal || principal <= 0) {
      setError('Please enter a valid loan amount greater than zero.');
      return;
    }

    const loanEntry = {
      ...formData,
      loanAmount: principal,
      files: files.map(file => file.name),
      createdAt: new Date().toISOString()
    };

    if (onSubmit) {
      await onSubmit(loanEntry);
    }
    onClose();
  };

  const handleAddParty = (newParty) => {
    setFormData(prev => ({ ...prev, partyName: newParty }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center shadow-2xs">
              <FiBriefcase className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  New Loan Entry
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Financing
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Register a new loan or borrowing with interest schedule
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar text-xs">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <FiAlertCircle className="shrink-0 text-sm" />
              <span>{error}</span>
            </div>
          )}

          {/* Date & Loan Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Loan Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiFileText className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <input
                  type="text"
                  required
                  placeholder="e.g. HDFC Machinery Loan, Working Capital"
                  value={formData.loanTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, loanTitle: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Loan Amount & Daily Interest */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Principal Amount (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 500000"
                  value={formData.loanAmount}
                  onChange={handleAmountChange}
                  className="w-full pl-8 pr-3 py-2 font-mono border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Daily Interest Rate (%) <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FiPercent className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 0.05"
                  value={formData.dailyInterest}
                  onChange={(e) => setFormData(prev => ({ ...prev, dailyInterest: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Reimbursement Plan Switch */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  EMI & Reimbursement Plan
                </span>
                <span className="text-[11px] text-slate-500">
                  Does this loan have a structured monthly installment schedule?
                </span>
              </div>
              <div className="flex p-0.5 bg-white border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reimbursementPlan: 'yes' }))}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    formData.reimbursementPlan === 'yes'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, reimbursementPlan: 'no' }))}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    formData.reimbursementPlan === 'no'
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {formData.reimbursementPlan === 'yes' && (
              <div className="space-y-3 pt-2 border-t border-slate-200/80 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Annual Interest Rate (%) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 10.5"
                      value={formData.interestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tenure (Months) *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 24"
                      value={formData.loanTerm}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanTerm: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {formData.emi && (
                  <div className="grid grid-cols-3 gap-2 p-2.5 bg-white rounded-lg border border-indigo-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Monthly EMI</span>
                      <strong className="text-indigo-700 font-mono text-xs">₹{formData.emi}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Payable</span>
                      <strong className="text-slate-800 font-mono text-xs">₹{formData.totalClosingAmount}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">First EMI Date</span>
                      <strong className="text-slate-800 font-mono text-xs">{formData.emiDate}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Party & Issuer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Lender / Party Contact
                </label>
                <button
                  type="button"
                  onClick={() => setIsPartyModalOpen(true)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FiPlus className="text-xs" />
                  <span>New Contact</span>
                </button>
              </div>
              <div className="relative">
                <FiUser className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <select
                  value={formData.partyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                >
                  <option value="">Select lender contact</option>
                  {parties?.map((p, idx) => (
                    <option key={p._id || idx} value={p.partyName}>
                      {p.partyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Loan Issued By / Institution
              </label>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="e.g. State Bank of India, Bajaj Finserv"
                  value={formData.loanIssuedBy}
                  onChange={(e) => setFormData(prev => ({ ...prev, loanIssuedBy: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remarks & Terms <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Sanction letter reference, collateral pledged, repayment account"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Attachments */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Loan Agreement & Sanction Letter
              </label>
              <input
                type="file"
                id="loanFileInput"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <button
                type="button"
                onClick={() => document.getElementById("loanFileInput")?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <FiPaperclip className="text-xs" />
                <span>Attach Docs</span>
              </button>
            </div>

            {files.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs shadow-2xs"
                  >
                    <span className="truncate max-w-[160px] text-slate-700">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove file"
                    >
                      <FiTrash2 className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic">
                No files attached. Supports PDF sanction letters, agreements, repayment schedules.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <FiCheck className="text-sm" />
              <span>Save Loan Entry</span>
            </button>
          </div>
        </form>
      </div>

      {isPartyModalOpen && (
        <PartyNameModal
          onClose={() => setIsPartyModalOpen(false)}
          onAddParty={handleAddParty}
        />
      )}
    </div>
  );
};

LoanModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default LoanModal;
