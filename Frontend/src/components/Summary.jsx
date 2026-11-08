import PropTypes from "prop-types";

const Summary = ({ tableData, filters }) => {
  // Calculate totals
  const dataSource = Array.isArray(filters) ? filters : (tableData || []);

  const totalLoanRe = dataSource
    .filter((entry) => entry.type === "LoanRe")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const debitEntries = dataSource.filter((entry) => entry.type === "Debit");
  const totalDebit = debitEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const creditEntries = dataSource.filter((entry) => entry.type === "Credit");
  const totalCredit = creditEntries.reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const totalLoan = dataSource
    .filter((entry) => entry.type === "Loan")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const totalCashIn = dataSource
    .filter((entry) => entry.type === "Cash In")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const totalCashOut = dataSource
    .filter((entry) => entry.type === "Cash Out")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const netBalance = totalCashIn - totalCashOut;

  const metrics = [
    {
      label: "Net Balance",
      value: netBalance,
      isPrimary: true,
      color: netBalance >= 0 ? "text-slate-950" : "text-rose-600",
      indicator: netBalance >= 0 ? "bg-blue-600" : "bg-rose-600"
    },
    {
      label: "Cash In",
      value: totalCashIn,
      color: "text-emerald-600",
      indicator: "bg-emerald-500"
    },
    {
      label: "Cash Out",
      value: totalCashOut,
      color: "text-rose-600",
      indicator: "bg-rose-500"
    },
    {
      label: "Credit",
      value: totalCredit,
      color: "text-blue-600",
      indicator: "bg-blue-500"
    },
    {
      label: "Debit",
      value: totalDebit,
      color: "text-slate-700",
      indicator: "bg-slate-400"
    },
    {
      label: "Loan",
      value: totalLoan,
      color: "text-slate-700",
      indicator: "bg-amber-500"
    },
    {
      label: "Loan Re",
      value: totalLoanRe,
      color: "text-emerald-600",
      indicator: "bg-emerald-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-5">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-xl border transition-all ${
            m.isPrimary
              ? "bg-white border-blue-200/90 shadow-2xs"
              : "bg-white border-slate-200/90 shadow-2xs hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
            <span>{m.label}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${m.indicator}`}></span>
          </div>
          <div className={`text-base font-bold font-mono tracking-tight truncate ${m.color}`}>
            {m.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </div>
  );
};

Summary.propTypes = {
  tableData: PropTypes.array,
  filters: PropTypes.array,
};

export default Summary;
