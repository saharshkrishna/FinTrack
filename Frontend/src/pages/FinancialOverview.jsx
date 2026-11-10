import { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import { AuthContext } from '../context/AuthContext';
import ReportModal from '../components/modal/ReportModal';
import NetworkErrorCard from '../components/common/NetworkErrorCard';
import OverviewHeader from '../components/overview/OverviewHeader';
import OverviewKpis from '../components/overview/OverviewKpis';
import OverviewCharts from '../components/overview/OverviewCharts';
import OverviewDiagnostics from '../components/overview/OverviewDiagnostics';
import { FiArrowLeft, FiPlusCircle, FiCalendar } from 'react-icons/fi';

// Helper to format Date object into local YYYY-MM-DD
const formatLocalDate = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const ACTIONABLE_CHECKLIST = [
  {
    id: 'act-1',
    title: 'Review top vendor terms for a 5-10% cost renegotiation',
    tag: 'Cost Cutting',
    due: 'Within 14 days',
  },
  {
    id: 'act-2',
    title: 'Follow up on overdue party credit receivables',
    tag: 'Liquidity',
    due: 'Immediate',
  },
  {
    id: 'act-3',
    title: 'Verify categorized receipts for tax-deductible expense tracking',
    tag: 'Compliance',
    due: 'Monthly',
  },
  {
    id: 'act-4',
    title: 'Audit recurring payment modes & negotiate digital transaction fees',
    tag: 'Banking',
    due: 'Quarterly',
  },
  {
    id: 'act-5',
    title: 'Maintain 30-day minimum operating cash runway',
    tag: 'Risk Safety',
    due: 'Ongoing',
  },
];

const FinancialOverview = () => {
  const navigate = useNavigate();
  const { transactions, loans, fetchAllData, loading, error } = useContext(DataContext);
  const { activeBusiness } = useContext(AuthContext);

  const [timeRange, setTimeRange] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [expenseCategoryScope, setExpenseCategoryScope] = useState('allOutflows');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Persistence of checklist progress per business
  const businessIdKey = activeBusiness?._id || activeBusiness?.id || 'default';
  const storageKey = `fintrack_checklist_${businessIdKey}`;

  const [checkedActions, setCheckedActions] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCheckedActions(saved ? JSON.parse(saved) : {});
    } catch {
      setCheckedActions({});
    }
  }, [storageKey]);

  const toggleAction = useCallback((id) => {
    setCheckedActions((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed saving checklist state:', e);
      }
      return updated;
    });
  }, [storageKey]);

  const handleResetChecklist = useCallback(() => {
    setCheckedActions({});
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Failed resetting checklist:', e);
    }
  }, [storageKey]);

  const currencySymbol = activeBusiness?.currency || '₹';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchAllData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Robust date filtering based on local dates
  const filteredTransactions = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];
    if (timeRange === 'all') return transactions;

    const now = new Date();
    const todayStr = formatLocalDate(now);
    let startDateStr = '';

    if (timeRange === 'month') {
      const y = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      startDateStr = `${y}-${m}-01`;
    } else if (timeRange === '30d') {
      const past30 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
      startDateStr = formatLocalDate(past30);
    } else if (timeRange === '6m') {
      const past6m = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      startDateStr = formatLocalDate(past6m);
    } else if (timeRange === 'year') {
      startDateStr = `${now.getFullYear()}-01-01`;
    }

    return transactions.filter((t) => {
      const tDate = (t.date || '').substring(0, 10);
      return tDate >= startDateStr && tDate <= todayStr;
    });
  }, [transactions, timeRange]);

  // Key Financial Performance Metrics
  const metrics = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;
    let credit = 0;
    let debit = 0;

    filteredTransactions.forEach((t) => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'Cash In') cashIn += amt;
      else if (t.type === 'Cash Out') cashOut += amt;
      else if (t.type === 'Credit') credit += amt;
      else if (t.type === 'Debit') debit += amt;
    });

    const netCashFlow = cashIn - cashOut;
    const netMargin = cashIn > 0 ? ((netCashFlow / cashIn) * 100).toFixed(1) : '0.0';
    const totalTurnover = cashIn + cashOut;
    const totalLoanDebt = (loans || []).reduce(
      (sum, l) => sum + (parseFloat(l.loanAmount) || 0),
      0
    );

    // Business Health Score (0 - 100)
    let healthScore = 50;
    if (filteredTransactions.length > 0) {
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
        healthScore = 35;
      }
    }
    healthScore = Math.max(10, Math.min(100, healthScore));

    // Approximate monthly burn rate
    const uniqueMonthsCount = new Set(
      filteredTransactions.map((t) => (t.date ? t.date.substring(0, 7) : ''))
    ).size;
    const monthsDivider = Math.max(1, uniqueMonthsCount);
    const monthlyBurnRate = cashOut / monthsDivider;

    // Inflow to Outflow ratio
    const inflowOutflowRatio = cashOut > 0 ? (cashIn / cashOut).toFixed(2) : cashIn > 0 ? '∞' : '0.00';

    // Runway estimation
    const runwayMonths = netCashFlow > 0 && monthlyBurnRate > 0
      ? (netCashFlow / monthlyBurnRate).toFixed(1)
      : null;

    return {
      cashIn,
      cashOut,
      credit,
      debit,
      netCashFlow,
      netMargin,
      totalTurnover,
      totalLoanDebt,
      healthScore,
      monthlyBurnRate,
      inflowOutflowRatio,
      runwayMonths,
    };
  }, [filteredTransactions, loans]);

  // Outflow Expenses by Category (Supports All Outflows vs Cash Out only)
  const categoryExpenseData = useMemo(() => {
    const map = {};
    filteredTransactions
      .filter((t) => {
        if (expenseCategoryScope === 'cashOutOnly') return t.type === 'Cash Out';
        return t.type === 'Cash Out' || t.type === 'Debit';
      })
      .forEach((t) => {
        const rawCat =
          typeof t.category === 'object' && t.category !== null
            ? t.category.category || t.category.name
            : t.category;
        const cat = rawCat && String(rawCat).trim() ? String(rawCat).trim() : 'Uncategorized';
        const amt = parseFloat(t.amount) || 0;
        map[cat] = (map[cat] || 0) + amt;
      });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, expenseCategoryScope]);

  // Cash Flow & Liquidity Composition
  const flowBreakdownData = useMemo(() => {
    const items = [
      { name: 'Cash In (Inflow)', value: metrics.cashIn, color: '#10B981' },
      { name: 'Cash Out (Outflow)', value: metrics.cashOut, color: '#EF4444' },
      { name: 'Credit (Receivables)', value: metrics.credit, color: '#3B82F6' },
      { name: 'Debit (Payables)', value: metrics.debit, color: '#F59E0B' },
    ];
    return items.filter((item) => item.value > 0);
  }, [metrics]);

  // Payment Modes Distribution
  const paymentModeData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((t) => {
      const rawMode =
        typeof t.paymentMode === 'object' && t.paymentMode !== null
          ? t.paymentMode.paymentMode || t.paymentMode.name
          : t.paymentMode;
      const mode = rawMode && String(rawMode).trim() ? String(rawMode).trim() : 'Cash';
      const amt = parseFloat(t.amount) || 0;
      map[mode] = (map[mode] || 0) + amt;
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Monthly Inflow vs Outflow Trajectory
  const monthlyTrendData = useMemo(() => {
    const monthMap = {};

    filteredTransactions.forEach((t) => {
      if (!t.date) return;
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthKey, cashIn: 0, cashOut: 0, net: 0 };
      }
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'Cash In') {
        monthMap[monthKey].cashIn += amt;
      } else if (t.type === 'Cash Out') {
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

  // Top Counterparties / Partners by Volume
  const topPartyData = useMemo(() => {
    const map = {};
    filteredTransactions.forEach((t) => {
      const rawParty =
        typeof t.partyName === 'object' && t.partyName !== null
          ? t.partyName.partyName || t.partyName.name
          : t.partyName;
      const party = rawParty && String(rawParty).trim() ? String(rawParty).trim() : 'Direct / Self';
      const amt = parseFloat(t.amount) || 0;
      map[party] = (map[party] || 0) + amt;
    });

    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [filteredTransactions]);

  // Strategic AI Business Advice
  const businessAdvice = useMemo(() => {
    if (filteredTransactions.length === 0) {
      return [
        {
          type: 'info',
          category: 'Data Requirement',
          title: 'Awaiting Financial Records',
          description: `No transactions were recorded in the selected horizon (${timeRange}). Insights will dynamically generate once entries are logged.`,
          action: 'Record transactions in Expense Book or switch to "All Time" to view full lifetime analytics.',
          impact: 'Info',
        },
      ];
    }

    const suggestions = [];
    const { cashIn, cashOut, netCashFlow, credit, totalLoanDebt, netMargin, monthlyBurnRate } = metrics;

    // 1. Cash Flow & Burn Rate Analysis
    if (cashOut > cashIn) {
      suggestions.push({
        type: 'warning',
        category: 'Cash Flow & Runway',
        title: 'Negative Operating Cash Flow Detected',
        description: `Your cash outflows (${currencySymbol}${cashOut.toLocaleString()}) exceed inflows (${currencySymbol}${cashIn.toLocaleString()}) by ${currencySymbol}${Math.abs(netCashFlow).toLocaleString()}. You are operating at a net deficit for this period.`,
        action: 'Pause non-essential capital expenses, prioritize high-margin invoices, and expedite accounts receivable collection.',
        impact: 'High Impact',
      });
    } else if (cashIn > 0 && parseFloat(netMargin) < 10) {
      suggestions.push({
        type: 'info',
        category: 'Margin Optimization',
        title: 'Slim Operating Profit Margin',
        description: `Current net cash margin is ${netMargin}%. While in the green, unexpected expenses could pressure liquidity.`,
        action: 'Review product/service pricing elasticity or target a 3-5% margin improvement on leading sales categories.',
        impact: 'Medium Impact',
      });
    } else if (cashIn > 0 && parseFloat(netMargin) >= 20) {
      suggestions.push({
        type: 'success',
        category: 'Growth & Surplus',
        title: 'Healthy Cash Flow Margin',
        description: `Your business retains a solid ${netMargin}% net cash margin (${currencySymbol}${netCashFlow.toLocaleString()} surplus).`,
        action: 'Consider deploying surplus working capital into interest-yielding short deposits or growth reinvestment.',
        impact: 'Strategic',
      });
    }

    // 2. Dominant Expense Concentration
    if (categoryExpenseData.length > 0 && cashOut > 0) {
      const topCat = categoryExpenseData[0];
      const topPct = ((topCat.value / cashOut) * 100).toFixed(1);
      if (parseFloat(topPct) >= 35) {
        suggestions.push({
          type: 'warning',
          category: 'Cost Concentration',
          title: `High Expense Concentration in "${topCat.name}"`,
          description: `"${topCat.name}" accounts for ${topPct}% (${currencySymbol}${topCat.value.toLocaleString()}) of all operating expenses.`,
          action: `Initiate supplier renegotiations, seek volume discounts, or solicit competitive quotes for ${topCat.name}.`,
          impact: 'High Impact',
        });
      } else {
        suggestions.push({
          type: 'success',
          category: 'Cost Structure',
          title: 'Balanced Expense Distribution',
          description: `Expenses are diversified well across ${categoryExpenseData.length} categories, with no single bucket exceeding 35% of total outflow.`,
          action: 'Continue quarterly monitoring of recurring utility and vendor charges to sustain healthy allocation.',
          impact: 'Maintenance',
        });
      }
    }

    // 3. Receivables & Credit Management
    if (credit > 0 && cashIn > 0) {
      const creditRatio = ((credit / cashIn) * 100).toFixed(1);
      if (parseFloat(creditRatio) >= 30) {
        suggestions.push({
          type: 'warning',
          category: 'Credit Receivables',
          title: 'Elevated Credit Exposure',
          description: `Outstanding credit receivables (${currencySymbol}${credit.toLocaleString()}) represent ${creditRatio}% of revenue.`,
          action: 'Introduce automated settlement reminders, offer a 2% prompt discount, and cap new credit terms to 15 days.',
          impact: 'Quick Win',
        });
      } else {
        suggestions.push({
          type: 'info',
          category: 'Credit Health',
          title: 'Managed Credit Receivables',
          description: `Credit exposure stands at ${currencySymbol}${credit.toLocaleString()} (${creditRatio}% of cash inflow).`,
          action: 'Maintain strict customer credit vetting for terms exceeding 30 days.',
          impact: 'Maintenance',
        });
      }
    }

    // 4. Debt & Liabilities
    if (totalLoanDebt > 0) {
      const debtRatio = cashIn > 0 ? ((totalLoanDebt / cashIn) * 100).toFixed(0) : 'N/A';
      suggestions.push({
        type: 'info',
        category: 'Liabilities & Debt',
        title: `Active Loans Burden: ${currencySymbol}${totalLoanDebt.toLocaleString()}`,
        description: `Your enterprise currently carries ${currencySymbol}${totalLoanDebt.toLocaleString()} in registered loan liabilities (~${debtRatio}% of period revenue).`,
        action: 'Review loan amortizations. Pre-pay high-interest daily or monthly EMI loans first to mitigate cumulative interest costs.',
        impact: 'Medium Impact',
      });
    } else {
      suggestions.push({
        type: 'success',
        category: 'Balance Sheet',
        title: 'Zero Active Debt',
        description: 'Your enterprise has zero recorded external loan liabilities on the platform.',
        action: 'Maintain this debt-free status or leverage low-interest asset credit only for capital equipment yielding >15% ROI.',
        impact: 'Strategic',
      });
    }

    // 5. Emergency Working Capital Reserve Recommendation
    const recommendedReserve = Math.round(monthlyBurnRate * 3);
    if (recommendedReserve > 0) {
      suggestions.push({
        type: 'info',
        category: 'Resilience & Risk',
        title: 'Recommended 3-Month Liquidity Buffer',
        description: `Based on your average monthly operating expenditure (${currencySymbol}${Math.round(monthlyBurnRate).toLocaleString()}), an ideal 3-month safety cushion is ${currencySymbol}${recommendedReserve.toLocaleString()}.`,
        action: 'Retain liquid capital in an accessible business account before issuing dividend distributions.',
        impact: 'Long Term',
      });
    }

    return suggestions;
  }, [filteredTransactions, metrics, categoryExpenseData, timeRange, currencySymbol]);

  // Offline / Error boundary
  if (error && (!transactions || transactions.length === 0)) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-2 text-xs font-semibold"
          >
            <FiArrowLeft className="text-base" /> Back to Expense Book
          </button>
        </div>
        <NetworkErrorCard
          title="Overview Analytics Unavailable"
          message={error || 'Could not retrieve transaction metrics due to a network or server communication error.'}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  const hasData = filteredTransactions.length > 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ─── 1. Header & Controls ─── */}
      <OverviewHeader
        activeBusiness={activeBusiness}
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRefreshing={isRefreshing}
        loading={loading}
        onRefresh={handleRefresh}
        onOpenReport={() => setIsReportModalOpen(true)}
        onBack={() => navigate('/')}
      />

      {/* ─── 2. Executive KPI Cards ─── */}
      <OverviewKpis
        metrics={metrics}
        currencySymbol={currencySymbol}
        hasData={hasData}
      />

      {/* Zero Transactions Banner (if timeRange has no entries) */}
      {!hasData && (
        <div className="bg-white rounded-2xl border border-amber-200/80 p-8 text-center shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FiCalendar className="text-2xl" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Transactions Found for &ldquo;{timeRange === 'month' ? 'This Month' : timeRange}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            There are no recorded transactions in this timeframe. Switch to &ldquo;All Time&rdquo; to review your full ledger history or log a new entry.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setTimeRange('all')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-all"
            >
              Switch to All Time
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
            >
              <FiPlusCircle className="text-sm" />
              <span>Record Transaction</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── 3. Visual Analytics Charts ─── */}
      {hasData && (
        <OverviewCharts
          activeTab={activeTab}
          currencySymbol={currencySymbol}
          categoryExpenseData={categoryExpenseData}
          flowBreakdownData={flowBreakdownData}
          paymentModeData={paymentModeData}
          monthlyTrendData={monthlyTrendData}
          topPartyData={topPartyData}
          expenseCategoryScope={expenseCategoryScope}
          onExpenseScopeChange={setExpenseCategoryScope}
        />
      )}

      {/* ─── 4. AI Strategic Diagnostics & Checklist ─── */}
      <OverviewDiagnostics
        activeTab={activeTab}
        metrics={metrics}
        businessAdvice={businessAdvice}
        actionableChecklist={ACTIONABLE_CHECKLIST}
        checkedActions={checkedActions}
        toggleAction={toggleAction}
        onResetChecklist={handleResetChecklist}
        hasData={hasData}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};

export default FinancialOverview;
