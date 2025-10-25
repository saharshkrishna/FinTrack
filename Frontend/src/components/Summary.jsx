import PropTypes from "prop-types";

const Summary = ({ tableData, filters, }) => {
  console.log("Table Data in Summary:", tableData); // Debugging
  console.log("Filters in Summary:", filters); // Debugging

  // Calculate totals
  const totalLoanRe = filters
    .filter((entry) => entry.type === "LoanRe")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const debitEntries = tableData
  .filter((entry) => entry.type === "Debit");
  console.log("Debit Entries:", debitEntries); // Debugging
  const totalDebit = debitEntries
  .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);
  console.log("Total Debit:", totalDebit); // Debugging

  const creditEntries = tableData.filter((entry) => entry.type === "Credit");
  console.log("Credit Entries:", creditEntries); // Debugging
  const totalCredit = creditEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.amount || 0),
    0
  );
  console.log("Total Credit:", totalCredit);

  const totalLoan = filters
    .filter((entry) => entry.type === "Loan")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const cashInEntries = tableData
  .filter((entry) => entry.type === "Cash In");
  console.log("Cash In Entries:", cashInEntries); // Debugging
  const totalCashIn = filters
    .filter((entry) => entry.type === "Cash In")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const totalCashOut = filters
    .filter((entry) => entry.type === "Cash Out")
    .reduce((sum, entry) => sum + parseFloat(entry.amount || 0), 0);

  const netBalance = totalCashIn - totalCashOut;

  return (
    <div className="grid grid-cols-7 gap-[8px] mb-3">
      

      <div className="bg-white p-2 w-[130px] rounded-lg shadow-sm">
        <div className="text-[12.5px] text-gray-600 mb-1">Loan Re</div>
        <div className="text-[16px] font-semibold text-green-600">
          {totalLoanRe.toFixed(2)}
        </div>
      </div>

      <div className="bg-white p-2 w-[130px] rounded-lg shadow-sm">
        <div className="text-[12.5px] text-gray-600 mb-1">Loan</div>
        <div className="text-[16px] font-semibold text-red-600">
          {totalLoan.toFixed(2)}
        </div>
      </div>

      <div className="bg-white p-2 w-[130px] rounded-lg shadow-sm">
        <div className="text-[12.5px] text-gray-600 mb-1">Debit</div>
        <div className="text-[16px] font-semibold text-green-600">
          {totalDebit.toFixed(2)}
        </div>
      </div>

      <div className="bg-white p-2 w-[130px] rounded-lg shadow-sm">
        <div className="text-[12.5px] text-gray-600 mb-1">Credit</div>
        <div className="text-[16px] font-semibold text-blue-600">
          {totalCredit.toFixed(2)}
        </div>
      </div>


      <div className="bg-white p-2 w-[130px] rounded-lg shadow-sm">
        <div className="text-[12.5px] text-gray-600 mb-1">Cash In</div>
        <div className="text-[16px] font-semibold text-green-600">
          {totalCashIn.toFixed(2)}
        </div>
      </div>

      <div className="bg-white p-2 w-[130px] rounded-lg shadow-sm">
        <div className="text-[12.5px] text-gray-600 mb-1">Cash Out</div>
        <div className="text-[16px] font-semibold text-red-600">
          {totalCashOut.toFixed(2)}
        </div>
      </div>

      <div className="bg-white p-2 w-[130px] rounded-lg shadow-sm">
        <div className="text-[12.5px] text-gray-600 mb-1">Net Balance</div>
        <div className="text-[16px] font-semibold">{netBalance.toFixed(2)}</div>
      </div>
    </div>
  );
};

Summary.propTypes = {
  tableData: PropTypes.array,
  filters: PropTypes.array, // filters is an array of entries
};

Summary.defaultProps = {
  filters: [], // Default to an empty array
};

export default Summary;