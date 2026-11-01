import { useState, useEffect, useContext } from "react";
import { DataContext } from "../context/DataContext";
import Header from "../components/Header";
import Filters from "../components/Filters";
import SearchAndActions from "../components/SearchAndActnbtn";
import Summary from "../components/Summary";
import Table from "../components/Table";
import BulkEntryModal from "../components/modal/BulkEntryModal";
import ReportModal from "../components/modal/ReportModal";

// Helper to extract clean YYYY-MM-DD from various date representations
const normalizeDate = (val) => {
  if (!val && val !== 0) return "";
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const y = val.getFullYear();
      const m = String(val.getMonth() + 1).padStart(2, "0");
      const d = String(val.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    }
  }
  const str = String(val).trim();
  if (!str) return "";
  if (str.includes("T")) return str.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // Handle DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    } else if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }
  return str;
};

// Check if an entry date matches the active duration / date filter
const matchesDateDuration = (entryDateStr, filters) => {
  if (!filters || !filters.duration || filters.duration === "All Time") {
    return true;
  }
  if (!entryDateStr) return false;

  const now = new Date();
  const formatYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const todayStr = formatYMD(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const maxAllowedStr = formatYMD(tomorrow);

  switch (filters.duration) {
    case "Today":
      return entryDateStr === todayStr;

    case "Yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return entryDateStr === formatYMD(yesterday);
    }

    case "Last 7 Days": {
      const past7 = new Date(now);
      past7.setDate(now.getDate() - 7);
      const past7Str = formatYMD(past7);
      return entryDateStr >= past7Str && entryDateStr <= maxAllowedStr;
    }

    case "Last 30 Days": {
      const past30 = new Date(now);
      past30.setDate(now.getDate() - 30);
      const past30Str = formatYMD(past30);
      return entryDateStr >= past30Str && entryDateStr <= maxAllowedStr;
    }

    case "Last 90 Days": {
      const past90 = new Date(now);
      past90.setDate(now.getDate() - 90);
      const past90Str = formatYMD(past90);
      return entryDateStr >= past90Str && entryDateStr <= maxAllowedStr;
    }

    case "This Month": {
      const startOfMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      return entryDateStr >= startOfMonthStr && entryDateStr <= maxAllowedStr;
    }

    case "Custom Range": {
      let start = normalizeDate(filters.startDate);
      let end = normalizeDate(filters.endDate);

      if (!start && !end) return true;

      if (start && end && start > end) {
        const temp = start;
        start = end;
        end = temp;
      }

      if (start && end) {
        return entryDateStr >= start && entryDateStr <= end;
      }
      if (start) {
        return entryDateStr >= start;
      }
      if (end) {
        return entryDateStr <= end;
      }
      return true;
    }

    default:
      return true;
  }
};

const ExpenseBook = () => {
  // Get transaction operations from context
  const { 
    transactions, 
    createTransaction, 
    updateTransaction, 
    deleteTransactions 
  } = useContext(DataContext);

  const [currentFilters, setCurrentFilters] = useState({
    duration: "All Time",
    type: "All",
    party: "All",
    paymentMode: "All",
    category: "All",
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [filterOptions] = useState({
    parties: [],
    paymentMode: [],
    category: [],
  });

  // Function to add a new entry to the table
  const addEntry = async (entry) => {
    console.log("Added data to table", entry);
    try {
      await createTransaction(entry);
      console.log("add entry");
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setCurrentFilters(filters);
  };

  // Synchronously compute filtered data using both filters and search term
  const filteredData = (transactions || []).filter((entry) => {
    // 1. Search filter
    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase().trim();
      const remarks = (entry.remarks || "").toLowerCase();
      const party = (entry.partyName || "").toLowerCase();
      const category = (entry.category || "").toLowerCase();
      const paymentMode = (entry.paymentMode || "").toLowerCase();
      const amount = (entry.amount || "").toString();
      const date = (entry.date || "").toLowerCase();
      const matchesSearch =
        remarks.includes(s) ||
        party.includes(s) ||
        category.includes(s) ||
        paymentMode.includes(s) ||
        amount.includes(s) ||
        date.includes(s);

      if (!matchesSearch) return false;
    }

    // 2. Duration / Date filter
    const entryDate = normalizeDate(entry.date);
    if (!matchesDateDuration(entryDate, currentFilters)) {
      return false;
    }

    // 3. Type filter
    if (currentFilters.type !== "All" && entry.type !== currentFilters.type) {
      return false;
    }

    // 4. Party filter
    if (
      currentFilters.party !== "All" &&
      entry.partyName !== currentFilters.party
    ) {
      return false;
    }

    // 5. Payment Mode filter
    if (
      currentFilters.paymentMode !== "All" &&
      entry.paymentMode !== currentFilters.paymentMode
    ) {
      return false;
    }

    // 6. Category filter
    if (
      currentFilters.category !== "All" &&
      entry.category !== currentFilters.category
    ) {
      return false;
    }

    return true;
  });

  //Function to delete Table data
  const handleDeleteSelected = async (selectedIds) => {
    if (
      window.confirm("Are you sure you want to delete the selected entries?")
    ) {
      try {
        // API call to delete the selected rows
        await deleteTransactions(selectedIds);
      } catch (error) {
        console.error("Error deleting entries:", error);
      }
    }
  };

  // Function to update an existing entry
  const updateEntry = async (updatedEntry) => {
    console.log("Updated Entry in updateEntry:", updatedEntry);
    try {
      const entryId = updatedEntry._id || updatedEntry.id;
      await updateTransaction(entryId, updatedEntry);
      console.log("Table Data Updated Successfully");
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  return (
    <div>
      <Header onOpenBulkImport={() => setIsBulkModalOpen(true)} onOpenReport={() => setIsReportModalOpen(true)} />
      {/* Pass filters and handleFilterChange to Filters component */}
      <Filters
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
      />
      <SearchAndActions addEntry={addEntry} onSearch={handleSearch} />
      {/* Pass filters and transactions to Summary component */}
      <Summary tableData={transactions} filters={filteredData} />
      <Table
        tableData={filteredData} // filters={filteredData}
        updateEntry={updateEntry}
        onDeleteSelected={handleDeleteSelected} // Pass the delete handler
      />
      
      {/* Bulk Entry Excel Import Modal */}
      <BulkEntryModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Report Generation Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default ExpenseBook;
