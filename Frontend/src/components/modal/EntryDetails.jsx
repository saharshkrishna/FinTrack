import { useEffect, useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import {
  FiX,
  FiEdit3,
  FiCalendar,
  FiUser,
  FiTag,
  FiCreditCard,
  FiFileText,
  FiMessageSquare,
  FiPaperclip,
  FiExternalLink,
  FiDownload,
  FiClock,
  FiPlus,
  FiArrowUpRight,
  FiArrowDownRight,
  FiChevronRight,
} from "react-icons/fi";
import CashinModal from "./CashinModal";
import CashoutModal from "./CashoutModal";
import DebitModal from "./DebitModal";
import CreditModal from "./CreditModal";

const TYPE_CONFIG = {
  "Cash In": {
    gradient: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badgeBg: "bg-emerald-100",
    icon: FiArrowUpRight,
    amountColor: "text-emerald-600",
    label: "Inflow",
  },
  "Cash Out": {
    gradient: "from-rose-500 to-red-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badgeBg: "bg-rose-100",
    icon: FiArrowDownRight,
    amountColor: "text-rose-600",
    label: "Outflow",
  },
  Credit: {
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badgeBg: "bg-blue-100",
    icon: FiArrowUpRight,
    amountColor: "text-blue-600",
    label: "Receivable",
  },
  Debit: {
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badgeBg: "bg-amber-100",
    icon: FiArrowDownRight,
    amountColor: "text-amber-600",
    label: "Payable",
  },
};

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

const EntryDetails = ({ isOpen, onClose, entry, onEdit }) => {
  const [modalToOpen, setModalToOpen] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const panelRef = useRef(null);

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
    setTimeout(() => onClose(), 280);
  }, [onClose]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        handleClose();
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
  }, [isOpen, entry, handleClose]);

  const handleEditClick = () => {
    switch (entry.type) {
      case "Cash In":
        setModalToOpen("CashinModal");
        break;
      case "Cash Out":
        setModalToOpen("CashoutModal");
        break;
      case "Debit":
        setModalToOpen("DebitModal");
        break;
      case "Credit":
        setModalToOpen("CreditModal");
        break;
      default:
        setModalToOpen(null);
    }
  };

  const handleModalClose = () => {
    setModalToOpen(null);
  };

  const handleSave = (updatedEntry) => {
    onEdit(updatedEntry);
    setModalToOpen(null);
  };

  if (!isOpen || !entry) return null;

  const config = TYPE_CONFIG[entry.type] || TYPE_CONFIG["Cash In"];
  const TypeIcon = config.icon;
  const filesArray = entry.files || [];
  const hasFiles = Array.isArray(filesArray) && filesArray.length > 0;
  const formattedAmount =
    typeof entry.amount === "number"
      ? entry.amount.toLocaleString("en-IN")
      : entry.amount;

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
        className={`fixed right-0 top-0 h-full w-full sm:w-[520px] md:w-[560px] z-50 flex flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isVisible ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header with Gradient ─── */}
        <div
          className={`relative bg-gradient-to-br ${config.gradient} px-6 pt-5 pb-6 shrink-0`}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-32 h-32 border border-white/30 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 border border-white/20 rounded-full" />
          </div>

          <div className="relative z-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <TypeIcon className="text-white text-base" />
                </div>
                <div>
                  <span className="text-white/90 text-xs font-semibold uppercase tracking-wider">
                    {config.label}
                  </span>
                  <div className="text-white text-sm font-bold">{entry.type}</div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Amount */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-white/60 text-xs font-medium mb-1">
                  Transaction Amount
                </div>
                <div className="text-white text-3xl sm:text-4xl font-extrabold tracking-tight">
                  ₹{formattedAmount}
                </div>
              </div>
              <div className="text-white/70 text-xs font-medium flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <FiCalendar className="text-sm" />
                <span>{formatDate(entry.date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Scrollable Content ─── */}
        <div className="flex-1 overflow-y-auto">
          {/* Detail Fields */}
          <div className="px-6 py-5 space-y-1">
            {/* Party Name */}
            <DetailRow
              icon={<FiUser />}
              label="Party / Counterparty"
              value={entry.partyName}
              placeholder="No party specified"
            />

            {/* Category */}
            <DetailRow
              icon={<FiTag />}
              label="Category"
              value={entry.category}
              placeholder="Uncategorized"
              badge
              badgeConfig={config}
            />

            {/* Payment Mode */}
            <DetailRow
              icon={<FiCreditCard />}
              label="Payment Mode"
              value={entry.paymentMode}
              placeholder="Not specified"
            />

            {/* Remarks */}
            <div className="py-3.5 border-b border-slate-100 last:border-b-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                  <FiMessageSquare className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Remarks / Notes
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

            {/* Tags */}
            {entry.tags && entry.tags.length > 0 && (
              <div className="py-3.5 border-b border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                    <FiTag className="text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.tags.map((tag, index) => (
                        <span
                          key={index}
                          className={`${config.badgeBg} ${config.text} px-3 py-1 rounded-full text-xs font-medium`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─── Attached Files Section ─── */}
          <div className="px-6 pb-5">
            <div className="flex items-center gap-2 mb-3">
              <FiPaperclip className="text-slate-400 text-sm" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Attached Documents
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
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-all cursor-pointer"
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
                    No files attached
                  </div>
                  <div className="text-xs text-slate-400">
                    Add receipts or bills by editing this entry
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
                Activity Timeline
              </span>
            </div>

            <div className="relative pl-5 space-y-0">
              {/* Vertical connecting line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-200" />

              {/* Created event */}
              <div className="relative flex gap-3.5 pb-4">
                <div className="w-[22px] h-[22px] rounded-full bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center z-10 shrink-0">
                  <FiPlus className="text-emerald-600 text-[10px]" />
                </div>
                <div className="pt-0.5">
                  <div className="text-sm font-medium text-slate-700">
                    Entry Created
                    {entry.createdBy && (
                      <span className="text-slate-500 font-normal">
                        {" "}
                        by {entry.createdBy}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {formatTimestamp(entry.createdAt)}
                  </div>
                </div>
              </div>

              {/* Updated event */}
              {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
                <div className="relative flex gap-3.5">
                  <div className="w-[22px] h-[22px] rounded-full bg-blue-100 border-2 border-blue-400 flex items-center justify-center z-10 shrink-0">
                    <FiEdit3 className="text-blue-600 text-[10px]" />
                  </div>
                  <div className="pt-0.5">
                    <div className="text-sm font-medium text-slate-700">
                      Last Modified
                      {entry.lastUpdatedBy && (
                        <span className="text-slate-500 font-normal">
                          {" "}
                          by {entry.lastUpdatedBy}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {formatTimestamp(entry.updatedAt || entry.lastUpdatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Bottom Action Bar ─── */}
        <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-mono">
              ID: {entry._id ? entry._id.slice(-8) : "—"}
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleEditClick}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r ${config.gradient} rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.97]`}
              >
                <FiEdit3 className="text-sm" />
                <span>Edit Entry</span>
                <FiChevronRight className="text-sm opacity-70" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modals */}
      {modalToOpen === "CashinModal" && (
        <CashinModal
          onClose={handleModalClose}
          type={entry.type}
          onSubmit={handleSave}
          initialData={entry}
        />
      )}
      {modalToOpen === "CashoutModal" && (
        <CashoutModal
          key={entry._id}
          onClose={handleModalClose}
          type={entry.type}
          onSubmit={handleSave}
          initialData={entry}
        />
      )}
      {modalToOpen === "DebitModal" && (
        <DebitModal
          onClose={handleModalClose}
          type={entry.type}
          onSubmit={handleSave}
          initialData={entry}
        />
      )}
      {modalToOpen === "CreditModal" && (
        <CreditModal
          onClose={handleModalClose}
          type={entry.type}
          onSubmit={handleSave}
          initialData={entry}
        />
      )}
    </>
  );
};

/* ─── Reusable Detail Row Component ─── */
const DetailRow = ({
  icon,
  label,
  value,
  placeholder = "—",
  badge = false,
  badgeConfig,
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
          badge && badgeConfig ? (
            <span
              className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-sm font-medium ${badgeConfig.badgeBg} ${badgeConfig.text}`}
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

DetailRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  badge: PropTypes.bool,
  badgeConfig: PropTypes.object,
};

EntryDetails.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entry: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
};

export default EntryDetails;
