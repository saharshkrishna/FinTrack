import { useState, useEffect } from "react";
import PropTypes from "prop-types";

const DateSelectionModal = ({ isOpen, onClose, onApply, startDate, endDate }) => {
  const [localStartDate, setLocalStartDate] = useState(startDate || "");
  const [localEndDate, setLocalEndDate] = useState(endDate || "");
  const [singleDate, setSingleDate] = useState("");
  const [dateOption, setDateOption] = useState("single"); // Default to single date

  // 🛠 Sync state when modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setLocalStartDate(startDate || "");
      setLocalEndDate(endDate || "");
    }
  }, [isOpen, startDate, endDate]);

  const handleApply = () => {
    if (dateOption === "single" && singleDate) {
      onApply({ startDate: singleDate, endDate: singleDate });
    } else if (dateOption === "range" && localStartDate && localEndDate) {
      onApply({ startDate: localStartDate, endDate: localEndDate });
    }
    onClose(); // Close modal after applying
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
      <div className="bg-white p-6 rounded-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Select Date</h2>

        {/* Date Option Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Date Option</label>
          <div className="flex gap-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="single"
                checked={dateOption === "single"}
                onChange={() => setDateOption("single")}
              />
              <span className="ml-2">Single Day</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="range"
                checked={dateOption === "range"}
                onChange={() => setDateOption("range")}
              />
              <span className="ml-2">Date Range</span>
            </label>
          </div>
        </div>

        {dateOption === "single" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Single Date</label>
            <input
              type="date"
              value={singleDate}
              onChange={(e) => setSingleDate(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
        )}

        {dateOption === "range" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              className="w-full border rounded-lg p-2 mb-2"
            />
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              className="w-full border rounded-lg p-2"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={handleApply} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Apply
          </button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-black rounded-lg">
            Close
          </button>
        </div>
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
