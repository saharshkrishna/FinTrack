import PropTypes from 'prop-types';
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiActivity,
  FiShield,
  FiZap,
} from 'react-icons/fi';

const OverviewKpis = ({ metrics, currencySymbol = '₹', hasData = true }) => {
  const isProfitable = metrics.netCashFlow >= 0;

  return (
    <div className="space-y-3">
      {/* 6 Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Inflow */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Inflow</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiArrowUpRight className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-600 tracking-tight">
            {currencySymbol}
            {metrics.cashIn.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">Cash In & Revenue</div>
        </div>

        {/* Total Outflow */}
        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Outflow</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <FiArrowDownRight className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-rose-600 tracking-tight">
            {currencySymbol}
            {metrics.cashOut.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">Operating Expenses</div>
        </div>

        {/* Net Flow & Margin */}
        <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Net Flow</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isProfitable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              {isProfitable ? (
                <FiTrendingUp className="text-base" />
              ) : (
                <FiTrendingDown className="text-base" />
              )}
            </div>
          </div>
          <div
            className={`text-lg sm:text-xl font-bold tracking-tight ${
              isProfitable ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            {currencySymbol}
            {metrics.netCashFlow.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>Margin:</span>
            <span
              className={`font-semibold ${
                isProfitable ? 'text-emerald-700' : 'text-rose-600'
              }`}
            >
              {metrics.netMargin}%
            </span>
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
          <div className="text-lg sm:text-xl font-bold text-indigo-600 tracking-tight">
            {currencySymbol}
            {metrics.credit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">Customer Credit</div>
        </div>

        {/* Payables (Debit) */}
        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Payables</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <FiActivity className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-amber-600 tracking-tight">
            {currencySymbol}
            {metrics.debit.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">Pending Debits</div>
        </div>

        {/* Business Health Score */}
        <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Health Index</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FiShield className="text-base" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-purple-600 tracking-tight">
            {hasData ? `${metrics.healthScore}/100` : 'N/A'}
          </div>
          <div className="text-[11px] mt-1">
            {!hasData ? (
              <span className="text-slate-400">No Data Yet</span>
            ) : metrics.healthScore >= 75 ? (
              <span className="text-emerald-600 font-semibold">Solid Stability</span>
            ) : metrics.healthScore >= 50 ? (
              <span className="text-blue-600 font-semibold">Moderate Health</span>
            ) : (
              <span className="text-amber-600 font-semibold">Needs Attention</span>
            )}
          </div>
        </div>
      </div>

      {/* Auxiliary Financial Insights Strip */}
      {hasData && (
        <div className="bg-slate-50 border border-slate-200/70 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span className="text-slate-500 font-medium">Monthly Outflow Rate:</span>
            <span className="font-semibold text-slate-800">
              {currencySymbol}
              {Math.round(metrics.monthlyBurnRate || 0).toLocaleString()}/mo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-500 font-medium">Inflow/Outflow Ratio:</span>
            <span className="font-semibold text-slate-800">
              {metrics.inflowOutflowRatio}x
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span className="text-slate-500 font-medium">Active Loans:</span>
            <span className="font-semibold text-slate-800">
              {metrics.totalLoanDebt > 0
                ? `${currencySymbol}${metrics.totalLoanDebt.toLocaleString()}`
                : 'Zero Debt'}
            </span>
          </div>

          {metrics.runwayMonths && (
            <div className="flex items-center gap-1.5 text-blue-700 font-medium bg-blue-100/60 px-2.5 py-0.5 rounded-md">
              <FiZap className="text-xs" />
              <span>~{metrics.runwayMonths} Months Operating Runway</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

OverviewKpis.propTypes = {
  metrics: PropTypes.shape({
    cashIn: PropTypes.number.isRequired,
    cashOut: PropTypes.number.isRequired,
    credit: PropTypes.number.isRequired,
    debit: PropTypes.number.isRequired,
    netCashFlow: PropTypes.number.isRequired,
    netMargin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    totalTurnover: PropTypes.number.isRequired,
    totalLoanDebt: PropTypes.number.isRequired,
    healthScore: PropTypes.number.isRequired,
    monthlyBurnRate: PropTypes.number,
    inflowOutflowRatio: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    runwayMonths: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  currencySymbol: PropTypes.string,
  hasData: PropTypes.bool,
};

export default OverviewKpis;

