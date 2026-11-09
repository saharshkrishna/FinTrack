import { useState } from "react";
import PropTypes from "prop-types";
import { FiTrash2, FiFileText, FiPaperclip, FiCheckSquare, FiSquare } from "react-icons/fi";
import EntryDetails from "./modal/EntryDetails";
import LoanEntryModal from "./modal/LoanEntryDetails";
import Pagination from "./Pagination";

const Table = ({ tableData = [], updateEntry = () => {}, onDeleteSelected = () => {} }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEntryDetailsOpen, setIsEntryDetailsOpen] = useState(false);
  const [isLoanEntryModalOpen, setIsLoanEntryModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const rowsPerPage = 25;

  // Sort table data so that new entries appear at the top
  const sortedTableData = [...(tableData || [])].sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date);
    }
    return (b.id || 0) - (a.id || 0);
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedTableData.slice(indexOfFirstRow, indexOfLastRow);

  const getFileIcon = (fileName) => {
    if (!fileName) return "📎";
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return "📄";
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return "🖼️";
    if (['xls', 'xlsx', 'csv'].includes(extension)) return "📊";
    return "📎";
  };

  const handleRowClick = (entry) => {
    setSelectedEntry(entry);
    if (entry.type === "Loan") {
      setIsLoanEntryModalOpen(true);
    } else {
      setIsEntryDetailsOpen(true);
    }
  };

  const handleRowSelect = (id) => {
    setSelectedRows((prevSelectedRows) => {
      return prevSelectedRows.includes(id)
        ? prevSelectedRows.filter((rowId) => rowId !== id)
        : [...prevSelectedRows, id];
    });
  };

  const handleSelectAll = () => {
    const currentPageIds = currentRows.map((row) => row._id);
    setSelectedRows((prevSelected) => {
      if (currentPageIds.every((id) => prevSelected.includes(id))) {
        return prevSelected.filter((id) => !currentPageIds.includes(id));
      } else {
        return [...new Set([...prevSelected, ...currentPageIds])];
      }
    });
  };

  const handleLocalDeleteSelected = async () => {
    if (selectedRows.length === 0) return;
    await onDeleteSelected(selectedRows);
    setSelectedRows([]);
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "Cash In":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/80";
      case "Cash Out":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "Credit":
        return "bg-blue-50 text-blue-700 border-blue-200/80";
      case "Debit":
        return "bg-amber-50 text-amber-700 border-amber-200/80";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-2xs border border-slate-200 flex flex-col overflow-hidden">
      {/* Batch Delete Banner */}
      {selectedRows.length > 0 && (
        <div className="py-2.5 px-4 bg-rose-50 border-b border-rose-200 flex items-center justify-between shrink-0 animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-800">
            <FiTrash2 className="text-sm text-rose-600" />
            <span>{selectedRows.length} {selectedRows.length === 1 ? 'transaction' : 'transactions'} selected for deletion</span>
          </div>
          <button
            onClick={handleLocalDeleteSelected}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <span>Delete Permanently</span>
          </button>
        </div>
      )}

      {/* Internal Scrollable Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-380px)] min-h-[300px] custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200 select-none text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={currentRows.length > 0 && currentRows.every((row) => selectedRows.includes(row._id))}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3 w-[110px]">Date</th>
              <th className="py-3 px-3 w-[110px]">Type</th>
              <th className="py-3 px-3 w-[130px]">Category</th>
              <th className="py-3 px-3 w-[90px] text-center">Attachment</th>
              <th className="py-3 px-3 w-[120px] text-right">Amount</th>
              <th className="py-3 px-4 min-w-[200px]">Party & Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FiFileText className="text-2xl text-slate-300" />
                    <span className="text-sm font-medium text-slate-500">No transactions recorded in this ledger</span>
                    <span className="text-xs text-slate-400">Click &quot;Cash In&quot; or &quot;Cash Out&quot; above to add your first entry</span>
                  </div>
                </td>
              </tr>
            ) : (
              currentRows.map((entry) => (
                <tr
                  key={entry._id || entry.id}
                  className={`hover:bg-slate-50/70 cursor-pointer transition-colors ${
                    selectedRows.includes(entry._id || entry.id) ? 'bg-blue-50/30' : ''
                  }`}
                  onClick={() => handleRowClick(entry)}
                >
                  <td className="py-2.5 px-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(entry._id || entry.id)}
                      onChange={() => handleRowSelect(entry._id || entry.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {entry.date}
                  </td>
                  <td className="py-2.5 px-3 font-medium">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${getTypeBadge(entry.type)}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span className="truncate block max-w-[120px]" title={entry.category}>
                      {entry.category || "-"}
                    </span>
                  </td>
                  
                  <td className="py-2.5 px-3 text-center">
                    {(() => {
                      const filesArray = entry.files || entry.bills || [];
                      if (filesArray.length > 0) {
                        const firstFile = filesArray[0];
                        const fileName = typeof firstFile === 'string' ? firstFile : (firstFile.name || firstFile.filename || '');
                        const icon = getFileIcon(fileName);
                        return (
                          <div className="inline-flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-200">
                            <span title={fileName}>{icon}</span>
                            {filesArray.length > 1 && (
                              <span className="font-semibold text-slate-600">+{filesArray.length - 1}</span>
                            )}
                          </div>
                        );
                      }
                      return <span className="text-slate-300">-</span>;
                    })()}
                  </td>
                  
                  <td
                    className={`py-2.5 px-3 text-right font-mono font-semibold ${
                      entry.type === "Cash Out" || entry.type === "Debit"
                        ? "text-rose-600"
                        : entry.type === "Credit"
                        ? "text-blue-600"
                        : "text-emerald-600"
                    }`}
                  >
                    {typeof entry.amount === 'number' 
                      ? entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) 
                      : entry.amount}
                  </td>

                  <td className="py-2.5 px-4">
                    <div className="font-medium text-slate-900 truncate max-w-[240px]">
                      {entry.partyName || "-"}
                    </div>
                    {entry.remarks && (
                      <div className="text-[11px] text-slate-400 truncate max-w-[240px]">
                        {entry.remarks}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pinned Pagination Controls */}
      <div className="shrink-0 border-t border-slate-200 bg-slate-50/50">
        <Pagination
          totalRows={sortedTableData.length}
          rowsPerPage={rowsPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Details Modals */}
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
  tableData: PropTypes.array,
  updateEntry: PropTypes.func,
  onDeleteSelected: PropTypes.func,
};

export default Table;
