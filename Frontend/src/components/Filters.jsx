import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../context/DataContext";
import DateModal from "./modal/DateModal"; // Import the modal

const Filters = ({ onFilterChange, }) => {
  const [selectedFilters, setSelectedFilters] = useState({
    duration: "All Time",
    type: "All",
    party: "All",
    paymentMode: "All",
    category: "All",
    startDate: "",
    endDate: "",
  });

  const [selectedDuration, setSelectedDuration] = useState("All Time");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedParty, setSelectedParty] = useState("All");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { parties, categories, paymentModes, loading, error } = useContext(DataContext);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Handle filter changes
 const handleFilterChange = (filterType, value) => {
  const updatedFilters = { ...selectedFilters, [filterType]: value };

  setSelectedFilters(updatedFilters);
  onFilterChange(updatedFilters);

  switch (filterType) {
    case "duration":
      setSelectedDuration(value);
      if (value === "Custom Range") {
        setIsDateModalOpen(true);
      } else {
        setStartDate("");
        setEndDate("");
      }
      break;
    case "type":
      setSelectedType(value);
      break;
    case "party":
      setSelectedParty(value);
      break;
    case "paymentMode":
      setSelectedPaymentMode(value);
      break;
    case "category":
      setSelectedCategory(value);
      break;
    default:
      break;
  }


    onFilterChange({
      duration: filterType === "duration" ? value : selectedDuration,
      type: filterType === "type" ? value : selectedType,
      party: filterType === "party" ? value : selectedParty,
      paymentMode: filterType === "paymentMode" ? value : selectedPaymentMode,
      category: filterType === "category" ? value : selectedCategory,
      startDate: filterType === "duration" && value === "Custom Range" ? startDate : "",
      endDate: filterType === "duration" && value === "Custom Range" ? endDate : "",
    });
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
    setSelectedDuration("All Time");
    setSelectedType("All");
    setSelectedParty("All");
    setSelectedPaymentMode("All");
    setSelectedCategory("All");
    setStartDate("");
    setEndDate("");
  
    onFilterChange(defaultFilters);
  };
  

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setSelectedFilters((prev) => ({ ...prev, duration: value })); // ✅ Ensure state is updated
  
    if (value === "Custom Range") {
      setIsDateModalOpen(true);
    } else {
      onFilterChange({
        ...selectedFilters, // ✅ Keep previous filters
        duration: value,
        startDate: "",
        endDate: "",
      });
    }
  };
  
  const handleDateSelection = ({ startDate, endDate }) => {
    const updatedFilters = {
      ...selectedFilters,
      duration: "Custom Range",
      startDate,
      endDate,
    };
  
    setStartDate(startDate);
    setEndDate(endDate);
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
          <select className="p-1 border rounded-lg" value={selectedFilters.duration} onChange={handleDurationChange}>
            <option value="All Time">All Time</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="Custom Range">Custom Range</option>
          </select>

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
  filterOptions: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  fetchPartyData: PropTypes.func.isRequired,
  fetchPaymentData: PropTypes.func.isRequired,
  fetchCategoryData: PropTypes.func.isRequired
};

export default Filters;