import { useState, useContext, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../../context/DataContext";
import { AuthContext } from "../../context/AuthContext";
import { FiX, FiDownload, FiFilter, FiFileText, FiBarChart2, FiCalendar, FiLoader } from "react-icons/fi";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

// Color palette for charts
const CHART_COLORS = [
  "#10B981", "#EF4444", "#3B82F6", "#F59E0B",
  "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"
];

const TYPE_COLORS = {
  "Cash In": "#10B981",
  "Cash Out": "#EF4444",
  "Credit": "#3B82F6",
  "Debit": "#F59E0B"
};

const ReportModal = ({ isOpen, onClose }) => {
  const { transactions, paymentModes } = useContext(DataContext);
  const { activeBusiness } = useContext(AuthContext);
  const chartsRef = useRef(null);

  // Filter state
  const [fileName, setFileName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedPaymentModes, setSelectedPaymentModes] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const transactionTypes = ["Cash In", "Cash Out", "Credit", "Debit"];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setShowPreview(false);
      setIsGenerating(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ─── Filter Logic ───
  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Date filter
    if (startDate) {
      filtered = filtered.filter((t) => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((t) => t.date <= endDate);
    }

    // Type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((t) => selectedTypes.includes(t.type));
    }

    // Payment mode filter
    if (selectedPaymentModes.length > 0) {
      filtered = filtered.filter((t) => selectedPaymentModes.includes(t.paymentMode));
    }

    return filtered.sort((a, b) => (a.date > b.date ? 1 : -1));
  };

  const filteredData = getFilteredTransactions();

  // ─── Stats Computation ───
  const computeStats = () => {
    const totalCashIn = filteredData
      .filter((t) => t.type === "Cash In")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const totalCashOut = filteredData
      .filter((t) => t.type === "Cash Out")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const totalCredit = filteredData
      .filter((t) => t.type === "Credit")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const totalDebit = filteredData
      .filter((t) => t.type === "Debit")
      .reduce((s, t) => s + (t.amount || 0), 0);
    const grandTotal = filteredData.reduce((s, t) => s + (t.amount || 0), 0);
    const netBalance = totalCashIn - totalCashOut;

    return { totalCashIn, totalCashOut, totalCredit, totalDebit, grandTotal, netBalance };
  };

  const stats = computeStats();

  // ─── Chart Data ───
  const pieData = transactionTypes
    .map((type) => ({
      name: type,
      value: filteredData.filter((t) => t.type === type).reduce((s, t) => s + (t.amount || 0), 0),
    }))
    .filter((d) => d.value > 0);

  // Monthly trend data
  const monthlyData = (() => {
    const months = {};
    filteredData.forEach((t) => {
      const month = t.date?.substring(0, 7); // "YYYY-MM"
      if (!month) return;
      if (!months[month]) months[month] = { month, "Cash In": 0, "Cash Out": 0, "Credit": 0, "Debit": 0 };
      if (months[month][t.type] !== undefined) {
        months[month][t.type] += t.amount || 0;
      }
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  })();

  // Payment mode distribution
  const paymentModeData = (() => {
    const modes = {};
    filteredData.forEach((t) => {
      const mode = t.paymentMode || "Cash";
      modes[mode] = (modes[mode] || 0) + (t.amount || 0);
    });
    return Object.entries(modes).map(([name, value]) => ({ name, value }));
  })();

  // Category breakdown
  const categoryData = (() => {
    const cats = {};
    filteredData.forEach((t) => {
      const cat = t.category || "Uncategorized";
      cats[cat] = (cats[cat] || 0) + (t.amount || 0);
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  })();

  // ─── Toggle helpers ───
  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePaymentMode = (mode) => {
    setSelectedPaymentModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  // ─── PDF Generation ───
  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      let yPos = margin;

      // ──── HEADER ────
      // Header background
      pdf.setFillColor(15, 23, 42); // slate-900
      pdf.rect(0, 0, pageWidth, 42, "F");

      // Accent line
      pdf.setFillColor(59, 130, 246); // blue-500
      pdf.rect(0, 42, pageWidth, 1.5, "F");

      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text("Financial Report", margin, 18);

      // Business name
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      pdf.text(activeBusiness?.name || "FinTrack", margin, 27);

      // Date range
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184); // slate-400
      const dateRange = startDate && endDate
        ? `${startDate} to ${endDate}`
        : startDate
        ? `From ${startDate}`
        : endDate
        ? `Until ${endDate}`
        : "All Time";
      pdf.text(`Period: ${dateRange}`, margin, 34);

      // Generated date (right aligned)
      const genDate = new Date().toLocaleDateString("en-IN", {
        year: "numeric", month: "long", day: "numeric"
      });
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Generated: ${genDate}`, pageWidth - margin, 34, { align: "right" });

      yPos = 52;

      // ──── SUMMARY CARDS ────
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Summary Overview", margin, yPos);
      yPos += 8;

      const cardWidth = (pageWidth - margin * 2 - 12) / 3;
      const cardHeight = 24;
      const cards = [
        { label: "Cash In", value: stats.totalCashIn, color: [16, 185, 129] },
        { label: "Cash Out", value: stats.totalCashOut, color: [239, 68, 68] },
        { label: "Credit", value: stats.totalCredit, color: [59, 130, 246] },
        { label: "Debit", value: stats.totalDebit, color: [245, 158, 11] },
        { label: "Net Balance", value: stats.netBalance, color: stats.netBalance >= 0 ? [16, 185, 129] : [239, 68, 68] },
        { label: "Total Entries", value: filteredData.length, color: [139, 92, 246], isCount: true },
      ];

      cards.forEach((card, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = margin + col * (cardWidth + 6);
        const y = yPos + row * (cardHeight + 6);

        // Card background
        pdf.setFillColor(248, 250, 252); // slate-50
        pdf.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "F");

        // Left accent
        pdf.setFillColor(...card.color);
        pdf.rect(x, y + 3, 2.5, cardHeight - 6, "F");

        // Label
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139); // slate-500
        pdf.setFont("helvetica", "normal");
        pdf.text(card.label, x + 7, y + 9);

        // Value
        pdf.setFontSize(13);
        pdf.setTextColor(...card.color);
        pdf.setFont("helvetica", "bold");
        const displayValue = card.isCount
          ? card.value.toString()
          : `₹${card.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
        pdf.text(displayValue, x + 7, y + 19);
      });

      yPos += Math.ceil(cards.length / 3) * (cardHeight + 6) + 8;

      // ──── CHARTS ────
      if (chartsRef.current) {
        // Wait for charts to be fully rendered
        await new Promise((resolve) => setTimeout(resolve, 500));

        const canvas = await html2canvas(chartsRef.current, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - margin * 2;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Check if charts fit on current page
        if (yPos + imgHeight + 10 > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(13);
        pdf.setFont("helvetica", "bold");
        pdf.text("Statistical Analysis", margin, yPos);
        yPos += 6;

        pdf.addImage(imgData, "PNG", margin, yPos, imgWidth, imgHeight);
        yPos += imgHeight + 10;
      }

      // ──── TRANSACTION TABLE ────
      if (yPos + 40 > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("Transaction Details", margin, yPos);
      yPos += 6;

      const tableHeaders = [["#", "Date", "Type", "Category", "Party", "Payment Mode", "Amount", "Remarks"]];
      const tableRows = filteredData.map((t, i) => [
        (i + 1).toString(),
        t.date || "-",
        t.type || "-",
        t.category || "-",
        t.partyName || "-",
        t.paymentMode || "Cash",
        `₹${(t.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        (t.remarks || "-").substring(0, 30),
      ]);

      autoTable(pdf, {
        head: tableHeaders,
        body: tableRows,
        startY: yPos,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 7,
          cellPadding: 2.5,
          lineColor: [226, 232, 240],
          lineWidth: 0.3,
          textColor: [30, 41, 59],
        },
        headStyles: {
          fillColor: [15, 23, 42],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 7.5,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 8 },
          6: { halign: "right", fontStyle: "bold" },
          7: { cellWidth: 28 },
        },
        didParseCell: (data) => {
          // Color-code the Type column
          if (data.section === "body" && data.column.index === 2) {
            const type = data.cell.raw;
            if (type === "Cash In") data.cell.styles.textColor = [16, 185, 129];
            else if (type === "Cash Out") data.cell.styles.textColor = [239, 68, 68];
            else if (type === "Credit") data.cell.styles.textColor = [59, 130, 246];
            else if (type === "Debit") data.cell.styles.textColor = [245, 158, 11];
          }
          // Color-code the Amount column
          if (data.section === "body" && data.column.index === 6) {
            const rowIdx = data.row.index;
            const type = filteredData[rowIdx]?.type;
            if (type === "Cash In") data.cell.styles.textColor = [16, 185, 129];
            else if (type === "Cash Out") data.cell.styles.textColor = [239, 68, 68];
            else if (type === "Credit") data.cell.styles.textColor = [59, 130, 246];
            else if (type === "Debit") data.cell.styles.textColor = [245, 158, 11];
          }
        },
      });

      // ──── FOOTER on every page ────
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        // Footer line
        pdf.setDrawColor(226, 232, 240);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

        pdf.setFontSize(7);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont("helvetica", "normal");
        pdf.text("Generated by FinTrack", margin, pageHeight - 7);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
      }

      // ──── Save ────
      const safeName = (fileName || "FinTrack_Report").replace(/[^a-zA-Z0-9_\- ]/g, "");
      pdf.save(`${safeName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── Render ───
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[95vw] max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in">
        {/* ── Modal Header ── */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FiFileText className="text-blue-400 text-lg" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Generate Report</h2>
              <p className="text-slate-400 text-xs">Create a PDF report with filters and analytics</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-1 cursor-pointer">
            <FiX size={20} />
          </button>
        </div>

        {/* ── Modal Body ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* File Name Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <FiFileText className="text-slate-500" />
              Report File Name
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly_Report_Oct2026"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all bg-slate-50"
            />
          </div>

          {/* Filters Section */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-4">
              <FiFilter className="text-slate-500" />
              Report Filters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date Range */}
              <div className="space-y-3">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <FiCalendar size={12} />
                  Date Range
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Start Date</span>
                  </div>
                  <div className="flex items-start pt-2 text-slate-400 text-xs font-medium">to</div>
                  <div className="flex-1">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">End Date</span>
                  </div>
                </div>
              </div>

              {/* Transaction Type */}
              <div className="space-y-3">
                <label className="text-xs font-medium text-slate-600">Transaction Type</label>
                <div className="flex flex-wrap gap-2">
                  {transactionTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        selectedTypes.includes(type)
                          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: TYPE_COLORS[type] }}
                      />
                      {type}
                    </button>
                  ))}
                  {selectedTypes.length > 0 && (
                    <button
                      onClick={() => setSelectedTypes([])}
                      className="px-2 py-1.5 text-[10px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Payment Mode */}
              <div className="space-y-3 md:col-span-2">
                <label className="text-xs font-medium text-slate-600">Payment Mode</label>
                <div className="flex flex-wrap gap-2">
                  {(paymentModes || []).map((pm) => (
                    <button
                      key={pm._id || pm.paymentMode}
                      onClick={() => togglePaymentMode(pm.paymentMode)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                        selectedPaymentModes.includes(pm.paymentMode)
                          ? "border-purple-500 bg-purple-50 text-purple-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {pm.paymentMode}
                    </button>
                  ))}
                  {selectedPaymentModes.length > 0 && (
                    <button
                      onClick={() => setSelectedPaymentModes([])}
                      className="px-2 py-1.5 text-[10px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{filteredData.length}</span> of{" "}
                <span className="font-semibold text-slate-700">{transactions.length}</span> transactions
              </span>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              >
                <FiBarChart2 size={13} />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </button>
            </div>
          </div>

          {/* Preview Section with Charts */}
          {showPreview && filteredData.length > 0 && (
            <div ref={chartsRef} className="space-y-6 bg-white">
              {/* Stats Cards Preview */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Cash In", value: stats.totalCashIn, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
                  { label: "Cash Out", value: stats.totalCashOut, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
                  { label: "Credit", value: stats.totalCredit, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                  { label: "Debit", value: stats.totalDebit, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
                  { label: "Net Balance", value: stats.netBalance, color: stats.netBalance >= 0 ? "text-emerald-600" : "text-red-600", bg: "bg-slate-50", border: "border-slate-200" },
                  { label: "Total Entries", value: filteredData.length, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", isCount: true },
                ].map((card) => (
                  <div key={card.label} className={`${card.bg} ${card.border} border rounded-xl p-3`}>
                    <div className="text-[10px] font-medium text-slate-500 mb-1">{card.label}</div>
                    <div className={`text-base font-bold ${card.color}`}>
                      {card.isCount ? card.value : `₹${card.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-2 gap-5">
                {/* Pie Chart - Transaction Distribution */}
                {pieData.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h4 className="text-xs font-semibold text-slate-700 mb-3">Transaction Distribution</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Bar Chart - Payment Mode Distribution */}
                {paymentModeData.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <h4 className="text-xs font-semibold text-slate-700 mb-3">Payment Mode Breakdown</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={paymentModeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {paymentModeData.map((_, index) => (
                            <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Line Chart - Monthly Trend */}
                {monthlyData.length > 1 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-2">
                    <h4 className="text-xs font-semibold text-slate-700 mb-3">Monthly Trend</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                        <Legend wrapperStyle={{ fontSize: "10px" }} />
                        <Line type="monotone" dataKey="Cash In" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Cash Out" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Credit" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="Debit" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Category Breakdown */}
                {categoryData.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-4 col-span-2">
                    <h4 className="text-xs font-semibold text-slate-700 mb-3">Top Categories</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={categoryData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={90} />
                        <Tooltip formatter={(value) => `₹${value.toLocaleString("en-IN")}`} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {categoryData.map((_, index) => (
                            <Cell key={`cat-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm text-slate-500">No transactions match your filters.</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting the date range or filters above.</p>
            </div>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {filteredData.length} transactions will be included
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!showPreview) setShowPreview(true);
                // Wait for charts to render before generating
                await new Promise((r) => setTimeout(r, 800));
                generatePDF();
              }}
              disabled={isGenerating || filteredData.length === 0}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-sm cursor-pointer ${
                isGenerating || filteredData.length === 0
                  ? "bg-slate-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.97]"
              }`}
            >
              {isGenerating ? (
                <>
                  <FiLoader className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FiDownload />
                  Download PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ReportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ReportModal;
