import { useEffect, useState, useRef, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import {
  FiX,
  FiEdit3,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiFileText,
  FiMessageSquare,
  FiPaperclip,
  FiExternalLink,
  FiDownload,
  FiClock,
  FiPlus,
  FiChevronRight,
  FiPercent,
  FiShield,
  FiBriefcase,
  FiRefreshCw,
  FiTrash2,
  FiDollarSign,
  FiCheck,
  FiSave,
  FiTrendingUp
} from "react-icons/fi";
import { DataContext } from "../../context/DataContext";
import { toast } from "react-toastify";

const getFileIcon = (fileName) => {
  if (!fileName) return "📎";
  const ext = fileName.split(".").pop().toLowerCase();
  if (["pdf"].includes(ext)) return "📄";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return "🖼️";
  if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
  if (["doc", "docx", "txt"].includes(ext)) return "📝";
  return "📎";
};

const getFileExtension = (fileName) => {
  if (!fileName) return "";
  return fileName.split(".").pop().toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  try {
    const date = new Date(ts);
    if (isNaN(date.getTime())) return ts;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return ts;
  }
};

const LoanEntryDetails = ({ isOpen, onClose, entry, onEdit }) => {
  const { deleteLoan, updateLoan } = useContext(DataContext) || {};
  const [isVisible, setIsVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingInline, setIsEditingInline] = useState(false);
  const [editForm, setEditForm] = useState({});
  const panelRef = useRef(null);

  // Synchronize edit form when entry changes
  useEffect(() => {
    if (entry) {
      setEditForm({
        loanTitle: entry.loanTitle || entry.title || "Business Loan",
        loanAmount: entry.loanAmount || entry.amount || "",
        interestRate: entry.interestRate || "",
        loanTerm: entry.loanTerm || "",
        emi: entry.emi || entry.dailyEMI || "",
        closingAmount: entry.closingAmount || entry.totalClosingAmount || "",
        date: entry.date || "",
        dueDate: entry.dueDate || entry.emiDate || "",
        partyName: entry.partyName || "",
        paymentMode: entry.paymentMode || "Cash",
        reimbursementPlan: entry.reimbursementPlan || "no",
        loanIssuedBy: entry.loanIssuedBy || "",
        remarks: entry.remarks || "",
      });
      setIsEditingInline(false);
      setShowDeleteConfirm(false);
    }
  }, [entry]);

  // Animate in
  useEffect(() => {
    if (isOpen && entry) {
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [isOpen, entry]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      setIsEditingInline(false);
      setShowDeleteConfirm(false);
      onClose();
    }, 280);
  }, [onClose]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else if (isEditingInline) {
          setIsEditingInline(false);
        } else {
          handleClose();
        }
      }
    };

    if (isOpen && entry) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, entry, showDeleteConfirm, isEditingInline, handleClose]);

  const handleDelete = async () => {
    if (!entry?._id) {
      toast.error("Loan ID not found");
      return;
    }
    try {
      setIsDeleting(true);
      if (deleteLoan) {
        await deleteLoan(entry._id);
      }
      handleClose();
    } catch (err) {
      console.error("Error deleting loan:", err);
      toast.error("Failed to delete loan");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveInline = async () => {
    try {
      const updatedData = {
        ...entry,
        ...editForm,
        loanAmount: Number(editForm.loanAmount) || entry.amount || 0,
        amount: Number(editForm.loanAmount) || entry.amount || 0,
        interestRate: Number(editForm.interestRate) || 0,
        loanTerm: Number(editForm.loanTerm) || 0,
        emi: Number(editForm.emi) || 0,
        closingAmount: Number(editForm.closingAmount) || 0,
      };

      if (entry._id && updateLoan) {
        await updateLoan(entry._id, updatedData);
      }
      if (onEdit) {
        onEdit(updatedData);
      }
      setIsEditingInline(false);
      toast.success("Loan updated successfully");
    } catch (err) {
      console.error("Error updating loan:", err);
      toast.error("Failed to save changes");
    }
  };

  if (!isOpen || !entry) return null;

  const rawAmount = entry.loanAmount ?? entry.amount ?? 0;
  const formattedAmount =
    typeof rawAmount === "number"
      ? rawAmount.toLocaleString("en-IN")
      : rawAmount;

  const filesArray = entry.files || [];
  const hasFiles = Array.isArray(filesArray) && filesArray.length > 0;
  const loanTitle = entry.loanTitle || entry.title || "Business Loan";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isVisible
            ? "bg-black/40 backdrop-blur-[2px]"
            : "bg-transparent pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Panel */}
      <div
        ref={panelRef}
        className={`fixed right-0 top-0 h-full w-full sm:w-[540px] md:w-[600px] z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Hero Header with Indigo/Violet Gradient ─── */}
        <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900 px-6 pt-5 pb-6 shrink-0 text-white shadow-md">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute -top-10 right-4 w-44 h-44 border border-white/30 rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-52 h-52 border border-white/20 rounded-full" />
          </div>

          <div className="relative z-10">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xs">
                  <FiDollarSign className="text-white text-lg" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-200 text-[11px] font-bold uppercase tracking-wider">
                      Loan Account
                    </span>
                    <span className="inline-flex items-center gap-1 bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      <FiCheck className="text-[10px]" />
                      Active
                    </span>
                  </div>
                  <h2 className="text-white text-base font-bold leading-tight truncate max-w-[280px]">
                    {loanTitle}
                  </h2>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/90 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Principal Amount & Date */}
            <div className="flex items-end justify-between pt-1">
              <div>
                <div className="text-indigo-200 text-xs font-medium mb-1">
                  Principal Loan Amount
                </div>
                <div className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
                  ₹{formattedAmount}
                </div>
              </div>
              <div className="text-white/80 text-xs font-medium flex items-center gap-1.5 bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <FiCalendar className="text-sm text-indigo-200" />
                <span>{formatDate(entry.date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto">
          {/* Quick Stats Grid */}
          <div className="p-6 pb-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Interest Rate */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80">
                <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-semibold mb-1">
                  <FiPercent className="text-xs" />
                  <span>Interest</span>
                </div>
                <div className="text-base font-bold text-slate-800">
                  {entry.interestRate ? `${entry.interestRate}%` : "0%"}
                </div>
                <div className="text-[10px] text-slate-400">per annum</div>
              </div>

              {/* Tenor / Term */}
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100/80">
                <div className="flex items-center gap-1.5 text-purple-600 text-xs font-semibold mb-1">
                  <FiClock className="text-xs" />
                  <span>Tenor</span>
                </div>
                <div className="text-base font-bold text-slate-800">
                  {entry.loanTerm ? `${entry.loanTerm} mo` : "—"}
                </div>
                <div className="text-[10px] text-slate-400">duration</div>
              </div>

              {/* Monthly EMI */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100/80">
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold mb-1">
                  <FiTrendingUp className="text-xs" />
                  <span>Monthly EMI</span>
                </div>
                <div className="text-base font-bold text-slate-800 truncate">
                  {entry.emi || entry.dailyEMI
                    ? `₹${Number(entry.emi || entry.dailyEMI).toLocaleString("en-IN")}`
                    : "—"}
                </div>
                <div className="text-[10px] text-slate-400">installment</div>
              </div>

              {/* Total Payable / Closing */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100/80">
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-semibold mb-1">
                  <FiShield className="text-xs" />
                  <span>Total Pay</span>
                </div>
                <div className="text-base font-bold text-slate-800 truncate">
                  {entry.closingAmount || entry.totalClosingAmount
                    ? `₹${Number(entry.closingAmount || entry.totalClosingAmount).toLocaleString("en-IN")}`
                    : `₹${formattedAmount}`}
                </div>
                <div className="text-[10px] text-slate-400">principal + int</div>
              </div>
            </div>
          </div>

          {/* Delete Confirmation Alert if active */}
          {showDeleteConfirm && (
            <div className="mx-6 my-2 p-4 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FiTrash2 className="text-base" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-rose-900">
                    Delete this Loan Record?
                  </h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    This action will permanently delete this loan entry. This cannot be undone.
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      {isDeleting ? "Deleting..." : "Yes, Delete Loan"}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-3.5 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-700 text-xs font-medium transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inline Edit Form */}
          {isEditingInline ? (
            <div className="px-6 py-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">
                  Edit Loan Details
                </h3>
                <span className="text-xs text-slate-400">
                  Update values and click Save
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Loan Title
                  </label>
                  <input
                    type="text"
                    value={editForm.loanTitle}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, loanTitle: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.loanAmount}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, loanAmount: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Interest Rate (% / yr)
                  </label>
                  <input
                    type="number"
                    value={editForm.interestRate}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, interestRate: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Loan Term (Months)
                  </label>
                  <input
                    type="number"
                    value={editForm.loanTerm}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, loanTerm: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.emi}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, emi: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Due / Next EMI Date
                  </label>
                  <input
                    type="date"
                    value={editForm.dueDate}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Party / Counterparty
                  </label>
                  <input
                    type="text"
                    value={editForm.partyName}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, partyName: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={editForm.paymentMode}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, paymentMode: e.target.value }))
                    }
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={3}
                  value={editForm.remarks}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, remarks: e.target.value }))
                  }
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingInline(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveInline}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <FiSave className="text-sm" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* ─── Detail Rows ─── */
            <div className="px-6 py-4 space-y-1">
              {/* Party Name */}
              <LoanDetailRow
                icon={<FiUser />}
                label="Party / Contact"
                value={entry.partyName}
                placeholder="No party specified"
              />

              {/* Loan Issued By */}
              {entry.loanIssuedBy && (
                <LoanDetailRow
                  icon={<FiBriefcase />}
                  label="Loan Issued By"
                  value={entry.loanIssuedBy}
                  placeholder="Not specified"
                />
              )}

              {/* Reimbursement Plan */}
              <LoanDetailRow
                icon={<FiRefreshCw />}
                label="Reimbursement Plan"
                value={
                  entry.reimbursementPlan === "yes"
                    ? "Structured EMI Plan"
                    : "Flexible / Lump-sum"
                }
                badge
                badgeClass={
                  entry.reimbursementPlan === "yes"
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-700"
                }
              />

              {/* Due Date / First EMI Date */}
              {(entry.dueDate || entry.emiDate) && (
                <LoanDetailRow
                  icon={<FiCalendar />}
                  label="Due / First EMI Date"
                  value={formatDate(entry.dueDate || entry.emiDate)}
                />
              )}

              {/* Payment Mode */}
              <LoanDetailRow
                icon={<FiCreditCard />}
                label="Payment Mode"
                value={entry.paymentMode || "Cash"}
              />

              {/* Remarks */}
              <div className="py-3.5 border-b border-slate-100 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                    <FiMessageSquare className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Remarks / Terms
                    </div>
                    {entry.remarks ? (
                      <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                        {entry.remarks}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">
                        No remarks added
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Attached Documents Section ─── */}
          <div className="px-6 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <FiPaperclip className="text-slate-400 text-sm" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Loan Documents & Agreements
              </span>
              {hasFiles && (
                <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">
                  {filesArray.length}
                </span>
              )}
            </div>

            {hasFiles ? (
              <div className="space-y-2">
                {filesArray.map((file, index) => {
                  const fileName =
                    typeof file === "string"
                      ? file
                      : file.name || file.filename || "file";
                  const fileURL = `http://localhost:5000/uploads/${fileName}`;
                  const ext = getFileExtension(fileName);
                  const icon = getFileIcon(fileName);

                  return (
                    <div
                      key={index}
                      className="group flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 hover:bg-slate-100/80 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg shadow-xs shrink-0">
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-700 truncate">
                          {fileName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {ext} file
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(fileURL, "_blank")}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 flex items-center justify-center transition-all cursor-pointer"
                          title="View"
                        >
                          <FiExternalLink className="text-sm" />
                        </button>
                        <a
                          href={fileURL}
                          download={fileName}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-all cursor-pointer"
                          title="Download"
                        >
                          <FiDownload className="text-sm" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                  <FiFileText className="text-base" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-400">
                    No loan documents attached
                  </div>
                  <div className="text-xs text-slate-400">
                    Sanction letters, promissory notes or agreements
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Activity Timeline ─── */}
          <div className="px-6 pb-6">
            <div className="flex items-center gap-2 mb-4">
              <FiClock className="text-slate-400 text-sm" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Loan History
              </span>
            </div>

            <div className="relative pl-5 space-y-0">
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-200" />

              {/* Created event */}
              <div className="relative flex gap-3.5 pb-4">
                <div className="w-[22px] h-[22px] rounded-full bg-indigo-100 border-2 border-indigo-500 flex items-center justify-center z-10 shrink-0">
                  <FiPlus className="text-indigo-600 text-[10px]" />
                </div>
                <div className="pt-0.5">
                  <div className="text-sm font-medium text-slate-700">
                    Loan Disbursed / Created
                    {entry.createdBy && (
                      <span className="text-slate-500 font-normal">
                        {" "}
                        by {entry.createdBy}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatTimestamp(entry.createdAt || entry.date)}
                  </div>
                </div>
              </div>

              {/* Updated event */}
              {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                <div className="relative flex gap-3.5">
                  <div className="w-[22px] h-[22px] rounded-full bg-slate-100 border-2 border-slate-400 flex items-center justify-center z-10 shrink-0">
                    <FiEdit3 className="text-slate-500 text-[10px]" />
                  </div>
                  <div className="pt-0.5">
                    <div className="text-sm font-medium text-slate-700">
                      Last Updated
                      {entry.lastUpdatedBy && (
                        <span className="text-slate-500 font-normal">
                          {" "}
                          by {entry.lastUpdatedBy}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatTimestamp(entry.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Footer Action Bar ─── */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center justify-between">
            {/* Delete button */}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <FiTrash2 className="text-sm" />
              <span>Delete</span>
            </button>

            {/* Right actions */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100/80 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (onEdit) {
                    onEdit(entry);
                  }
                  setIsEditingInline((prev) => !prev);
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
              >
                <FiEdit3 className="text-sm" />
                <span>{isEditingInline ? "Close Edit" : "Edit Loan"}</span>
                <FiChevronRight className="text-sm opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ─── Reusable Detail Row Component ─── */
const LoanDetailRow = ({
  icon,
  label,
  value,
  placeholder = "—",
  badge = false,
  badgeClass = "bg-slate-100 text-slate-700",
}) => (
  <div className="py-3.5 border-b border-slate-100 last:border-b-0">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        {value ? (
          badge ? (
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-xs font-medium ${badgeClass}`}
            >
              {value}
            </span>
          ) : (
            <div className="text-sm font-medium text-slate-800 mt-0.5">
              {value}
            </div>
          )
        ) : (
          <div className="text-sm text-slate-400 italic mt-0.5">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  </div>
);

LoanDetailRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.any,
  placeholder: PropTypes.string,
  badge: PropTypes.bool,
  badgeClass: PropTypes.string,
};

LoanEntryDetails.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entry: PropTypes.object,
  onEdit: PropTypes.func,
};

export default LoanEntryDetails;