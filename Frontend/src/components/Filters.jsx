import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { FiCalendar, FiFilter, FiRotateCcw } from "react-icons/fi";
import { DataContext } from "../context/DataContext";
import DateModal from "./modal/DateModal";

const Filters = ({ onFilterChange }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    duration: "All Time",
    type: "All",
    party: "All",
    paymentMode: "All",
    category: "All",
    startDate: "",
    endDate: "",
  });

  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const { parties, categories, paymentModes, loading, error } = useContext(DataContext);

  if (loading) return <div className="text-xs text-slate-400 py-2">Loading filters...</div>;
  if (error) return <div className="text-xs text-rose-500 py-2">{error}</div>;

  const handleFilterChange = (filterType, value) => {
    const updatedFilters = { ...selectedFilters, [filterType]: value };

    if (filterType === "duration") {
      if (value === "Custom Range") {
        setIsDateModalOpen(true);
      } else {
        updatedFilters.startDate = "";
        updatedFilters.endDate = "";
      }
    }

    setSelectedFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      duration: "All Time",
      type: "All",
      party: "All",
      paymentMode: "All",
      category: "All",
      startDate: "",
      endDate: "",
    };

    setSelectedFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    if (value === "Custom Range") {
      setIsDateModalOpen(true);
    } else {
      const updatedFilters = {
        ...selectedFilters,
        duration: value,
        startDate: "",
        endDate: "",
      };
      setSelectedFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  };

  const handleDateSelection = ({ startDate, endDate }) => {
    const updatedFilters = {
      ...selectedFilters,
      duration: "Custom Range",
      startDate,
      endDate,
    };

    setSelectedFilters(updatedFilters);
    onFilterChange(updatedFilters);
    setIsDateModalOpen(false);
  };

  const isFiltered = 
    selectedFilters.duration !== "All Time" ||
    selectedFilters.type !== "All" ||
    selectedFilters.party !== "All" ||
    selectedFilters.paymentMode !== "All" ||
    selectedFilters.category !== "All";

  return (
    <div className="mb-4 text-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {/* Duration Filter */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <select
            className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
            value={selectedFilters.duration}
            onChange={handleDurationChange}
          >
            <option value="All Time">Period: All Time</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="This Month">This Month</option>
            <option value="Custom Range">
              {selectedFilters.duration === "Custom Range" && selectedFilters.startDate
                ? `Custom (${selectedFilters.startDate})`
                : "Custom Range..."}
            </option>
          </select>
          <button
            type="button"
            onClick={() => setIsDateModalOpen(true)}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Custom Date Range Picker"
          >
            <FiCalendar className="text-xs" />
          </button>
        </div>

        {/* Type Filter */}
        <div className="bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <select
            className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
            value={selectedFilters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="All">Type: All</option>
            <option value="Cash In">Cash In</option>
            <option value="Cash Out">Cash Out</option>
            <option value="Credit">Credit</option>
            <option value="Debit">Debit</option>
            <option value="Loan">Loan</option>
            <option value="LoanRe">Loan Re</option>
          </select>
        </div>

        {/* Party Filter */}
        <div className="bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <select
            className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
            value={selectedFilters.party}
            onChange={(e) => handleFilterChange("party", e.target.value)}
          >
            <option value="All">Party: All</option>
            {parties?.map((party, index) => (
              <option key={index} value={party.partyName}>
                {party.partyName}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Mode Filter */}
        <div className="bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <select
            className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
            value={selectedFilters.paymentMode}
            onChange={(e) => handleFilterChange("paymentMode", e.target.value)}
          >
            <option value="All">Mode: All</option>
            {paymentModes?.map((paymentMode, index) => (
              <option key={index} value={paymentMode.paymentMode}>
                {paymentMode.paymentMode}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
          <select
            className="w-full bg-transparent px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none cursor-pointer"
            value={selectedFilters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="All">Category: All</option>
            {categories?.map((categoryObj) => (
              <option key={categoryObj._id} value={categoryObj.category}>
                {categoryObj.category}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Filter Button */}
        <button
          onClick={handleResetFilters}
          disabled={!isFiltered}
          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isFiltered
              ? "bg-white border-slate-300 text-slate-800 hover:bg-slate-50 shadow-2xs active:scale-95"
              : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-60"
          }`}
          title="Reset all active filters"
        >
          <FiRotateCcw className="text-[11px]" />
          <span>Reset</span>
        </button>
      </div>

      {/* Date Modal */}
      <DateModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateSelection}
        startDate={selectedFilters.startDate}
        endDate={selectedFilters.endDate}
      />
    </div>
  );
};

Filters.propTypes = {
  filterOptions: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
};

export default Filters;
