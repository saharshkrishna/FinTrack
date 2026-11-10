import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  FiPieChart,
  FiBarChart2,
  FiLayers,
  FiDollarSign,
  FiBriefcase,
  FiInfo
} from 'react-icons/fi';
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
} from 'recharts';

const PALETTE = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // rose
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#64748B'  // slate
];

// Rich, accurate custom tooltip for all Pie charts showing exact item name, value, and % share
const CustomPieTooltip = ({ active, payload, currencySymbol = '₹', total = 0, defaultLabel = 'Item' }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const name = data.name || data.payload?.name || data.payload?.payload?.name || defaultLabel;
    const value = Number(data.value) || 0;
    const color = data.payload?.fill || data.color || '#3B82F6';
    const percent = total > 0 ? ((value / total) * 100).toFixed(1) : null;

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-2xl border border-slate-700/80 text-xs z-50 pointer-events-none min-w-[170px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
            style={{ backgroundColor: color }}
          />
          <span className="font-semibold text-slate-100 text-xs truncate max-w-[160px]">
            {name}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 text-slate-300">
          <span className="font-bold text-white text-sm tracking-tight">
            {currencySymbol}{value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {percent !== null && (
            <span className="text-[11px] font-semibold bg-slate-800 text-blue-300 px-2 py-0.5 rounded-md border border-slate-700 shrink-0">
              {percent}%
            </span>
          )}
        </div>
      </div>
    );
  }
  return null;
};

CustomPieTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  currencySymbol: PropTypes.string,
  total: PropTypes.number,
  defaultLabel: PropTypes.string,
};

