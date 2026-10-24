import { useState, useRef, useContext, useId } from "react";
import PropTypes from "prop-types";
import * as XLSX from "xlsx";
import { 
  FiUploadCloud, 
  FiFileText, 
  FiDownload, 
  FiTrash2, 
  FiCheck, 
  FiAlertCircle, 
  FiX, 
  FiPlus, 
  FiCheckCircle,
  FiFilter,
  FiRefreshCw
} from "react-icons/fi";
import { DataContext } from "../../context/DataContext";
import { toast } from "react-toastify";

const parseExcelDate = (val) => {
  if (!val && val !== 0) return new Date().toISOString().split("T")[0];
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      const year = val.getFullYear();
      const month = String(val.getMonth() + 1).padStart(2, "0");
      const day = String(val.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  if (typeof val === "number") {
    // Excel serial date code
    const parsedDate = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(parsedDate.getTime())) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  const str = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    } else if (parts[2].length === 4) {
      if (parseInt(parts[0], 10) > 12) {
        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
      if (parseInt(parts[1], 10) > 12) {
        return `${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`;
      }
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return new Date().toISOString().split("T")[0];
};

const parseExcelType = (val) => {
  if (!val) return "Cash Out";
  const str = String(val).trim().toLowerCase();
  if (str === "credit") return "Credit";
  if (str === "debit") return "Debit";
  if (str.includes("in") || str.includes("income") || str.includes("receive") || str === "cr") return "Cash In";
  if (str.includes("out") || str.includes("expense") || str.includes("pay") || str.includes("spend") || str === "dr") return "Cash Out";
  return "Cash Out";
};

const parseExcelAmount = (val) => {
  if (typeof val === "number") return Math.abs(val);
  if (!val) return "";
  const cleaned = String(val).replace(/[^0-9.-]+/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? "" : Math.abs(num);
};

const BulkEntryModal = ({ isOpen, onClose }) => {
  const { parties, categories, paymentModes, createBulkTransactions } = useContext(DataContext);
  const partyListId = useId();
  const categoryListId = useId();
  
  const [file, setFile] = useState(null);
  const [fileDetails, setFileDetails] = useState({ name: "", size: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [extractedRows, setExtractedRows] = useState([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "valid", "invalid"
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Validation function for a row
  const validateRow = (row) => {
    const errors = [];
    if (!row.date || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
      errors.push("Invalid date format (YYYY-MM-DD)");
    }
    if (!["Cash In", "Cash Out", "Credit", "Debit"].includes(row.type)) {
      errors.push("Invalid type (must be Cash In, Cash Out, Credit, or Debit)");
    }
    if (row.amount === "" || row.amount === null || isNaN(Number(row.amount)) || Number(row.amount) <= 0) {
      errors.push("Amount must be a positive number");
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const processWorkbook = (workbook) => {
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      toast.error("The uploaded spreadsheet is empty.");
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: "", cellDates: true });

    if (!rawData || rawData.length === 0) {
      toast.warning("No data found in the spreadsheet.");
      return;
    }

    // Determine column keys dynamically
    const firstRow = rawData[0];
    const keys = Object.keys(firstRow);

    const findKey = (patterns) => {
      return keys.find((k) => patterns.some((p) => p.test(k.trim())));
    };

    const dateKey = findKey([/^date$/i, /date/i, /day/i, /time/i]);
    const typeKey = findKey([/^type$/i, /type/i, /kind/i, /mode/i, /flow/i]);
    const amountKey = findKey([/^amount$/i, /amount/i, /amt/i, /total/i, /price/i, /value/i]);
    const partyKey = findKey([/party/i, /contact/i, /vendor/i, /customer/i, /name/i, /client/i]);
    const categoryKey = findKey([/category/i, /cat/i, /tag/i]);
    const paymentModeKey = findKey([/payment.*mode/i, /payment.*method/i, /mode/i, /method/i]);
    const remarksKey = findKey([/remark/i, /desc/i, /detail/i, /note/i, /memo/i]);

    const parsed = rawData.map((row, index) => {
      const rawDate = dateKey ? row[dateKey] : row["Date"] || row["date"];
      const rawType = typeKey ? row[typeKey] : row["Type"] || row["type"];
      const rawAmount = amountKey ? row[amountKey] : row["Amount"] || row["amount"];
      const rawParty = partyKey ? row[partyKey] : row["Party Name"] || row["Party"] || row["party"];
      const rawCategory = categoryKey ? row[categoryKey] : row["Category"] || row["category"];
      const rawPaymentMode = paymentModeKey ? row[paymentModeKey] : row["Payment Mode"] || row["PaymentMode"] || row["mode"];
      const rawRemarks = remarksKey ? row[remarksKey] : row["Remarks"] || row["Description"] || row["remarks"];

      const date = parseExcelDate(rawDate);
      const type = parseExcelType(rawType);
      const amount = parseExcelAmount(rawAmount);
      const partyName = rawParty ? String(rawParty).trim() : "";
      const category = rawCategory ? String(rawCategory).trim() : "";
      const paymentMode = rawPaymentMode ? String(rawPaymentMode).trim() : "Cash";
      const remarks = rawRemarks ? String(rawRemarks).trim() : "";

      const rowData = {
        id: `extracted-${index}-${Date.now()}`,
        date,
        type,
        amount,
        partyName,
        category,
        paymentMode,
        remarks,
      };

      const validation = validateRow(rowData);

      return {
        ...rowData,
        isValid: validation.isValid,
        errors: validation.errors
      };
    });

    setExtractedRows(parsed);
    // Auto-select all valid rows
    const initialSelected = new Set();
    parsed.forEach((r, idx) => {
      if (r.isValid) initialSelected.add(idx);
    });
    setSelectedRowIndices(initialSelected);
    toast.success(`Successfully extracted ${parsed.length} entries!`);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExt = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      toast.error("Please upload an Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    setFile(selectedFile);
    setFileDetails({
      name: selectedFile.name,
      size: (selectedFile.size / 1024).toFixed(1) + " KB"
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        processWorkbook(workbook);
      } catch (err) {
        console.error("Error parsing spreadsheet:", err);
        toast.error("Failed to parse the file. Please check its format.");
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Row editing handler
  const handleUpdateRow = (index, field, value) => {
    setExtractedRows((prev) => {
      const updated = [...prev];
      const targetRow = { ...updated[index], [field]: value };
      const validation = validateRow(targetRow);
      targetRow.isValid = validation.isValid;
      targetRow.errors = validation.errors;
      updated[index] = targetRow;
      return updated;
    });
  };

  // Delete row handler
  const handleDeleteRow = (index) => {
    setExtractedRows((prev) => prev.filter((_, i) => i !== index));
    setSelectedRowIndices((prev) => {
      const next = new Set();
      prev.forEach((idx) => {
        if (idx < index) next.add(idx);
        else if (idx > index) next.add(idx - 1);
      });
      return next;
    });
  };

  // Add new empty row
  const handleAddRow = () => {
    const newRow = {
      id: `extracted-new-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      type: "Cash Out",
      amount: "",
      partyName: "",
      category: "",
      paymentMode: "Cash",
      remarks: "",
      isValid: false,
      errors: ["Amount must be a positive number"]
    };
    setExtractedRows((prev) => [newRow, ...prev]);
  };

  // Select all or deselect all
  const handleToggleSelectAll = () => {
    const visibleIndices = getFilteredRowIndices();
    const allSelected = visibleIndices.every((idx) => selectedRowIndices.has(idx));

    setSelectedRowIndices((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        visibleIndices.forEach((idx) => next.delete(idx));
      } else {
        visibleIndices.forEach((idx) => {
          if (extractedRows[idx].isValid) {
            next.add(idx);
          }
        });
      }
      return next;
    });
  };

  // Select only valid rows
  const handleSelectValidOnly = () => {
    const next = new Set();
    extractedRows.forEach((row, idx) => {
      if (row.isValid) next.add(idx);
    });
    setSelectedRowIndices(next);
  };

  // Toggle single row selection
  const handleToggleRow = (index) => {
    setSelectedRowIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Download Sample Template
  const handleDownloadSample = () => {
    const sampleData = [
      {
        "Date": "2026-01-15",
        "Type": "Cash In",
        "Amount": 5000,
        "Party Name": "Client A",
        "Category": "Sales",
        "Payment Mode": "Bank",
        "Remarks": "Advance payment"
      },
      {
        "Date": "2026-01-16",
        "Type": "Cash Out",
        "Amount": 1200,
        "Party Name": "Office Supplies Ltd",
        "Category": "Supplies",
        "Payment Mode": "Cash",
        "Remarks": "Stationery purchase"
      },
      {
        "Date": "2026-01-17",
        "Type": "Credit",
        "Amount": 850,
        "Party Name": "Vendor John",
        "Category": "Inventory",
        "Payment Mode": "UPI",
        "Remarks": "Goods received on credit"
      },
      {
        "Date": "2026-01-18",
        "Type": "Debit",
        "Amount": 450,
        "Party Name": "Utility Corp",
        "Category": "Utilities",
        "Payment Mode": "Online",
        "Remarks": "Electricity bill payment"
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BulkEntriesTemplate");
    XLSX.writeFile(wb, "FinTrack_Bulk_Entries_Template.xlsx");
    toast.info("Sample Excel template downloaded!");
  };

  // Reset file and data
  const handleReset = () => {
    setFile(null);
    setFileDetails({ name: "", size: 0 });
    setExtractedRows([]);
    setSelectedRowIndices(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Import to Database & Table
  const handleImportToTable = async () => {
    const selectedEntries = Array.from(selectedRowIndices)
      .map((idx) => extractedRows[idx])
      .filter((row) => row && row.isValid);

    if (selectedEntries.length === 0) {
      toast.warning("Please select at least one valid entry to import.");
      return;
    }

    try {
      setIsSubmitting(true);
      const cleanTransactions = selectedEntries.map((item) => ({
        type: item.type,
        date: item.date,
        amount: Number(item.amount),
        partyName: item.partyName || "",
        remarks: item.remarks || "",
        category: item.category || "",
        paymentMode: item.paymentMode || "Cash",
        files: []
      }));

      await createBulkTransactions(cleanTransactions);
      onClose();
      handleReset();
    } catch (err) {
      console.error("Bulk import failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to filter indices
  const getFilteredRowIndices = () => {
    return extractedRows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => {
        if (filterStatus === "valid" && !row.isValid) return false;
        if (filterStatus === "invalid" && row.isValid) return false;
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          row.remarks.toLowerCase().includes(q) ||
          row.partyName.toLowerCase().includes(q) ||
          row.category.toLowerCase().includes(q) ||
          row.amount.toString().includes(q) ||
          row.date.includes(q)
        );
      })
      .map(({ index }) => index);
  };

  const filteredIndices = getFilteredRowIndices();
  const totalCount = extractedRows.length;
  const validCount = extractedRows.filter((r) => r.isValid).length;
  const invalidCount = totalCount - validCount;

  // Selected amounts summary
  const selectedEntries = Array.from(selectedRowIndices).map((idx) => extractedRows[idx]).filter(Boolean);
  const totalSelectedCashIn = selectedEntries
    .filter((r) => r.type === "Cash In" && r.isValid)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const totalSelectedCashOut = selectedEntries
    .filter((r) => r.type === "Cash Out" && r.isValid)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] max-h-[92vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <FiUploadCloud className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Import Bulk Entries
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Excel & CSV
                </span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload your spreadsheet to extract, inspect, and import transactions into your table.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-xs"
              title="Download sample template"
            >
              <FiDownload />
              <span>Sample Template</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 overflow-hidden">
          {/* File Upload Dropzone (When no file or can re-upload) */}
          {!file ? (
            <div className="flex-1 min-h-0 flex items-center justify-center overflow-y-auto">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all w-full max-w-2xl ${
                  isDragging
                    ? "border-blue-500 bg-blue-50/80 scale-[0.99]"
                    : "border-gray-300 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                  <FiUploadCloud className="text-3xl" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Drag and drop your Excel or CSV file here
                </h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                  Supports <span className="font-medium text-gray-700">.xlsx</span>,{" "}
                  <span className="font-medium text-gray-700">.xls</span>, and{" "}
                  <span className="font-medium text-gray-700">.csv</span> formats. Columns like Date, Type, Amount, and Party will be automatically detected.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl shadow-sm transition-colors"
                  >
                    Browse Computer
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSample();
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 font-medium text-sm rounded-xl border border-gray-300 transition-colors flex items-center gap-2"
                  >
                    <FiDownload className="text-blue-600" />
                    Download Sample Template (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
              {/* File Info & Stats Banner (Fixed, non-scrolling) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-lg">
                    <FiFileText className="text-xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-800 text-sm truncate max-w-[240px] sm:max-w-md">
                        {fileDetails.name}
                      </span>
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                        {fileDetails.size}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      <span>Total: <b>{totalCount}</b> entries</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-medium">{validCount} valid</span>
                      {invalidCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-rose-600 font-medium">{invalidCount} need review</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <FiRefreshCw />
                    <span>Upload Different File</span>
                  </button>
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    <FiPlus />
                    <span>Add Row</span>
                  </button>
                </div>
              </div>

              {/* Filtering & Search Bar (Fixed, non-scrolling) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 shrink-0">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="Search extracted entries..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-3 pr-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white text-xs">
                    <button
                      onClick={() => setFilterStatus("all")}
                      className={`px-3 py-1.5 font-medium transition-colors ${
                        filterStatus === "all" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      All ({totalCount})
                    </button>
                    <button
                      onClick={() => setFilterStatus("valid")}
                      className={`px-3 py-1.5 font-medium transition-colors ${
                        filterStatus === "valid" ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Valid ({validCount})
                    </button>
                    <button
                      onClick={() => setFilterStatus("invalid")}
                      className={`px-3 py-1.5 font-medium transition-colors ${
                        filterStatus === "invalid" ? "bg-rose-600 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Errors ({invalidCount})
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                  <button
                    onClick={handleSelectValidOnly}
                    className="px-2.5 py-1 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    Select All Valid
                  </button>
                  <button
                    onClick={() => setSelectedRowIndices(new Set())}
                    className="px-2.5 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Interactive Extracted Data Table - Only this container scrolls */}
              <div className="flex-1 min-h-0 border border-gray-200 rounded-xl overflow-auto shadow-xs bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 sticky top-0 z-20 text-gray-700 select-none shadow-xs">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredIndices.length > 0 &&
                            filteredIndices.every((idx) => selectedRowIndices.has(idx))
                          }
                          onChange={handleToggleSelectAll}
                          className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-2 w-10 text-center font-semibold text-gray-500">#</th>
                      <th className="py-2.5 px-2 w-32 font-semibold">Date *</th>
                      <th className="py-2.5 px-2 w-28 font-semibold">Type *</th>
                      <th className="py-2.5 px-2 w-28 font-semibold">Amount *</th>
                      <th className="py-2.5 px-2 w-32 font-semibold">Category</th>
                      <th className="py-2.5 px-2 w-36 font-semibold">Party Name</th>
                      <th className="py-2.5 px-2 w-28 font-semibold">Payment Mode</th>
                      <th className="py-2.5 px-2 min-w-[140px] font-semibold">Remarks</th>
                      <th className="py-2.5 px-2 w-20 text-center font-semibold">Status</th>
                      <th className="py-2.5 px-2 w-10 text-center font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredIndices.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="py-8 text-center text-gray-400">
                          No entries match the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredIndices.map((originalIndex) => {
                        const row = extractedRows[originalIndex];
                        const isSelected = selectedRowIndices.has(originalIndex);

                        return (
                          <tr
                            key={row.id || originalIndex}
                            className={`transition-colors ${
                              !row.isValid
                                ? "bg-rose-50/40 hover:bg-rose-50/70"
                                : isSelected
                                ? "bg-blue-50/40 hover:bg-blue-50/70"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {/* Selection Checkbox */}
                            <td className="py-2 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleRow(originalIndex)}
                                className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>

                            {/* Index */}
                            <td className="py-2 px-2 text-center text-gray-400 font-mono text-[11px]">
                              {originalIndex + 1}
                            </td>

                            {/* Date Input */}
                            <td className="py-1.5 px-2">
                              <input
                                type="date"
                                value={row.date}
                                onChange={(e) => handleUpdateRow(originalIndex, "date", e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-hidden bg-white"
                              />
                            </td>

                            {/* Type Select */}
                            <td className="py-1.5 px-2">
                              <select
                                value={row.type}
                                onChange={(e) => handleUpdateRow(originalIndex, "type", e.target.value)}
                                className={`w-full px-2 py-1 text-xs font-medium border rounded focus:outline-hidden ${
                                  row.type === "Cash In"
                                    ? "text-emerald-700 border-emerald-200 bg-emerald-50/50"
                                    : row.type === "Cash Out"
                                    ? "text-rose-700 border-rose-200 bg-rose-50/50"
                                    : row.type === "Credit"
                                    ? "text-blue-700 border-blue-200 bg-blue-50/50"
                                    : "text-amber-700 border-amber-200 bg-amber-50/50"
                                }`}
                              >
                                <option value="Cash In">Cash In</option>
                                <option value="Cash Out">Cash Out</option>
                                <option value="Credit">Credit</option>
                                <option value="Debit">Debit</option>
                              </select>
                            </td>

                            {/* Amount Input */}
                            <td className="py-1.5 px-2">
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  placeholder="0.00"
                                  value={row.amount}
                                  onChange={(e) => handleUpdateRow(originalIndex, "amount", e.target.value)}
                                  className={`w-full px-2 py-1 text-xs font-semibold border rounded focus:outline-hidden ${
                                    row.amount === "" || Number(row.amount) <= 0
                                      ? "border-rose-400 bg-rose-50"
                                      : "border-gray-200 focus:border-blue-500"
                                  } ${
                                    row.type === "Cash In" || row.type === "Credit"
                                      ? "text-emerald-600"
                                      : "text-rose-600"
                                  }`}
                                />
                              </div>
                            </td>

                            {/* Category Input */}
                            <td className="py-1.5 px-2">
                              <input
                                type="text"
                                list={categoryListId}
                                placeholder="Category"
                                value={row.category}
                                onChange={(e) => handleUpdateRow(originalIndex, "category", e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-hidden bg-white"
                              />
                            </td>

                            {/* Party Name Input */}
                            <td className="py-1.5 px-2">
                              <input
                                type="text"
                                list={partyListId}
                                placeholder="Party Name"
                                value={row.partyName}
                                onChange={(e) => handleUpdateRow(originalIndex, "partyName", e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-hidden bg-white"
                              />
                            </td>

                            {/* Payment Mode */}
                            <td className="py-1.5 px-2">
                              <select
                                value={row.paymentMode}
                                onChange={(e) => handleUpdateRow(originalIndex, "paymentMode", e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-hidden bg-white"
                              >
                                <option value="Cash">Cash</option>
                                <option value="Online">Online</option>
                                <option value="UPI">UPI</option>
                                <option value="Bank">Bank</option>
                                <option value="Card">Card</option>
                                <option value="Cheque">Cheque</option>
                                {paymentModes?.map((pm) => {
                                  const modeName = typeof pm === "string" ? pm : pm.name;
                                  if (["Cash", "Online", "UPI", "Bank", "Card", "Cheque"].includes(modeName)) return null;
                                  return <option key={modeName} value={modeName}>{modeName}</option>;
                                })}
                              </select>
                            </td>

                            {/* Remarks */}
                            <td className="py-1.5 px-2">
                              <input
                                type="text"
                                placeholder="Optional note"
                                value={row.remarks}
                                onChange={(e) => handleUpdateRow(originalIndex, "remarks", e.target.value)}
                                className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:border-blue-500 focus:outline-hidden bg-white"
                              />
                            </td>

                            {/* Status Badge */}
                            <td className="py-2 px-2 text-center">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <FiCheckCircle className="text-xs" />
                                  Valid
                                </span>
                              ) : (
                                <span
                                  title={row.errors.join(", ")}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 cursor-help"
                                >
                                  <FiAlertCircle className="text-xs" />
                                  Error
                                </span>
                              )}
                            </td>

                            {/* Row Action */}
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleDeleteRow(originalIndex)}
                                className="text-gray-400 hover:text-rose-600 p-1 rounded transition-colors"
                                title="Remove this row"
                              >
                                <FiTrash2 className="text-sm" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Data Datalists for autocomplete */}
              <datalist id={partyListId}>
                {parties?.map((p) => (
                  <option key={p._id || p.id || p.name} value={p.name || p.partyName} />
                ))}
              </datalist>
              <datalist id={categoryListId}>
                {categories?.map((c) => (
                  <option key={c._id || c.id || c.name} value={c.name || c.category} />
                ))}
              </datalist>
            </div>
          )}
        </div>

        {/* Modal Footer (Fixed, non-scrolling) */}
        <div className="px-6 py-3.5 border-t border-gray-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {file ? (
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 w-full sm:w-auto">
              <span>
                Selected: <b className="text-gray-900">{selectedEntries.length}</b> entries
              </span>
              <span>•</span>
              <span className="text-emerald-600">
                Cash In: <b>{totalSelectedCashIn.toLocaleString()}</b>
              </span>
              <span>•</span>
              <span className="text-rose-600">
                Cash Out: <b>{totalSelectedCashOut.toLocaleString()}</b>
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              Need help? Download the sample template to see expected columns.
            </div>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors shadow-xs"
            >
              Cancel
            </button>
            {file && (
              <button
                type="button"
                onClick={handleImportToTable}
                disabled={isSubmitting || selectedEntries.length === 0}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <FiCheck />
                    <span>Import {selectedEntries.length} Entries into Table</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

BulkEntryModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BulkEntryModal;
