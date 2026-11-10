import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { FiX, FiUser, FiPhone, FiTag, FiCheck, FiAlertCircle } from "react-icons/fi";
import { DataContext } from "../../context/DataContext";

const PartyNameModal = ({ onClose, onAddParty }) => {
  const [partyName, setPartyName] = useState("");
  const [phone, setPhone] = useState("");
  const [partyType, setPartyType] = useState("Supplier");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { createParty } = useContext(DataContext);

  const handleAddParty = async (e) => {
    if (e) e.preventDefault();
    if (!partyName || partyName.trim() === "") {
      setError("Party name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const newParty = await createParty({
        partyName: partyName.trim(),
        phone: phone.trim() || "",
        partyType,
      });

      if (onAddParty) {
        onAddParty(newParty.partyName || partyName.trim());
      }

      setPartyName("");
      setPhone("");
      setPartyType("Supplier");
      onClose();
    } catch (err) {
      console.error("Error adding party:", err);
      if (err.response && (err.response.data.message === "Party already exists" || err.response.data.error?.includes("already exists"))) {
        setError("A party with this name already exists.");
      } else {
        setError(err.response?.data?.error || "Failed to add party. Please try again.");
      }
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
              <FiUser className="text-lg" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Add New Contact
              </h2>
              <p className="text-xs text-slate-500">
                Register a new supplier or customer party
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
        <form onSubmit={handleAddParty} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <FiAlertCircle className="shrink-0 text-sm" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Party Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-slate-400 text-sm" />
              <input
                type="text"
                required
                placeholder="e.g. Acme Corp, Rahul Sharma"
                value={partyName}
                onChange={(e) => {
                  setPartyName(e.target.value);
                  if (error) setError("");
                }}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-3 top-3 text-slate-400 text-sm" />
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs md:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Party Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPartyType("Supplier")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  partyType === "Supplier"
                    ? "bg-blue-50 border-blue-300 text-blue-700 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FiTag className="text-xs" />
                <span>Supplier</span>
              </button>
              <button
                type="button"
                onClick={() => setPartyType("Customer")}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  partyType === "Customer"
                    ? "bg-blue-50 border-blue-300 text-blue-700 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FiUser className="text-xs" />
                <span>Customer</span>
              </button>
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
              <span>{loading ? "Adding..." : "Add Party"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PartyNameModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAddParty: PropTypes.func.isRequired,
};

export default PartyNameModal;
