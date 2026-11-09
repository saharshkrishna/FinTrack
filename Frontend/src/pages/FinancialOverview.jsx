import { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DataContext } from "../context/DataContext";
import { AuthContext } from "../context/AuthContext";
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiAward,
  FiRefreshCw,
  FiArrowLeft,
  FiDownload,
  FiBriefcase,
  FiLayers,
  FiShield,
  FiCheckSquare,
  FiSquare
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import ReportModal from "../components/modal/ReportModal";
import NetworkErrorCard from "../components/common/NetworkErrorCard";

const PALETTE = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // rose
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#64748B"  // slate
];

const TIME_RANGES = [
  { label: "All Time", value: "all" },
  { label: "This Month", value: "month" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 6 Months", value: "6m" },
  { label: "This Year", value: "year" }
];

const FinancialOverview = () => {
  const navigate = useNavigate();
  const { transactions, loans, fetchAllData, loading, error } = useContext(DataContext);
  const { activeBusiness } = useContext(AuthContext);

  const [timeRange, setTimeRange] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [checkedActions, setCheckedActions] = useState({});

  const currencySymbol = activeBusiness?.currency || "₹";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAllData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const toggleAction = (id) => {
    setCheckedActions((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter transactions based on selected time range
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    if (timeRange === "all") return transactions;

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    let startDateStr = "";

    if (timeRange === "month") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      startDateStr = `${year}-${month}-01`;
    } else if (timeRange === "30d") {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      startDateStr = past30.toISOString().split("T")[0];
    } else if (timeRange === "6m") {
      const past6m = new Date(now);
      past6m.setMonth(now.getMonth() - 6);
      startDateStr = past6m.toISOString().split("T")[0];
    } else if (timeRange === "year") {
      startDateStr = `${now.getFullYear()}-01-01`;
    }

    return transactions.filter((t) => {
      const tDate = t.date || "";
      return tDate >= startDateStr && tDate <= todayStr;
    });
  }, [transactions, timeRange]);

  // Compute key metrics
  const metrics = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;
    let credit = 0;
    let debit = 0;

    filteredTransactions.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === "Cash In") cashIn += amt;
      else if (t.type === "Cash Out") cashOut += amt;
      else if (t.type === "Credit") credit += amt;
      else if (t.type === "Debit") debit += amt;
    });

    const netCashFlow = cashIn - cashOut;
    const netMargin = cashIn > 0 ? ((netCashFlow / cashIn) * 100).toFixed(1) : 0;
    const totalTurnover = cashIn + cashOut;

    // Total outstanding loans
    const totalLoanDebt = (loans || []).reduce((sum, l) => sum + (parseFloat(l.loanAmount) || 0), 0);

    // Business Health Score (0 - 100)
    let healthScore = 50;
    if (cashIn > 0) {
      if (netCashFlow >= 0) healthScore += 20;
      else healthScore -= 15;

      const marginNum = parseFloat(netMargin);
      if (marginNum > 20) healthScore += 15;
      else if (marginNum > 5) healthScore += 5;

      if (totalLoanDebt === 0) healthScore += 10;
      else if (totalLoanDebt < cashIn * 0.5) healthScore += 5;
      else healthScore -= 10;

      if (credit > cashIn * 0.5) healthScore -= 10;
      else healthScore += 5;
    } else {
      healthScore = 40;
    }
    healthScore = Math.max(10, Math.min(100, healthScore));

    return {
      cashIn,
      cashOut,
      credit,
      debit,
      netCashFlow,
      netMargin,
      totalTurnover,
      totalLoanDebt,
      healthScore
    };
  }, [filteredTransactions, loans]);

  // Pie Chart 1: Outflow Expenses by Category
  const categoryExpenseData = useMemo(() => {
    const map = {};
    filteredTransactions
      .filter((t) => t.type === "Cash Out")
      .forEach((t) => {
        const cat = t.category?.trim() || "Uncategorized";
        const amt = parseFloat(t.amount) || 0;
        map[cat] = (map[cat] || 0) + amt;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Pie Chart 2: Cash Flow & Turnover Structure
  const flowBreakdownData = useMemo(() => {
    const items = [
      { name: "Cash In (Inflow)", value: metrics.cashIn, color: "#10B981" },
      { name: "Cash Out (Outflow)", value: metrics.cashOut, color: "#EF4444" },
      { name: "Credit (Receivables)", value: metrics.credit, color: "#3B82F6" },
      { name: "Debit (Payables)", value: metrics.debit, color: "#F59E0B" }
    ];
    return items.filter((item) => item.value > 0);
  }, [metrics]);

  // Pie Chart 3: Payment Modes Split
  const paymentModeData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((t) => {
      const mode = t.paymentMode?.trim() || "Cash";
      const amt = parseFloat(t.amount) || 0;
      map[mode] = (map[mode] || 0) + amt;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Bar Graph 1: Monthly Inflow vs Outflow Trajectory
  const monthlyTrendData = useMemo(() => {
    const monthMap = {};

    filteredTransactions.forEach((t) => {
      if (!t.date) return;
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthKey, cashIn: 0, cashOut: 0, net: 0 };
      }
      const amt = parseFloat(t.amount) || 0;
      if (t.type === "Cash In") {
        monthMap[monthKey].cashIn += amt;
      } else if (t.type === "Cash Out") {
        monthMap[monthKey].cashOut += amt;
      }
    });

    const sortedMonths = Object.keys(monthMap).sort();
    return sortedMonths.map((m) => {
      const data = monthMap[m];
      data.net = data.cashIn - data.cashOut;
      return data;
    });
  }, [filteredTransactions]);

  // Bar Graph 2: Top Counterparties / Parties by Volume
  const topPartyData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((t) => {
      const party = t.partyName?.trim() || "Direct / Self";
      const amt = parseFloat(t.amount) || 0;
      map[party] = (map[party] || 0) + amt;
    });

    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [filteredTransactions]);

  // Dynamic Business Improvements & Health Diagnosis
  const businessAdvice = useMemo(() => {
    const suggestions = [];
    const { cashIn, cashOut, netCashFlow, credit, totalLoanDebt, netMargin } = metrics;

    // 1. Cash Flow & Burn Rate Analysis
    if (cashOut > cashIn) {
      suggestions.push({
        type: "warning",
        category: "Cash Flow & Runway",
        title: "Negative Operating Cash Flow Detected",
        description: `Your cash outflows (${currencySymbol}${cashOut.toLocaleString()}) exceed inflows (${currencySymbol}${cashIn.toLocaleString()}) by ${currencySymbol}${Math.abs(netCashFlow).toLocaleString()}. You are running at an operating deficit.`,
        action: "Immediate Action: Pause non-essential capital expenditures and expedite collections on outstanding customer invoices to avoid liquidity crunches.",
        impact: "High Impact"
      });
    } else if (cashIn > 0 && parseFloat(netMargin) < 10) {
      suggestions.push({
        type: "info",
        category: "Margin Optimization",
        title: "Slim Operating Profit Margin",
        description: `Current net cash margin is ${netMargin}%. While positive, sudden operational shocks could push the ledger into the red.`,
        action: "Conduct a price-elasticity review on key products/services or seek a 3-5% margin improvement on top-selling items.",
        impact: "Medium Impact"
      });
    } else if (cashIn > 0 && parseFloat(netMargin) >= 20) {
      suggestions.push({
        type: "success",
        category: "Growth & Surplus",
        title: "Healthy Cash Flow Margin",
        description: `Your business retains a solid ${netMargin}% net cash margin (${currencySymbol}${netCashFlow.toLocaleString()} surplus).`,
        action: "Consider deploying excess working capital into interest-yielding short-term deposits or reinvesting into customer acquisition.",
        impact: "Strategic"
      });
    }

    // 2. Dominant Expense Concentration
    if (categoryExpenseData.length > 0 && cashOut > 0) {
      const topCat = categoryExpenseData[0];
      const topPct = ((topCat.value / cashOut) * 100).toFixed(1);
      if (parseFloat(topPct) >= 35) {
        suggestions.push({
          type: "warning",
          category: "Cost Concentration",
          title: `High Expense Concentration in "${topCat.name}"`,
          description: `"${topCat.name}" constitutes ${topPct}% (${currencySymbol}${topCat.value.toLocaleString()}) of all operating expenses. Concentrated spending increases vulnerability to price increases.`,
          action: `Initiate supplier renegotiations, seek volume discounts, or solicit competitive quotes for ${topCat.name}.`,
          impact: "High Impact"
        });
      } else {
        suggestions.push({
          type: "success",
          category: "Cost Structure",
          title: "Balanced Expense Distribution",
          description: `Expenses are diversified well across ${categoryExpenseData.length} categories, with no single bucket exceeding 35% of total outflow.`,
          action: "Continue monitoring recurring utility and vendor charges quarterly to preserve healthy distribution.",
          impact: "Maintenance"
        });
      }
    }

    // 3. Receivables & Credit Management
    if (credit > 0 && cashIn > 0) {
      const creditRatio = ((credit / cashIn) * 100).toFixed(1);
      if (parseFloat(creditRatio) >= 30) {
        suggestions.push({
          type: "warning",
          category: "Credit Receivables",
          title: "Elevated Credit Exposure",
          description: `Outstanding credit receivables (${currencySymbol}${credit.toLocaleString()}) represent ${creditRatio}% of total revenue. Working capital is locked up in customer credit.`,
          action: "Introduce automated payment reminders, offer a 2% discount for prompt 10-day settlement, and cap credit terms to 15 days.",
          impact: "Quick Win"
        });
      } else {
        suggestions.push({
          type: "info",
          category: "Credit Health",
          title: "Managed Credit Receivables",
          description: `Credit exposure stands at ${currencySymbol}${credit.toLocaleString()} (${creditRatio}% of cash inflow), indicating healthy collections.`,
          action: "Maintain strict credit vetting for any new client accounts requesting credit terms above 30 days.",
          impact: "Maintenance"
        });
      }
    }

    // 4. Debt & Leverage
    if (totalLoanDebt > 0) {
      const debtRatio = cashIn > 0 ? ((totalLoanDebt / cashIn) * 100).toFixed(0) : "N/A";
      suggestions.push({
        type: "info",
        category: "Liabilities & Debt",
        title: `Active Loans Burden: ${currencySymbol}${totalLoanDebt.toLocaleString()}`,
        description: `Your enterprise currently carries ${currencySymbol}${totalLoanDebt.toLocaleString()} in registered loan liabilities (~${debtRatio}% of period revenue).`,
        action: "Evaluate loan interest schedules. Pre-pay high-interest daily or monthly EMI loans first to lower cumulative interest drag.",
        impact: "Medium Impact"
      });
    } else {
      suggestions.push({
        type: "success",
        category: "Balance Sheet",
        title: "Zero Active Debt",
        description: "Your business is debt-free with zero recorded external loan liabilities on the platform.",
        action: "Maintain this unencumbered position or leverage low-interest asset credit only for capital expenditures that yield >15% ROI.",
        impact: "Strategic"
      });
    }

    // 5. Emergency Working Capital Reserve Recommendation
    const monthlyBurn = filteredTransactions.length > 0 && monthlyTrendData.length > 0
      ? cashOut / monthlyTrendData.length
      : cashOut;
    const recommendedReserve = Math.round(monthlyBurn * 3);
    if (recommendedReserve > 0) {
      suggestions.push({
        type: "info",
        category: "Resilience & Risk",
        title: "Recommended 3-Month Liquidity Buffer",
        description: `Based on your average monthly operating expenditure (${currencySymbol}${Math.round(monthlyBurn).toLocaleString()}), an ideal 3-month safety cushion is ${currencySymbol}${recommendedReserve.toLocaleString()}.`,
        action: "Retain liquid funds in a secondary high-yield business account before issuing owner dividends.",
        impact: "Long Term"
      });
    }

    return suggestions;
  }, [metrics, categoryExpenseData, monthlyTrendData, filteredTransactions, currencySymbol]);

  // Actionable checklist based on business diagnosis
  const actionableChecklist = [
    {
      id: "act-1",
      title: "Review top vendor terms for a 5-10% cost renegotiation",
      tag: "Cost Cutting",
      due: "Within 14 days"
    },
    {
      id: "act-2",
      title: "Follow up on overdue party credit receivables",
      tag: "Liquidity",
      due: "Immediate"
    },
    {
      id: "act-3",
      title: "Verify categorized receipts for tax-deductible expense tracking",
      tag: "Compliance",
      due: "Monthly"
    },
    {
      id: "act-4",
      title: "Audit recurring payment modes & negotiate digital transaction fees",
      tag: "Banking",
      due: "Quarterly"
    },
    {
      id: "act-5",
      title: "Maintain 30-day minimum operating cash runway",
      tag: "Risk Safety",
      due: "Ongoing"
    }
  ];

  if (error && (!transactions || transactions.length === 0)) {
    return (
      <div className="space-y-6 pb-12">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
          >
            <FiArrowLeft className="text-base" /> Back to Expense Book
          </button>
        </div>
        <NetworkErrorCard
          title="Overview Analytics Unavailable"
          message={error || "Could not retrieve transaction metrics due to a network or server communication error."}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ─── Top Header & Controls ─── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Back to Expense Book"
          >
            <FiArrowLeft className="text-lg" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Financial Overview & Business Review
              </h1>
              {activeBusiness?.businessId && (
                <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                  {activeBusiness.businessId}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Comprehensive analytics, visual trajectory, and tactical business improvement suggestions for{" "}
              <span className="font-semibold text-slate-700">
                {activeBusiness?.name || "Active Ledger"}
              </span>
            </p>
          </div>
        </div>

        {/* Action Buttons & Time Horizon Selector */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  timeRange === range.value
                    ? "bg-white text-blue-600 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <FiRefreshCw className={`text-sm ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          </button>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
          >
            <FiDownload className="text-sm" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ─── Executive KPI Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Cash In */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Inflow</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiArrowUpRight className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600">
            {currencySymbol}{metrics.cashIn.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Cash In & Revenue</div>
        </div>

        {/* Total Cash Out */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Outflow</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <FiArrowDownRight className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600">
            {currencySymbol}{metrics.cashOut.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Operating Expenses</div>
        </div>

        {/* Net Cash Balance */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Net Flow</span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              metrics.netCashFlow >= 0 ? "bg-blue-50 text-blue-600" : "bg-rose-50 text-rose-600"
            }`}>
              {metrics.netCashFlow >= 0 ? <FiTrendingUp className="text-base" /> : <FiTrendingDown className="text-base" />}
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-bold ${
            metrics.netCashFlow >= 0 ? "text-slate-900" : "text-rose-600"
          }`}>
            {currencySymbol}{metrics.netCashFlow.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Margin: <span className="font-semibold text-slate-700">{metrics.netMargin}%</span>
          </div>
        </div>

        {/* Receivables (Credit) */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Receivables</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiDollarSign className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-indigo-600">
            {currencySymbol}{metrics.credit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Customer Credit</div>
        </div>

        {/* Payables (Debit) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Payables</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiActivity className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-600">
            {currencySymbol}{metrics.debit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pending Debits</div>
        </div>

        {/* Active Debt / Health */}
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Health Index</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiShield className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-purple-600">
            {metrics.healthScore}/100
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.healthScore >= 75 ? (
              <span className="text-emerald-600 font-semibold">Solid Stability</span>
            ) : metrics.healthScore >= 50 ? (
              <span className="text-blue-600 font-semibold">Moderate</span>
            ) : (
              <span className="text-amber-600 font-semibold">Needs Attention</span>
            )}
          </div>
        </div>
      </div>

      {/* ─── Visual Analytics Section 1: Pie Charts ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie 1: Expense Breakdown by Category */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FiPieChart className="text-blue-600" />
                <span>Expense Breakdown by Category</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Where your operational capital is spent
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {categoryExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenseData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryExpenseData.map((_, index) => (
                      <Cell key={`cat-${index}`} fill={PALETTE[index % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Amount"]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                No expense entries found for this duration
              </div>
            )}
          </div>
        </div>

        {/* Pie 2: Cash Flow Composition */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FiLayers className="text-emerald-600" />
                <span>Cash Flow Composition</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Ratio of inflows, outflows, and credit volume
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {flowBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={flowBreakdownData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {flowBreakdownData.map((entry, index) => (
                      <Cell key={`flow-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Amount"]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                No transactions recorded yet
              </div>
            )}
          </div>
        </div>

        {/* Pie 3: Payment Modes Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FiDollarSign className="text-purple-600" />
                <span>Payment Mode Channels</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Volume processed per payment method
            </p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {paymentModeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentModeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {paymentModeData.map((_, index) => (
                      <Cell key={`mode-${index}`} fill={PALETTE[(index + 3) % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Amount"]}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-slate-400 text-xs py-8">
                No payment mode records
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Visual Analytics Section 2: Bar Graphs ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Graph 1: Monthly Cash In vs Outflow Trajectory (2 Cols on desktop) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FiBarChart2 className="text-blue-600" />
              <span>Monthly Inflow vs Outflow Trajectory</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Side-by-side comparative timeline of cash coming in vs expenses going out
          </p>

          <div className="h-72 w-full">
            {monthlyTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip
                    formatter={(val, name) => [
                      `${currencySymbol}${Number(val).toLocaleString()}`,
                      name === "cashIn" ? "Cash In" : "Cash Out"
                    ]}
                  />
                  <Legend
                    formatter={(value) => (value === "cashIn" ? "Cash In (Revenue)" : "Cash Out (Expenses)")}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                  />
                  <Bar dataKey="cashIn" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="cashOut" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No monthly transactions recorded for this period
              </div>
            )}
          </div>
        </div>

        {/* Bar Graph 2: Top Counterparties / Parties by Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <FiBriefcase className="text-indigo-600" />
                <span>Top Counterparty Volumes</span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Major clients, suppliers, or transaction partners
            </p>
          </div>

          <div className="h-72 w-full">
            {topPartyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topPartyData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748B" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: "#475569" }}
                    width={85}
                  />
                  <Tooltip
                    formatter={(val) => [`${currencySymbol}${Number(val).toLocaleString()}`, "Total Volume"]}
                  />
                  <Bar dataKey="total" fill="#6366F1" radius={[0, 4, 4, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No counterparty records found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── SUGGESTING IMPROVEMENTS IN THE BUSINESS SECTION ─── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-24 -top-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-24 -bottom-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
                <FiAward className="text-xl font-bold" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Business Health & Strategic Improvement Suggestions</span>
                  <span className="text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                    AI Diagnostic
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Actionable, data-driven recommendations tailored specifically to your active cash flow and expense patterns
                </p>
              </div>
            </div>

            {/* Health Score Pill */}
            <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Health Rating</div>
                <div className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{metrics.healthScore} / 100</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                    metrics.healthScore >= 75
                      ? "bg-emerald-500/20 text-emerald-400"
                      : metrics.healthScore >= 50
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {metrics.healthScore >= 75 ? "A" : metrics.healthScore >= 50 ? "B" : "C"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Recommendation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {businessAdvice.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/60 hover:bg-slate-800/90 transition-all rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.type === "warning"
                        ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                        : item.type === "success"
                        ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                        : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                    }`}>
                      {item.impact}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                    {item.type === "warning" && <FiAlertTriangle className="text-amber-400 shrink-0" />}
                    {item.type === "success" && <FiCheckCircle className="text-emerald-400 shrink-0" />}
                    {item.type === "info" && <FiActivity className="text-blue-400 shrink-0" />}
                    <span>{item.title}</span>
                  </h3>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/50 bg-slate-900/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <div className="text-[11px] text-amber-300/90 font-medium flex items-start gap-1.5">
                    <span className="font-bold text-amber-400 shrink-0">Recommendation:</span>
                    <span>{item.action}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Items Checklist */}
          <div className="mt-8 bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FiCheckSquare className="text-blue-400" />
                  <span>Immediate Business Action Items Checklist</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Track and check off high-priority operational optimizations
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {Object.values(checkedActions).filter(Boolean).length} of {actionableChecklist.length} completed
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {actionableChecklist.map((act) => {
                const isChecked = !!checkedActions[act.id];
                return (
                  <button
                    key={act.id}
                    onClick={() => toggleAction(act.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 cursor-pointer ${
                      isChecked
                        ? "bg-emerald-950/20 border-emerald-500/40 text-slate-400 line-through"
                        : "bg-slate-800/70 hover:bg-slate-800 border-slate-700/70 text-slate-200"
                    }`}
                  >
                    <div className="mt-0.5 shrink-0 text-base">
                      {isChecked ? (
                        <FiCheckSquare className="text-emerald-400" />
                      ) : (
                        <FiSquare className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{act.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-blue-400 font-semibold">{act.tag}</span>
                        <span className="text-[10px] text-slate-500">• {act.due}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default FinancialOverview;
