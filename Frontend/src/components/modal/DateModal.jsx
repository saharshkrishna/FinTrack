import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FiCalendar, FiX, FiCheck } from "react-icons/fi";

const formatYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const DateSelectionModal = ({ isOpen, onClose, onApply, startDate, endDate }) => {
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");
  const [singleDate, setSingleDate] = useState("");
  const [dateOption, setDateOption] = useState("range");
  const [error, setError] = useState("");

  // Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setError("");
      const now = new Date();
      const todayStr = formatYMD(now);

      if (startDate && endDate && startDate !== endDate) {
        setDateOption("range");
        setLocalStartDate(startDate);
        setLocalEndDate(endDate);
        setSingleDate(startDate);
      } else if (startDate) {
        setDateOption("single");
        setSingleDate(startDate);
        setLocalStartDate(startDate);
        setLocalEndDate(endDate || startDate);
      } else {
        // Sensible defaults when opened fresh
        setDateOption("range");
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        setLocalStartDate(formatYMD(thirtyDaysAgo));
        setLocalEndDate(todayStr);
        setSingleDate(todayStr);
      }
    }
  }, [isOpen, startDate, endDate]);

  const setPreset = (type) => {
    const now = new Date();
    const todayStr = formatYMD(now);
    setDateOption("range");
    setError("");

    if (type === "this_month") {
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      setLocalStartDate(start);
      setLocalEndDate(todayStr);
    } else if (type === "last_month") {
      const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      setLocalStartDate(formatYMD(firstDayPrevMonth));
      setLocalEndDate(formatYMD(lastDayPrevMonth));
    } else if (type === "last_30") {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setLocalStartDate(formatYMD(past30));
      setLocalEndDate(todayStr);
    } else if (type === "ytd") {
      setLocalStartDate(`${now.getFullYear()}-01-01`);
      setLocalEndDate(todayStr);
    }
  };

  const handleApply = (e) => {
    if (e) e.preventDefault();
    setError("");

    if (dateOption === "single") {
      if (!singleDate) {
        setError("Please choose a date.");
        return;
      }
      onApply({ startDate: singleDate, endDate: singleDate });
    } else {
      let start = localStartDate;
      let end = localEndDate;

      if (!start && !end) {
        setError("Please select a start and end date.");
        return;
      }
      if (start && !end) end = start;
      if (end && !start) start = end;

      if (start > end) {
        const temp = start;
        start = end;
        end = temp;
      }

      onApply({ startDate: start, endDate: end });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-sm">
              <FiCalendar />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Custom Date Filter
              </h3>
              <p className="text-xs text-slate-400">
                Filter transactions by single day or range
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleApply} className="p-6 space-y-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => setPreset("this_month")}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setPreset("last_month")}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
              >
                Last Month
              </button>
              <button
                type="button"
                onClick={() => setPreset("last_30")}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
              >
                Last 30 Days
              </button>
              <button
                type="button"
                onClick={() => setPreset("ytd")}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
              >
                Year to Date
              </button>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setDateOption("range");
                setError("");
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                dateOption === "range"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Date Range
            </button>
            <button
              type="button"
              onClick={() => {
                setDateOption("single");
                setError("");
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                dateOption === "single"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Single Day
            </button>
          </div>

          {/* Inputs */}
          {dateOption === "single" ? (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Target Date
              </label>
              <input
                type="date"
                value={singleDate}
                onChange={(e) => {
                  setSingleDate(e.target.value);
                  setError("");
                }}
                className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={localStartDate}
                  onChange={(e) => {
                    setLocalStartDate(e.target.value);
                    setError("");
                  }}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={localEndDate}
                  onChange={(e) => {
                    setLocalEndDate(e.target.value);
                    setError("");
                  }}
                  className="w-full text-sm p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-600">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FiCheck className="text-sm" />
              Apply Range
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

DateSelectionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default DateSelectionModal;
