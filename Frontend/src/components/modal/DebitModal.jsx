import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { 
  FiX, 
  FiPlus, 
  FiArrowDownRight, 
  FiCalendar, 
  FiUser, 
  FiTag, 
  FiCreditCard, 
  FiPaperclip, 
  FiTrash2, 
  FiCheck,
  FiAlertCircle 
} from "react-icons/fi";
import { DataContext } from "../../context/DataContext";
import AddingModal from "./AddingModal";
import PartyNameModal from "./PartyModal";

// Safe expression evaluator without using direct eval
const evaluateExpression = (expr) => {
  if (!expr || typeof expr !== "string") return null;
  const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, "");
  if (!sanitized.trim()) return null;
  try {
    const result = new Function(`return (${sanitized})`)();
    if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
      return result;
    }
  } catch {
    return null;
  }
  return null;
};

const DebitModal = ({ onClose, type = "Debit", onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    type: initialData?.type || type,
    date: initialData?.date || new Date().toISOString().split("T")[0],
    amount: initialData?.amount || "",
    partyName: initialData?.partyName || "",
    remarks: initialData?.remarks || "",
    category: initialData?.category || "",
    paymentMode: initialData?.paymentMode || "Debit",
  });

  const [inputValue, setInputValue] = useState(
    initialData?.amount !== undefined ? String(initialData.amount) : ""
  );
  const [calculatedValue, setCalculatedValue] = useState(
    initialData?.amount !== undefined ? initialData.amount : ""
  );
  const [error, setError] = useState("");
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [addingModalType, setAddingModalType] = useState("");
  const { parties, categories, loading } = useContext(DataContext);
  const [files, setFiles] = useState([]);

  if (loading) return null;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const validInputRegex = /^[0-9+\-*/().\s]*$/;

    if (!validInputRegex.test(value)) {
      return;
    }

    setInputValue(value);
    setError("");

    if (/[+\-*/]$/.test(value)) {
      setCalculatedValue("");
      setFormData((prev) => ({ ...prev, amount: value }));
      return;
    }

    const result = evaluateExpression(value);
    if (result !== null) {
      setCalculatedValue(result);
      setFormData((prev) => ({ ...prev, amount: result }));
    } else {
      setCalculatedValue("");
      setFormData((prev) => ({ ...prev, amount: value }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prevFiles) => {
      const existingNames = prevFiles.map((f) => f.name);
      const filtered = selectedFiles.filter((f) => !existingNames.includes(f.name));
      return [...prevFiles, ...filtered];
    });
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputValue.startsWith("0") && inputValue.length > 1 && !inputValue.startsWith("0.")) {
      setError("Amount cannot start with zero.");
      return;
    }

    const finalAmount = calculatedValue !== "" ? calculatedValue : evaluateExpression(inputValue) || Number(inputValue);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError("Please enter a valid amount greater than zero.");
      return;
    }

    const entry = {
      id: initialData?._id || initialData?.id || Date.now(),
      ...formData,
      amount: finalAmount,
      files: files.map((file) => file.name),
    };

    if (onSubmit) {
      onSubmit(entry);
    }
    onClose();
  };

  const handleAddPartyName = (newParty) => {
    setFormData((prev) => ({ ...prev, partyName: newParty }));
  };

  const handleOpenModal = (t) => {
    setAddingModalType(t);
    setIsAddingModalOpen(true);
  };

  const handleAddSuccess = (newCategory) => {
    setFormData((prev) => ({ ...prev, category: newCategory }));
  };

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
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-600 flex items-center justify-center shadow-2xs">
              <FiArrowDownRight className="text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {initialData ? "Edit Debit Entry" : "Record Debit"}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Payable
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Record an amount you owe or payable debt to a counterparty
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

          {/* Date & Amount Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Debit Amount (₹) <span className="text-rose-500">*</span>
                </label>
                {calculatedValue !== "" && String(calculatedValue) !== inputValue && (
                  <span className="text-[11px] font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    = ₹{Number(calculatedValue).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-semibold">₹</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15000 or 5000 + 2000"
                  value={inputValue}
                  onChange={handleAmountChange}
                  className="w-full pl-8 pr-3 py-2 font-mono border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Party Name Row */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Creditor / Party Name <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsPartyModalOpen(true)}
                className="text-[11px] text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <FiPlus className="text-xs" />
                <span>New Contact</span>
              </button>
            </div>
            <div className="relative">
              <FiUser className="absolute left-3 top-2.5 text-slate-400 text-sm" />
              <select
                required
                value={formData.partyName}
                onChange={(e) => setFormData((prev) => ({ ...prev, partyName: e.target.value }))}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
              >
                <option value="">Select party contact</option>
                {parties?.map((party, index) => (
                  <option key={party._id || index} value={party.partyName}>
                    {party.partyName} {party.partyType ? `(${party.partyType})` : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Payment Mode 2-col */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => handleOpenModal("category")}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <FiPlus className="text-xs" />
                  <span>New Category</span>
                </button>
              </div>
              <div className="relative">
                <FiTag className="absolute left-3 top-2.5 text-slate-400 text-sm" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                >
                  <option value="">Select category (optional)</option>
                  {categories?.map((c) => (
                    <option key={c._id} value={c.category}>
                      {c.category}
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
                <input
                  type="text"
                  readOnly
                  value="Debit (Payable)"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs md:text-sm bg-slate-50 text-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Remarks / Debt Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Due to raw material supplier, payment promised by next month"
              value={formData.remarks}
              onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
            />
          </div>

          {/* File Attachments */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                Attached Documents & Proof
              </label>
              <input
                type="file"
                id="debitFileInput"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <button
                type="button"
                onClick={() => document.getElementById("debitFileInput")?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                <FiPaperclip className="text-xs" />
                <span>Attach Files</span>
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
                No attachments added. Supports invoices, contracts, receipts.
              </div>
            )}
          </div>

          {/* Footer inside form */}
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
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <FiCheck className="text-sm" />
              <span>{initialData ? "Update Debit" : "Save Debit"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Sub-modals */}
      {isPartyModalOpen && (
        <PartyNameModal
          onClose={() => setIsPartyModalOpen(false)}
          onAddParty={handleAddPartyName}
        />
      )}

      {isAddingModalOpen && (
        <AddingModal
          entryType={addingModalType}
          onClose={() => setIsAddingModalOpen(false)}
          onSuccess={handleAddSuccess}
        />
      )}
    </div>
  );
};

DebitModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  type: PropTypes.string,
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
};

export default DebitModal;
