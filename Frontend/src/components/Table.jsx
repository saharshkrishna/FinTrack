import { useState } from "react";
import PropTypes from "prop-types";
import EntryDetails from "./modal/EntryDetails";
import LoanEntryModal from "./modal/LoanEntryDetails"; // Import the LoanEntryDetails modal
import Pagination from "./Pagination";

const Table = ({ tableData, updateEntry, onDeleteSelected, }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEntryDetailsOpen, setIsEntryDetailsOpen] = useState(false);
  const [isLoanEntryModalOpen, setIsLoanEntryModalOpen] = useState(false); // State for LoanEntryModal
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const [selectedRows, setSelectedRows] = useState([]); // Track selected rows
  const rowsPerPage = 25; // Number of rows per page

  // Sort table data so that new entries appear at the top
  const sortedTableData = [...tableData].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date);
    }
    return (b.id || 0) - (a.id || 0);
  });

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedTableData.slice(indexOfFirstRow, indexOfLastRow);

  const getFileIcon = (fileName) => {
    if (!fileName) return "📎";
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return "📄";
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return "🖼️";
    if (['xls', 'xlsx', 'csv'].includes(extension)) return "📊";
    if (['doc', 'docx', 'txt'].includes(extension)) return "📝";
    return "📎";
  };

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col overflow-hidden">
      {/* Delete Button (Visible when rows are selected) */}
      {selectedRows.length > 0 && (
        <div className="py-2.5 px-4 bg-red-50 border-b border-red-200 flex items-center justify-between shrink-0">
          <span className="text-xs font-medium text-red-700">
            {selectedRows.length} {selectedRows.length === 1 ? 'row' : 'rows'} selected
          </span>
          <button
            onClick={handleLocalDeleteSelected}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Delete Selected ({selectedRows.length})
          </button>
        </div>
      )}

      {/* Table Scrollable Container - Only the table scrolls */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)] min-h-[300px]">
        <table className="table-fixed w-full text-left">
          <thead className="sticky top-0 z-10 bg-gray-50 shadow-xs border-b border-gray-200 select-none">
            <tr className="text-left bg-gray-50">
              <th className="py-2.5 px-3 w-4 bg-gray-50">
                {/* Select All Checkbox */}
                <input
                  type="checkbox"
                  checked={currentRows.length > 0 && currentRows.every((row) => selectedRows.includes(row._id))}
                  onChange={handleSelectAll}
                  className="rounded cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-3 w-[120px] text-[13px] font-semibold bg-gray-50 text-gray-700">Date</th>
              <th className="py-2.5 px-3 w-[120px] text-[13px] font-semibold bg-gray-50 text-gray-700">Type</th>
              <th className="py-2.5 px-3 w-[120px] text-[13px] font-semibold bg-gray-50 text-gray-700">Category</th>
              <th className="py-2.5 px-3 w-[120px] text-[13px] font-semibold bg-gray-50 text-gray-700">Bill</th>
              <th className="py-2.5 px-3 w-[120px] text-[13px] font-semibold bg-gray-50 text-gray-700">Amount</th>
              <th className="py-2.5 px-3 w-[120px] text-[13px] font-semibold bg-gray-50 text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-gray-400 text-sm">
                  No transactions found.
                </td>
              </tr>
            ) : (
              currentRows.map((entry) => (
                <tr
                  key={entry._id}
                  className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleRowClick(entry)}
                >
                  <td className="py-2 px-3 w-[120px]" onClick={(e) => e.stopPropagation()}>
                    {/* Row Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(entry._id || entry.id)}
                      onChange={() => handleRowSelect(entry._id || entry.id)}
                      className="rounded cursor-pointer"
                    />
                  </td>
                  <td className="py-2 px-3 w-[120px] text-[13px]">
                    <div>{entry.date}</div>
                  </td>
                  <td className="py-2 px-3 w-[120px] text-[13px] font-medium">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      entry.type === "Cash In" 
                        ? "bg-green-50 text-green-700" 
                        : entry.type === "Cash Out"
                        ? "bg-red-50 text-red-700"
                        : entry.type === "Credit"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-2 px-3 w-[120px] text-[13px] text-gray-700">{entry.category || "-"}</td>
                  
                  <td className="py-2 px-3 w-[120px] text-[13px]">
                    {(() => {
                      const filesArray = entry.files || entry.bills || [];
                      if (filesArray.length > 0) {
                        const firstFile = filesArray[0];
                        const fileName = typeof firstFile === 'string' ? firstFile : (firstFile.name || firstFile.filename || '');
                        const icon = getFileIcon(fileName);
                        return (
                          <div className="flex items-center gap-1">
                            <span className="text-lg" title={fileName}>{icon}</span>
                            {filesArray.length > 1 && (
                              <span className="text-sm font-medium text-gray-600">+{filesArray.length - 1}</span>
                            )}
                          </div>
                        );
                      }
                      return <span className="text-gray-400">-</span>;
                    })()}
                  </td>
                  
                  <td
                    className={`py-2 px-3 w-[120px] text-[13px] font-semibold ${
                      entry.type === "Cash Out" || entry.type === "Debit"
                        ? "text-red-600"
                        : entry.type === "Credit"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {typeof entry.amount === 'number' ? entry.amount.toLocaleString() : entry.amount}
                  </td>
                  <td className="py-2 px-3 w-[120px] text-[13px]">
                    <div className="font-medium text-gray-800">{entry.partyName || "-"}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[140px]">{entry.remarks || entry.details || ""}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination (Pinned at bottom of table card) */}
      <div className="shrink-0">
        <Pagination
          totalRows={sortedTableData.length}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

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