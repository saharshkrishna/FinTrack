import { useState } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiPlus, FiChevronDown } from 'react-icons/fi';
import PartyNameModal from './PartyModal';

const LoanReModal = ({ isOpen, onClose, onSubmit, loans = [] }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    loanId: '',
    loanTitle: '',
    loanAmount: '',
    interestRate: '',
    originalEMI: '',
    emiAmount: '',
    emiType: 'normal', // 'normal' or 'custom'
    partyName: '',
    remarks: '',
    paymentMode: 'Cash',
    type: 'LoanRe'
  });

  const [error, setError] = useState('');
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [parties, setParties] = useState([]);
  const [isLoanDropdownOpen, setIsLoanDropdownOpen] = useState(false);

  // When a loan is selected from dropdown
  const handleLoanSelect = (loan) => {
    setFormData(prev => ({
      ...prev,
      loanId: loan._id,
      loanTitle: loan.loanTitle,
      loanAmount: loan.loanAmount,
      interestRate: loan.interestRate,
      originalEMI: loan.emi,
      emiAmount: loan.emi,
      partyName: loan.partyName
    }));
    setIsLoanDropdownOpen(false);
  };

  // Handle EMI type change
  const handleEMITypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      emiType: type,
      emiAmount: type === 'normal' ? prev.originalEMI : prev.emiAmount
    }));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('0') && value.length > 1) {
      setError('Amount cannot start with zero.');
      return;
    }
    setError('');
    setFormData(prev => ({ ...prev, emiAmount: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.loanId || !formData.emiAmount) {
      setError('Please select a loan and enter EMI amount');
      return;
    }
    onSubmit(formData);
    onClose();
  };

  const handleAddPartyName = (partyData) => {
    setParties((prev) => [...prev, partyData.partyName]);
    setFormData((prev) => ({
      ...prev,
      partyName: partyData.partyName,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-40">
      <div className="bg-white w-1/2 h-full overflow-hidden">
        <div className="sticky top-0 bg-white z-10 p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Loan Reimbursement Entry</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Loan Selection Dropdown */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Select Loan <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsLoanDropdownOpen(!isLoanDropdownOpen)}
                className="w-full flex justify-between items-center p-2 border rounded-lg text-left"
              >
                {formData.loanTitle || "Select a loan"}
                <FiChevronDown className={`transition-transform ${isLoanDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLoanDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {loans.length > 0 ? (
                    loans.map((loan) => (
                      <div
                        key={loan._id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleLoanSelect(loan)}
                      >
                        <div className="font-medium">{loan.loanTitle}</div>
                        <div className="text-sm text-gray-600">
                          Amount: {loan.loanAmount} | EMI: {loan.emi}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-2 text-gray-500">No loans available</div>
                  )}
                </div>
              )}
            </div>

            {/* Display selected loan details */}
            {formData.loanId && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Loan Amount</label>
                    <div className="font-medium">{formData.loanAmount}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Interest Rate</label>
                    <div className="font-medium">{formData.interestRate}%</div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Original EMI</label>
                  <div className="font-medium">{formData.originalEMI}</div>
                </div>
              </div>
            )}

            {/* EMI Amount Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                EMI Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-4 mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="emiType"
                    value="normal"
                    checked={formData.emiType === 'normal'}
                    onChange={() => handleEMITypeChange('normal')}
                  />
                  <span className="ml-2">Normal EMI</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="emiType"
                    value="custom"
                    checked={formData.emiType === 'custom'}
                    onChange={() => handleEMITypeChange('custom')}
                  />
                  <span className="ml-2">Custom EMI</span>
                </label>
              </div>
              
              <input
                type="number"
                placeholder="Enter EMI amount"
                value={formData.emiAmount}
                onChange={handleAmountChange}
                className="w-full p-2 border rounded-lg"
                disabled={formData.emiType === 'normal'}
                required
              />
              {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Party Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.partyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => setIsPartyModalOpen(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Remarks</label>
              <input
                type="text"
                placeholder="Enter additional details"
                value={formData.remarks}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
              <select
                value={formData.paymentMode}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentMode: e.target.value }))}
                className="w-1/3 p-2 border rounded-lg"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
              >
                📎 Attach Receipt
              </button>
              <span className="text-sm text-gray-500">
                Attach payment receipt or document
              </span>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Submit Reimbursement
              </button>
            </div>
          </form>
        </div>
      </div>
      {isPartyModalOpen && (
        <PartyNameModal
          onClose={() => setIsPartyModalOpen(false)}
          onAdd={handleAddPartyName}
        />
      )}
    </div>
  );
};

LoanReModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
  loans: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    loanTitle: PropTypes.string.isRequired,
    loanAmount: PropTypes.string.isRequired,
    interestRate: PropTypes.string.isRequired,
    emi: PropTypes.string.isRequired,
    partyName: PropTypes.string.isRequired,
  }))
};

export default LoanReModal;