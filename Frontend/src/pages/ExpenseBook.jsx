import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Filters from "../components/Filters";
import SearchAndActions from "../components/SearchAndActnbtn";
import Summary from "../components/Summary";
import Table from "../components/Table";

const ExpenseBook = () => {
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [filterOptions] = useState({
    parties: [],
    paymentMode: [],
    category: [],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/user/transactions"
      );
      const data = response.data.transactions; // Assuming the response contains the transaction data
      console.log("Fetched Data:", data); // Debugging
      setTableData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  // Function to add a new entry to the table
  const addEntry = async (entry) => {
    console.log("Added data to table", entry);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/user/transactions",
        entry
      );
      const newEntry = { ...entry, id: Date.now() };
      setTableData((prevData) => [...prevData, newEntry]);
      setFilteredData((prevData) => [...prevData, newEntry]);
      console.log(response.data.message);
      console.log("add entry");
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  const handleSearch = (searchTerm) => {
    console.log("Search Term:", searchTerm);
    if (!searchTerm.trim()) {
      setFilteredData(tableData); // Reset to original data if search term is empty
      return;
    }

    const searchLower = searchTerm.toLowerCase();

    const filtered = tableData.filter((entry) => {
      // Check if remark is defined before calling toLowerCase
      const remark = entry.remark || ""; // Default to empty string if remark is undefined
      const amount = entry.amount || ""; // Default to empty string if amount is undefined
      console.log("Entry Remark:", remark);
      return (
        remark.toLowerCase().includes(searchLower) ||
        amount.toString().includes(searchTerm)
      );
    });
    console.log("Filtered Data:", filtered); // Debugging
    setFilteredData(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    const filtered = tableData.filter((entry) => {
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
        await axios.post("http://localhost:5000/api/user/transactions/delete", {
          ids: selectedIds, // Pass the selected IDs to the backend
        });

        // Update the state to remove the deleted entries
        const updatedTableData = tableData.filter(
          (entry) => !selectedIds.includes(entry.id)
        );

        setTableData(updatedTableData);
        setFilteredData(updatedTableData); // Also update filtered data if applied
      } catch (error) {
        console.error("Error deleting entries:", error);
      }
    }
  };

  // Function to update an existing entry
  const updateEntry = async (updatedEntry) => {
    console.log("Updated Entry in updateEntry:", updatedEntry);
    try {
      const response = await axios.put(
        `http://localhost:5000/api/user/transactions/${updatedEntry.id}`,
        updatedEntry
      );
      const updatedTransaction = response.data.transaction;

      setTableData((prevData) =>
        prevData.map((entry) =>
          entry._id === updatedEntry.id
            ? { ...entry, ...updatedTransaction }
            : entry
        )
      );
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
      {/* Pass filters and tableData to Summary component */}
      <Summary tableData={tableData} filters={filteredData} />
      <Table
        tableData={filteredData} // filters={filteredData}
        updateEntry={updateEntry}
        onDeleteSelected={handleDeleteSelected} // Pass the delete handler
      />
    </div>
  );
};

export default ExpenseBook;
