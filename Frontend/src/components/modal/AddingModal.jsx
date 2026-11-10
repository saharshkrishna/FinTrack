import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { FiX, FiTag, FiCreditCard, FiCheck, FiAlertCircle } from "react-icons/fi";
import { DataContext } from "../../context/DataContext";

const AddEntryModal = ({ entryType, onClose, onSuccess }) => {
  const { createCategory, createPaymentMode } = useContext(DataContext);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isCategory = entryType === "category";
  const title = isCategory ? "Add New Category" : "Add Payment Mode";
  const subtitle = isCategory
    ? "Create a spending or revenue categorization"
    : "Add a payment channel (Cash, Bank, UPI, Card)";
  const placeholder = isCategory ? "e.g. Marketing, Office Supplies, Logistics" : "e.g. HDFC Bank, GPay, Credit Card";
  const Icon = isCategory ? FiTag : FiCreditCard;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!newValue.trim()) {
      setError("Please enter a name.");
      return;
    }

    setLoading(true);
    try {
      let created = null;
      if (isCategory) {
        created = await createCategory({ category: newValue.trim() });
      } else {
        created = await createPaymentMode({ paymentMode: newValue.trim() });
      }
      if (onSuccess) {
        onSuccess(created?.category || created?.paymentMode || newValue.trim());
      }
      setNewValue("");
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center shadow-2xs">
              <Icon className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {title}
              </h2>
              <p className="text-xs text-slate-500">
                {subtitle}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <FiAlertCircle className="shrink-0 text-sm" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {isCategory ? "Category Name" : "Payment Mode Name"} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Icon className="absolute left-3 top-3 text-slate-400 text-sm" />
              <input
                type="text"
                required
                placeholder={placeholder}
                value={newValue}
                onChange={(e) => {
                  setNewValue(e.target.value);
                  if (error) setError("");
                }}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <FiCheck className="text-sm" />
              <span>{loading ? "Adding..." : "Add"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddEntryModal.propTypes = {
  entryType: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default AddEntryModal;
