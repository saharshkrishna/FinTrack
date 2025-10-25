import { useState } from "react";
import PropTypes from "prop-types";
import EntryDetails from "./modal/EntryDetails";
import LoanEntryModal from "./modal/LoanEntryDetails"; // Import the LoanEntryDetails modal
import Pagination from "./Pagination";

const Table = ({ tableData, updateEntry, onDeleteSelected, }) => {
  ("Table Data Passed to Table Component:", tableData);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEntryDetailsOpen, setIsEntryDetailsOpen] = useState(false);
  const [isLoanEntryModalOpen, setIsLoanEntryModalOpen] = useState(false); // State for LoanEntryModal
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [selectedRows, setSelectedRows] = useState([]); // Track selected rows
  const rowsPerPage = 25; // Number of rows per page

  // Sort table data so that new entries appear at the top
  const sortedTableData = [...tableData].sort((a, b) => b.id - a.id);

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedTableData.slice(indexOfFirstRow, indexOfLastRow);

  // Handle row click to open details modal
  const handleRowClick = (entry) => {
    setSelectedEntry(entry);

    // Check the entry type and open the appropriate modal
    if (entry.type === "Loan") {
      setIsLoanEntryModalOpen(true); // Open LoanEntryModal for Loan entries
    } else {
      setIsEntryDetailsOpen(true); // Open EntryDetails for other entries
    }
  };

  // Handle row selection
  const handleRowSelect = (id) => {
    setSelectedRows((prevSelectedRows) => {
      const updatedRows = prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id) // Deselect
        : [...prevSelectedRows, id]; // Select
      
      console.log("Updated selected rows:", updatedRows); // Correctly logs the new state
      
      return updatedRows;
    });
  };

  // Handle "Select All" functionality
  const handleSelectAll = () => {
    const currentPageIds = currentRows.map((row) => row._id);
  
    setSelectedRows((prevSelected) => {
      if (currentPageIds.every((id) => prevSelected.includes(id))) {
        console.log("Deselecting all rows on the current page");
        return prevSelected.filter((id) => !currentPageIds.includes(id));
      } else {
        console.log("Selecting all rows on the current page");
        return [...new Set([...prevSelected, ...currentPageIds])];
      }
    });
  };

  // Handle delete selected rows
  const handleLocalDeleteSelected = async () => {
    if (selectedRows.length === 0) {
      alert("No rows selected for deletion.");
      return;
    }
  
    console.log("Deleting rows:", selectedRows);
  
    // Call the parent delete function
    await onDeleteSelected(selectedRows);
  
    // Clear the selection after deletion
    setSelectedRows((prev) => {
      console.log("Clearing selection. Previous selected rows:", prev);
      return [];
    });
  };
  
  
  

  return (
    <div className="bg-white rounded-lg shadow-sm">

      {/* Delete Button (Visible when rows are selected) */}
      {selectedRows.length > 0 && (
  <div className="py-2 px-3 w-[120px] bg-red-50 border-b border-red-200">
    <button
      onClick={handleLocalDeleteSelected}
      className="px-4 py-2 bg-red-500 text-white rounded-lg"
    >
      Delete Selected ({selectedRows.length})
    </button>
  </div>
)}

      {/* Pagination */}
      <Pagination
        totalRows={sortedTableData.length}
        rowsPerPage={rowsPerPage}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Table */}
      <table className="table-fixed w-full text-left">
        <thead>
          <tr className="text-left bg-gray-50">
          <th className="py-2 px-3 w-4">
        {/* Select All Checkbox */}
        <input
  type="checkbox"
  checked={currentRows.length > 0 && currentRows.every((row) => selectedRows.includes(row._id))}
  onChange={handleSelectAll}
/>
      </th>
            <th className="py-2 px-3 w-[120px] text-[13px] font-semibold">Date</th>
            <th className="py-2 px-3 w-[120px] text-[13px] font-semibold">Type</th>
            <th className="py-2 px-3 w-[120px] text-[13px] font-semibold">Category</th>
            <th className="py-2 px-3 w-[120px] text-[13px] font-semibold">Bill</th>
            <th className="py-2 px-3 w-[120px] text-[13px] font-semibold">Amount</th>
            <th className="py-2 px-3 w-[120px] text-[13px] font-semibold">Details</th>
          </tr>
        </thead>
        <tbody>
        {currentRows.map((entry) => (
         
      <tr
        key={entry._id}
        className="border-t hover:bg-gray-50 cursor-pointer"
        onClick={() => handleRowClick(entry)} // Handle row click
      >
        <td className="py-2 px-3 w-[120px]" onClick={(e) => e.stopPropagation()}>
          {/* Row Checkbox */}
          <input
            type="checkbox"
            checked={selectedRows.includes(entry._id)}
            onChange={() => handleRowSelect(entry._id)}
          />
          {(`Checkbox for ID ${entry.id} is checked:`, selectedRows.includes(entry.id))}
        </td>
              <td className="py-2 px-3 w-[120px] text-[13px]">
                <div>{entry.date}</div>
                {/* <div className="text-sm text-gray-500">{entry.time}</div> */}
              </td>
              <td className="py-2 px-3 w-[120px] text-[13px]">{entry.type}</td>
              <td className="py-2 px-3 w-[120px] text-[13px]">{entry.category}</td>
              
              
              <td className="py-2 px-3 w-[120px] text-[13px]">
                 {entry.bills && entry.bills.length > 0 ? (
                <div className="flex items-center gap-1">
                  <span>📎</span> {/* Icon for attached bills */}
                  <span className="text-sm text-gray-500">({entry.bills.length})</span> {/* Number of files */}
                 </div>
                  ) : null}
              </td>
              
              <td
      className={`py-2 px-3 w-[120px] text-[13px] ${
              entry.type === "Cash Out"
              ? "text-red-600"
              : entry.type === "Credit"
              ? "text-blue-600"
              : "text-green-600"
          }`}
        >
                {entry.amount}
              </td>
              <td className="py-2 px-3 w-[120px] text-[13px]">
                <div>{entry.partyName}</div> {/* Display party name and type */}
                <div className="text-sm text-gray-500">{entry.details}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Entry Details Modal */}
      {selectedEntry && selectedEntry.type !== "Loan" && (
        <EntryDetails
          isOpen={isEntryDetailsOpen}
          onClose={() => setIsEntryDetailsOpen(false)}
          title="Entry Details"
          entry={selectedEntry}
          onEdit={(updatedEntry) => {
            updateEntry(updatedEntry);
            setIsEntryDetailsOpen(false);
          }}
        />
      )}

      {/* Loan Modal */}
      {selectedEntry && selectedEntry.type === "Loan" && (
        <LoanEntryModal
          isOpen={isLoanEntryModalOpen}
          onClose={() => setIsLoanEntryModalOpen(false)}
          entry={selectedEntry}
          title="Loan Details"
          onEdit={(updatedEntry) => {
            updateEntry(updatedEntry);
            setIsLoanEntryModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

Table.propTypes = {
  tableData: PropTypes.array.isRequired,
  updateEntry: PropTypes.func.isRequired,
  onDeleteSelected: PropTypes.func.isRequired,
 
};

export default Table;