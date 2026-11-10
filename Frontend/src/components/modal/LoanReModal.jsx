import { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { 
  FiX, 
  FiPlus, 
  FiChevronDown, 
  FiCalendar, 
  FiUser, 
  FiCreditCard, 
  FiPaperclip, 
  FiTrash2, 
  FiCheck,
  FiAlertCircle,
  FiRefreshCw 
} from 'react-icons/fi';
import PartyNameModal from './PartyModal';
import { DataContext } from '../../context/DataContext';

const LoanReModal = ({ isOpen, onClose, onSubmit, loans: propLoans }) => {
  const { loans: contextLoans, paymentModes, parties = [] } = useContext(DataContext);
  const loans = propLoans && propLoans.length > 0 ? propLoans : contextLoans || [];

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    loanId: '',
    loanTitle: '',
    loanAmount: '',
    interestRate: '',
    originalEMI: '',
    emiAmount: '',
    emiType: 'normal',
    partyName: '',
    remarks: '',
    paymentMode: 'Cash',
    type: 'LoanRe'
  });

  const [error, setError] = useState('');
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isLoanDropdownOpen, setIsLoanDropdownOpen] = useState(false);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleLoanSelect = (loan) => {
    setFormData(prev => ({
      ...prev,
      loanId: loan._id || loan.id,
      loanTitle: loan.loanTitle || loan.remarks || 'Loan',
      loanAmount: loan.loanAmount || loan.amount || '',
      interestRate: loan.interestRate || '',
      originalEMI: loan.emi || loan.amount || '',
      emiAmount: loan.emi || loan.amount || '',
      partyName: loan.partyName || ''
    }));
    setIsLoanDropdownOpen(false);
    setError('');
  };

  const handleEMITypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      emiType: type,
      emiAmount: type === 'normal' ? prev.originalEMI : prev.emiAmount
    }));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('0') && value.length > 1 && !value.startsWith('0.')) {
      setError('Amount cannot start with zero.');
      return;
    }
    setError('');
    setFormData(prev => ({ ...prev, emiAmount: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.loanId) {
      setError('Please select an active loan to repay.');
      return;
    }

    const amount = parseFloat(formData.emiAmount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid repayment amount greater than zero.');
      return;
    }

    const repaymentEntry = {
      ...formData,
      amount: amount,
      files: files.map(f => f.name),
      createdAt: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(repaymentEntry);
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
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center shadow-2xs">
              <FiRefreshCw className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  Loan Repayment / EMI
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  Repayment
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Log a loan installment, scheduled EMI, or part-payment
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

          {/* Date & Loan Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Loan Dropdown */}
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Active Loan <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsLoanDropdownOpen(!isLoanDropdownOpen)}
                className="w-full flex justify-between items-center px-3 py-2 border border-slate-300 rounded-xl text-left bg-white text-xs md:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              >
                <span className="truncate">
                  {formData.loanTitle ? formData.loanTitle : <span className="text-slate-400">Choose a loan...</span>}
                </span>
                <FiChevronDown className={`text-slate-400 text-sm transition-transform shrink-0 ml-2 ${isLoanDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLoanDropdownOpen && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {loans && loans.length > 0 ? (
                    loans.map((loan) => (
                      <div
                        key={loan._id || loan.id}
                        className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                        onClick={() => handleLoanSelect(loan)}
                      >
                        <div className="font-semibold text-slate-900 text-xs">
                          {loan.loanTitle || loan.remarks || 'Loan Record'}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Principal: ₹{Number(loan.loanAmount || loan.amount || 0).toLocaleString('en-IN')}</span>
                          {loan.emi && <span>• EMI: ₹{Number(loan.emi).toLocaleString('en-IN')}</span>}
                          {loan.partyName && <span>• {loan.partyName}</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 text-xs">
                      No active loans found. Create a loan first.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Selected Loan Details Preview Card */}
          {formData.loanId && (
            <div className="p-3.5 bg-purple-50/40 border border-purple-200 rounded-xl grid grid-cols-3 gap-3 text-xs animate-fade-in">
              <div>
                <span className="text-slate-500 text-[11px] block">Total Principal</span>
                <span className="font-bold font-mono text-slate-900">
                  ₹{Number(formData.loanAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Interest Rate</span>
                <span className="font-bold font-mono text-purple-700">
                  {formData.interestRate ? `${formData.interestRate}%` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Scheduled EMI</span>
                <span className="font-bold font-mono text-emerald-700">
                  {formData.originalEMI ? `₹${Number(formData.originalEMI).toLocaleString('en-IN')}` : 'N/A'}
                </span>
              </div>
            </div>
          )}

          {/* Repayment Type & Amount */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">
                Installment Type
              </label>
              <div className="flex p-0.5 bg-white border border-slate-200 rounded-lg">
                <button
                  type="button"
                  onClick={() => handleEMITypeChange('normal')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    formData.emiType === 'normal'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Standard EMI
                </button>
                <button
                  type="button"
                  onClick={() => handleEMITypeChange('custom')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    formData.emiType === 'custom'
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Custom Amount
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount to Repay (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 15000"
                  value={formData.emiAmount}
                  onChange={handleAmountChange}
                  readOnly={formData.emiType === 'normal'}
                  className={`w-full pl-8 pr-3 py-2 font-mono border rounded-xl text-xs md:text-sm font-semibold transition-all ${
                    formData.emiType === 'normal'
                      ? 'bg-slate-100 border-slate-300 text-slate-700 cursor-not-allowed'
                      : 'bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Party & Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Paid To / Lender
                </label>
                <button
                  type="button"
                  onClick={() => setIsPartyModalOpen(true)}
                  className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
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
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
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
                Payment Channel
              </label>
              <div className="relative">
                <FiCreditCard className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <select
                  value={formData.paymentMode}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentMode: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
                >
                  <option value="Cash">Cash</option>
                  {paymentModes?.map((m) => (
                    <option key={m._id} value={m.paymentMode}>
                      {m.paymentMode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remarks & Transaction Ref <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. EMI installment #3, NEFT reference #82918239"
              value={formData.remarks}
              onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>

          {/* Attachments */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Payment Receipt / Bank Acknowledgment
              </label>
              <input
                type="file"
                id="loanReFileInput"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <button
                type="button"
                onClick={() => document.getElementById("loanReFileInput")?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <FiPaperclip className="text-xs" />
                <span>Attach Slip</span>
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
                No slips attached. Supports bank receipts, payment screenshots, NEFT confirmations.
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
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <FiCheck className="text-sm" />
              <span>Record Repayment</span>
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

LoanReModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loans: PropTypes.array,
};

export default LoanReModal;
