import PropTypes from 'prop-types';
import { FiArrowLeft, FiRefreshCw, FiDownload } from 'react-icons/fi';

const TIME_RANGES = [
  { label: 'All Time', value: 'all' },
  { label: 'This Month', value: 'month' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'Last 6 Months', value: '6m' },
  { label: 'This Year', value: 'year' },
];

const VIEW_TABS = [
  { label: 'Full Overview', value: 'all' },
  { label: 'Cash Flow & Trends', value: 'trends' },
  { label: 'Expenses & Partners', value: 'expenses' },
  { label: 'AI Health & Strategy', value: 'strategy' },
];

const OverviewHeader = ({
  activeBusiness,
  timeRange,
  setTimeRange,
  activeTab,
  setActiveTab,
  isRefreshing,
  loading,
  onRefresh,
  onOpenReport,
  onBack,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
      {/* Top Line: Navigation, Business Meta, and Primary Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-2xs"
            title="Back to Expense Book"
          >
            <FiArrowLeft className="text-lg" />
          </button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Financial Overview & Business Review
              </h1>
              {activeBusiness?.businessId && (
                <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {activeBusiness.businessId}
                </span>
              )}
              {activeBusiness?.companyType && (
                <span className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                  {activeBusiness.companyType}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time analytics, cash flow trajectories, and tactical optimizations for{' '}
              <span className="font-semibold text-slate-700">
                {activeBusiness?.name || 'Active Ledger'}
              </span>
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={onRefresh}
            disabled={isRefreshing || loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh Data"
          >
            <FiRefreshCw className={`text-sm ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={onOpenReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all cursor-pointer"
          >
            <FiDownload className="text-sm" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Bottom Line: Time Horizon Filter & View Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
        {/* View Section Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
            View:
          </span>
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.value
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Time Horizon Filter */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 self-start lg:self-auto overflow-x-auto max-w-full">
          {TIME_RANGES.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                timeRange === range.value
                  ? 'bg-white text-blue-600 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

OverviewHeader.propTypes = {
  activeBusiness: PropTypes.object,
  timeRange: PropTypes.string.isRequired,
  setTimeRange: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  isRefreshing: PropTypes.bool,
  loading: PropTypes.bool,
  onRefresh: PropTypes.func.isRequired,
  onOpenReport: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};

export default OverviewHeader;

