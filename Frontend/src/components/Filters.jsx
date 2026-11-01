import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../context/DataContext";
import DateModal from "./modal/DateModal"; // Import the modal

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Handle generic filter changes (type, party, paymentMode, category)
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

  const handleDateModalClose = () => {
    setIsDateModalOpen(false);
  };

  return (
    <div className="text-[14px]">
      {/* Filters */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {/* Duration Filter */}
        <div className="flex items-center gap-1">
          <select
            className="w-full p-1 border rounded-lg"
            value={selectedFilters.duration}
            onChange={handleDurationChange}
          >
            <option value="All Time">All Time</option>
            <option value="Today">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="This Month">This Month</option>
            <option value="Custom Range">
              {selectedFilters.duration === "Custom Range" && selectedFilters.startDate
                ? `Custom (${selectedFilters.startDate}${selectedFilters.endDate && selectedFilters.endDate !== selectedFilters.startDate ? ` to ${selectedFilters.endDate}` : ""})`
                : "Custom Range..."}
            </option>
          </select>
          <button
            type="button"
            onClick={() => setIsDateModalOpen(true)}
            className={`px-2 py-1 text-xs rounded-lg border font-medium shrink-0 flex items-center gap-1 cursor-pointer transition-colors ${
              selectedFilters.duration === "Custom Range"
                ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
            }`}
            title="Open custom date range picker"
          >
            📅 {selectedFilters.duration === "Custom Range" ? "Edit" : "Date"}
          </button>
        </div>

        {/* Type Filter */}
        <select
          className="p-1 border rounded-lg"
          value={selectedFilters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
        >
          <option value="All">Types: All</option>
          <option value="Cash In">Cash In</option>
          <option value="Cash Out">Cash Out</option>
          <option value="Credit">Credit</option>
          <option value="Debit">Debit</option>
          <option value="Loan">Loan</option>
          <option value="LoanRe">Loan Re</option>
        </select>

        {/* Party Filter */}
        <select
          className="p-1 border rounded-lg"
          value={selectedFilters.party}
          onChange={(e) => handleFilterChange("party", e.target.value)}
        >
          <option value="All">All parties</option>
          {parties?.map((party, index) => (
            <option key={index} value={party.partyName}>
              {party.partyName}
            </option>
          ))}
        </select>

        {/* Payment Mode Filter */}
        <select
          className="p-1 border rounded-lg"
          value={selectedFilters.paymentMode}
          onChange={(e) => handleFilterChange("paymentMode", e.target.value)}
        >
          <option value="All">All Payment Modes</option>
          {paymentModes?.map((paymentMode, index) => (
            <option key={index} value={paymentMode.paymentMode}>
              {paymentMode.paymentMode}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          className="p-1 border rounded-lg"
          value={selectedFilters.category}
          onChange={(e) => handleFilterChange("category", e.target.value)}
        >
          <option value="All">All Category</option>
          {categories?.map((categoryObj) => (
            <option key={categoryObj._id} value={categoryObj.category}>
              {categoryObj.category}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        <button
          className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          onClick={handleResetFilters}
        >
          Reset Filters
        </button>
      </div>

      {/* Date Modal */}
      <DateModal
        isOpen={isDateModalOpen}
        onClose={handleDateModalClose}
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