import { useState, useEffect, useContext } from "react";
import { DataContext } from "../context/DataContext";
import Header from "../components/Header";
import Filters from "../components/Filters";
import SearchAndActions from "../components/SearchAndActnbtn";
import Summary from "../components/Summary";
import Table from "../components/Table";

const ExpenseBook = () => {
  // Get transaction operations from context
  const { 
    transactions, 
    createTransaction, 
    updateTransaction, 
    deleteTransactions 
  } = useContext(DataContext);

  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions] = useState({
    parties: [],
    paymentMode: [],
    category: [],
  });

  useEffect(() => {
    // Update filtered data when transactions change
    setFilteredData(transactions);
  }, [transactions]);

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

  const handleSearch = (searchTerm) => {
    console.log("Search Term:", searchTerm);
    if (!searchTerm.trim()) {
      setFilteredData(transactions); // Reset to original data if search term is empty
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = transactions.filter((entry) => {
      // Check if remarks is defined before calling toLowerCase
      const remarks = entry.remarks || ""; // Default to empty string if remarks is undefined
      const amount = entry.amount || ""; // Default to empty string if amount is undefined
      console.log("Entry Remarks:", remarks);
      return (
        remarks.toLowerCase().includes(searchLower) ||
        amount.toString().includes(searchTerm)
      );
    });
    console.log("Filtered Data:", filtered); // Debugging
    setFilteredData(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    const filtered = transactions.filter((entry) => {
      return (
        (filters.duration === "All Time" ||
          entry.duration === filters.duration) &&
        (filters.type === "All" || entry.type === filters.type) &&
        (filters.party === "All" || entry.partyName === filters.party) &&
        (filters.paymentMode === "All" ||
          entry.paymentMode === filters.paymentMode) &&
        (filters.category === "All" || entry.category === filters.category)
      );
    });
    setFilteredData(filtered);
  };

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
      await updateTransaction(updatedEntry.id, updatedEntry);
      console.log("Table Data Updated Successfully");
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  };

  return (
    <div>
      <Header />
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
    </div>
  );
};

export default ExpenseBook;