const OverviewCharts = ({
  activeTab = 'all',
  currencySymbol = '₹',
  categoryExpenseData = [],
  flowBreakdownData = [],
  paymentModeData = [],
  monthlyTrendData = [],
  topPartyData = [],
  expenseCategoryScope = 'allOutflows',
  onExpenseScopeChange
}) => {
  const showTrends = activeTab === 'all' || activeTab === 'trends';
  const showExpenses = activeTab === 'all' || activeTab === 'expenses';

  // Compute exact totals for percentage calculation on hover
  const totalCategoryExpense = useMemo(
    () => categoryExpenseData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
    [categoryExpenseData]
  );

  const totalFlowBreakdown = useMemo(
    () => flowBreakdownData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
    [flowBreakdownData]
  );

  const totalPaymentMode = useMemo(
    () => paymentModeData.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0),
    [paymentModeData]
  );

  if (!showTrends && !showExpenses) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ─── SECTION 1: Cash Flow & Trends ─── */}
      {showTrends && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <span>Cash Flow & Trajectory Trends</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Trend Comparative Bar Chart (2 columns on large screen) */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FiBarChart2 className="text-blue-600" />
                    <span>Monthly Inflow vs Outflow Trajectory</span>
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400">Monthly Comparative</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Side-by-side volume comparison of cash received vs expenses paid
                </p>
              </div>

              <div className="w-full" style={{ height: '270px', minHeight: '270px' }}>
                {monthlyTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={270} minWidth={280}>
                    <BarChart
                      data={monthlyTrendData}
                      margin={{ top: 10, right: 15, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)'
                        }}
                        formatter={(val, name) => [
                          `${currencySymbol}${(Number(val) || 0).toLocaleString()}`,
                          name === 'cashIn' ? 'Cash In (Inflow)' : 'Cash Out (Expenses)'
                        ]}
                      />
                      <Legend
                        formatter={(value) => (
                          <span className="text-slate-600 font-medium text-[11px]">
                            {value === 'cashIn' ? 'Inflow (Cash In)' : 'Outflow (Expenses)'}
                          </span>
                        )}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      />
                      <Bar dataKey="cashIn" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="cashOut" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <FiInfo className="text-xl mb-1 text-slate-300" />
                    <span>No monthly transactions found for this period</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cash Flow Structure Pie Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FiLayers className="text-emerald-600" />
                    <span>Cash Flow Composition</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  Ratio between inflows, outflows, and credit volume
                </p>
              </div>

              <div className="w-full flex items-center justify-center" style={{ height: '270px', minHeight: '270px' }}>
                {flowBreakdownData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={270} minWidth={280}>
                    <PieChart>
                      <Pie
                        data={flowBreakdownData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {flowBreakdownData.map((entry, index) => (
                          <Cell key={`flow-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <CustomPieTooltip
                            currencySymbol={currencySymbol}
                            total={totalFlowBreakdown}
                            defaultLabel="Flow Type"
                          />
                        }
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value) => (
                          <span className="text-slate-600 font-medium text-[11px]">{value}</span>
                        )}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <FiInfo className="text-xl mb-1 text-slate-300" />
                    <span>No flow data recorded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SECTION 2: Expenses & Counterparty Breakdown ─── */}
      {showExpenses && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
              <span>Expenses & Operational Breakdown</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Pie 1: Outflow Expenses by Category */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FiPieChart className="text-blue-600" />
                    <span>Expense by Category</span>
                  </h3>

                  {/* Scope filter: All Outflows vs Cash Out Only */}
                  {onExpenseScopeChange && (
                    <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => onExpenseScopeChange('allOutflows')}
                        className={`px-2 py-0.5 text-[10px] rounded-md transition-all cursor-pointer font-medium ${
                          expenseCategoryScope === 'allOutflows'
                            ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Includes Cash Out and Debit expenses"
                      >
                        All Outflows
                      </button>
                      <button
                        type="button"
                        onClick={() => onExpenseScopeChange('cashOutOnly')}
                        className={`px-2 py-0.5 text-[10px] rounded-md transition-all cursor-pointer font-medium ${
                          expenseCategoryScope === 'cashOutOnly'
                            ? 'bg-white text-blue-600 shadow-2xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Only Cash Out expenses"
                      >
                        Cash Out
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>Where operating capital was spent</span>
                  <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {categoryExpenseData.length} Categories
                  </span>
                </div>
              </div>

              <div className="w-full flex items-center justify-center" style={{ height: '240px', minHeight: '240px' }}>
                {categoryExpenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240} minWidth={260}>
                    <PieChart>
                      <Pie
                        data={categoryExpenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        nameKey="name"
                      >
                        {categoryExpenseData.map((_, index) => (
                          <Cell key={`cat-${index}`} fill={PALETTE[index % PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <CustomPieTooltip
                            currencySymbol={currencySymbol}
                            total={totalCategoryExpense}
                            defaultLabel="Category"
                          />
                        }
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value) => (
                          <span className="text-slate-600 font-medium text-[11px]">{value}</span>
                        )}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <FiInfo className="text-xl mb-1 text-slate-300" />
                    <span>No category expense data</span>
                  </div>
                )}
              </div>
            </div>

            {/* Pie 2: Payment Modes Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FiDollarSign className="text-purple-600" />
                    <span>Payment Channels</span>
                  </h3>
                  <span className="text-[11px] text-slate-600 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {paymentModeData.length} Modes
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Volume processed per payment method
                </p>
              </div>

              <div className="w-full flex items-center justify-center" style={{ height: '240px', minHeight: '240px' }}>
                {paymentModeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240} minWidth={260}>
                    <PieChart>
                      <Pie
                        data={paymentModeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                      >
                        {paymentModeData.map((_, index) => (
                          <Cell
                            key={`mode-${index}`}
                            fill={PALETTE[(index + 3) % PALETTE.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={
                          <CustomPieTooltip
                            currencySymbol={currencySymbol}
                            total={totalPaymentMode}
                            defaultLabel="Payment Mode"
                          />
                        }
                      />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value) => (
                          <span className="text-slate-600 font-medium text-[11px]">{value}</span>
                        )}
                        wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <FiInfo className="text-xl mb-1 text-slate-300" />
                    <span>No payment modes recorded</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bar 2: Top Counterparties by Volume */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between md:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <FiBriefcase className="text-indigo-600" />
                    <span>Top Counterparties</span>
                  </h3>
                  <span className="text-[11px] text-slate-600 font-semibold bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {topPartyData.length} Partners
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">
                  Leading clients, vendors, or suppliers
                </p>
              </div>

              <div className="w-full" style={{ height: '240px', minHeight: '240px' }}>
                {topPartyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240} minWidth={260}>
                    <BarChart
                      data={topPartyData}
                      layout="vertical"
                      margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: '#64748B' }}
                        tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fontSize: 11, fill: '#475569' }}
                        width={80}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                        formatter={(val) => [
                          `${currencySymbol}${(Number(val) || 0).toLocaleString()}`,
                          'Total Volume'
                        ]}
                      />
                      <Bar dataKey="total" fill="#6366F1" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                    <FiInfo className="text-xl mb-1 text-slate-300" />
                    <span>No counterparty records found</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OverviewCharts.propTypes = {
  activeTab: PropTypes.string,
  currencySymbol: PropTypes.string,
  categoryExpenseData: PropTypes.array,
  flowBreakdownData: PropTypes.array,
  paymentModeData: PropTypes.array,
  monthlyTrendData: PropTypes.array,
  topPartyData: PropTypes.array,
  expenseCategoryScope: PropTypes.string,
  onExpenseScopeChange: PropTypes.func,
};

export default OverviewCharts;
