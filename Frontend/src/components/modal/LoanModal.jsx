import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX, FiPlus } from 'react-icons/fi';
import PartyNameModal from './PartyModal';

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
  const [parties, setParties] = useState([]);
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles([...files, ...selectedFiles]);
    }
  }

  // Calculate EMI and total closing amount when amount, interest rate, or loan term changes
  useEffect(() => {
    if (formData.reimbursementPlan === 'yes' && formData.loanAmount && formData.interestRate && formData.loanTerm) {
      const principal = parseFloat(formData.loanAmount);
      const ratePerMonth = parseFloat(formData.interestRate) / (12 * 100);
      const numberOfPayments = parseFloat(formData.loanTerm);

      // EMI calculation
      const emi = (principal * ratePerMonth * Math.pow(1 + ratePerMonth, numberOfPayments)) /
                 (Math.pow(1 + ratePerMonth, numberOfPayments) - 1);

      // Total closing amount (principal + total interest)
      const totalInterest = emi * numberOfPayments - principal;
      const totalClosing = principal + totalInterest;

      setFormData(prev => ({
        ...prev,
        emi: emi.toFixed(2),
        totalClosingAmount: totalClosing.toFixed(2)
      }));
    }
  }, [formData.loanAmount, formData.interestRate, formData.loanTerm, formData.reimbursementPlan]);

  // Calculate EMI date (first payment date)
  useEffect(() => {
    if (formData.date) {
      const startDate = new Date(formData.date);
      const emiDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
      setFormData(prev => ({
        ...prev,
        emiDate: emiDate.toISOString().split('T')[0]
      }));
    }
  }, [formData.date]);

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('0') && value.length > 1) {
      setError('Amount cannot start with zero.');
      return;
    }
    setError('');
    setFormData(prev => ({ ...prev, loanAmount: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.loanTitle || !formData.loanAmount) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.reimbursementPlan === 'yes' && (!formData.interestRate || !formData.loanTerm)) {
      setError('For reimbursement plans, please fill in interest rate and loan term');
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
            <h2 className="text-xl font-semibold">New Loan Entry</h2>
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
                  className="w-3/4 p-2 border rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter loan title/description"
                value={formData.loanTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, loanTitle: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter loan amount"
                value={formData.loanAmount}
                onChange={handleAmountChange}
                className="w-full p-2 border rounded-lg"
                required
              />
              {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Daily Interest (%)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="Enter daily interest rate"
                value={formData.dailyInterest}
                onChange={(e) => setFormData(prev => ({ ...prev, dailyInterest: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reimbursement Plan
              </label>
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="reimbursementPlan"
                    value="yes"
                    checked={formData.reimbursementPlan === 'yes'}
                    onChange={() => setFormData(prev => ({ ...prev, reimbursementPlan: 'yes' }))}
                  />
                  <span className="ml-2">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio"
                    name="reimbursementPlan"
                    value="no"
                    checked={formData.reimbursementPlan === 'no'}
                    onChange={() => setFormData(prev => ({ ...prev, reimbursementPlan: 'no' }))}
                  />
                  <span className="ml-2">No</span>
                </label>
              </div>
            </div>

            {formData.reimbursementPlan === 'yes' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Interest Rate (% per year) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter annual interest rate"
                      value={formData.interestRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                      required={formData.reimbursementPlan === 'yes'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Loan Term (months) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter loan term in months"
                      value={formData.loanTerm}
                      onChange={(e) => setFormData(prev => ({ ...prev, loanTerm: e.target.value }))}
                      className="w-full p-2 border rounded-lg"
                      required={formData.reimbursementPlan === 'yes'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Monthly EMI
                    </label>
                    <input
                      type="text"
                      value={formData.emi}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Total Closing Amount
                    </label>
                    <input
                      type="text"
                      value={formData.totalClosingAmount}
                      className="w-full p-2 border rounded-lg bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date of First EMI
                  </label>
                  <input
                    type="date"
                    value={formData.emiDate}
                    className="w-full p-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Loan Issued By
              </label>
              <input
                type="text"
                placeholder="Enter issuer name"
                value={formData.loanIssuedBy}
                onChange={(e) => setFormData(prev => ({ ...prev, loanIssuedBy: e.target.value }))}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Party Name (Contact)</label>
              <div className="flex gap-2">
                <select
                  value={formData.partyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partyName: e.target.value }))}
                  className="w-1/3 p-2 border rounded-lg"
                >
                  <option value="">Search or Select</option>
                  {parties.map((party, index) => (
                    <option key={index} value={party}>
                      {party}
                    </option>
                  ))}
                </select>
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

            {/* File Upload & Save Button in One Row */}
<div className="flex justify-between items-center mt-4">
  
  {/* Attach Bills Section - Aligned Left */}
  <div className="flex items-center gap-3">
    <input
      type="file"
      id="fileInput"
      style={{ display: "none" }}
      onChange={handleFileChange}
      multiple
    />

    <button
      type="button"
      className="px-4 py-2 bg-blue-500 text-white rounded-lg shrink-0"
      onClick={() => document.getElementById("fileInput").click()}
    >
      📎 Attach Bills
    </button>

    {/* Show Number of Files Instead of Expanding Button */}
    {files.length > 0 && (
      <span className="text-sm text-gray-500 whitespace-nowrap">
        ({files.length} files selected)
      </span>
    )}
  </div>

  {/* Save Button - Aligned Right */}
  <div>
    <button
      type="submit"
      className="px-4 py-2 bg-green-600 text-white rounded-lg"
    >
      Save
    </button>
  </div>
</div>

{/* File List (Fixed Height to Prevent Button Movement) */}
<div className="mt-2 min-h-[40px]">
  {files.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
          <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span>
          <button
            onClick={() => handleRemoveFile(index)}
            className="text-sm text-red-500 hover:underline"
          >
            ❌
          </button>
        </div>
      ))}
    </div>
  )}
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

LoanModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isOpen: PropTypes.bool.isRequired,
};

export default LoanModal;