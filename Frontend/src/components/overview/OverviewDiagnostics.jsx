import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  FiAward,
  FiAlertTriangle,
  FiCheckCircle,
  FiActivity,
  FiCheckSquare,
  FiSquare,
  FiRotateCcw,
} from 'react-icons/fi';

const OverviewDiagnostics = ({
  activeTab = 'all',
  metrics,
  businessAdvice = [],
  actionableChecklist = [],
  checkedActions = {},
  toggleAction,
  onResetChecklist,
  hasData = true,
}) => {
  const [filterType, setFilterType] = useState('all');

  const showSection = activeTab === 'all' || activeTab === 'strategy';
  if (!showSection) return null;

  const filteredAdvice = businessAdvice.filter((item) => {
    if (filterType === 'warning') return item.type === 'warning';
    if (filterType === 'success') return item.type === 'success';
    if (filterType === 'info') return item.type === 'info';
    return true;
  });

  const completedCount = Object.values(checkedActions).filter(Boolean).length;
  const progressPercent = actionableChecklist.length > 0
    ? Math.round((completedCount / actionableChecklist.length) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute -right-24 -top-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-24 -bottom-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Header Strip with Health Score */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-900 shadow-lg shadow-amber-500/20">
              <FiAward className="text-xl font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Strategic Health & Improvement Diagnosis
                </h2>
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  AI Evaluator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted, automated findings tailored to your current operating revenue, cash margins, and spending patterns
              </p>
            </div>
          </div>

          {/* Health Score Pill */}
          <div className="flex items-center gap-3 bg-slate-800/90 border border-slate-700/80 px-4 py-2.5 rounded-2xl self-start sm:self-auto shadow-xs">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Overall Health
              </div>
              <div className="text-base font-bold text-white flex items-center gap-1.5">
                <span>{hasData ? `${metrics.healthScore} / 100` : 'N/A'}</span>
                {hasData && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-semibold ${
                      metrics.healthScore >= 75
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : metrics.healthScore >= 50
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {metrics.healthScore >= 75 ? 'Grade A' : metrics.healthScore >= 50 ? 'Grade B' : 'Grade C'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Advisory Filter Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 bg-slate-800/70 p-1 rounded-xl border border-slate-700/70 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Findings ({businessAdvice.length})
            </button>
            <button
              onClick={() => setFilterType('warning')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'warning'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Action Needed
            </button>
            <button
              onClick={() => setFilterType('success')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'success'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Strengths
            </button>
            <button
              onClick={() => setFilterType('info')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                filterType === 'info'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Risk & Planning
            </button>
          </div>
        </div>

        {/* Diagnostic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAdvice.length > 0 ? (
            filteredAdvice.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-800/60 hover:bg-slate-800/90 transition-all rounded-2xl p-5 border border-slate-700/60 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.type === 'warning'
                          ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                          : item.type === 'success'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {item.impact}
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors flex items-center gap-2">
                    {item.type === 'warning' && (
                      <FiAlertTriangle className="text-amber-400 shrink-0" />
                    )}
                    {item.type === 'success' && (
                      <FiCheckCircle className="text-emerald-400 shrink-0" />
                    )}
                    {item.type === 'info' && (
                      <FiActivity className="text-blue-400 shrink-0" />
                    )}
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
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs bg-slate-800/30 rounded-2xl border border-slate-700/40">
              No recommendations found for this category filter.
            </div>
          )}
        </div>

        {/* Action Items Checklist with Progress */}
        <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiCheckSquare className="text-blue-400" />
                <span>Immediate Tactical Action Items</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Check off high-leverage business enhancements to track operational completion
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-mono">
                {completedCount} of {actionableChecklist.length} ({progressPercent}%)
              </span>
              {completedCount > 0 && (
                <button
                  onClick={onResetChecklist}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  title="Reset all checked items"
                >
                  <FiRotateCcw className="text-xs" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Checklist Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {actionableChecklist.map((act) => {
              const isChecked = !!checkedActions[act.id];
              return (
                <button
                  key={act.id}
                  onClick={() => toggleAction(act.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-400 line-through'
                      : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700/70 text-slate-200'
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
                    <div className="font-medium leading-snug">{act.title}</div>
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
  );
};

OverviewDiagnostics.propTypes = {
  activeTab: PropTypes.string,
  metrics: PropTypes.shape({
    healthScore: PropTypes.number.isRequired,
  }).isRequired,
  businessAdvice: PropTypes.array,
  actionableChecklist: PropTypes.array,
  checkedActions: PropTypes.object,
  toggleAction: PropTypes.func.isRequired,
  onResetChecklist: PropTypes.func.isRequired,
  hasData: PropTypes.bool,
};

export default OverviewDiagnostics;

