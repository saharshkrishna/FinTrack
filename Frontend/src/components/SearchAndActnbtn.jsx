import { useState } from "react";
import PropTypes from "prop-types";
import { FiSearch, FiPlus, FiMinus, FiArrowUpRight, FiArrowDownRight, FiCreditCard } from "react-icons/fi";
import LoanReModal from "./modal/LoanReModal";
import LoanModal from "./modal/LoanModal";
import CashinModal from "./modal/CashinModal";
import CashoutModal from "./modal/CashoutModal";
import CreditModal from "./modal/CreditModal";
import DebitModal from "./modal/DebitModal";

const Search = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="relative flex-1 min-w-[220px]">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
      <input
        type="text"
        placeholder="Search remarks, amount, party..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all shadow-2xs"
      />
    </div>
  );
};

Search.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

const Actnbtn = ({ addEntry }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleAddLoanRe = (entry) => {
    addEntry(entry);
    setIsModalOpen(false);
  };

  const handleAddLoan = (entry) => {
    addEntry(entry);
    setIsModalOpen(false);
  };

  const handleAddDebit = (entry) => {
    addEntry(entry);
    setIsModalOpen(false);
  };

  const handleAddCredit = (entry) => {
    addEntry(entry);
    setIsModalOpen(false);
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Secondary Accounting Actions */}
      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
        <button
          onClick={() => openModal("Credit")}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
          title="Record customer receivable / credit"
        >
          Credit
        </button>
        <button
          onClick={() => openModal("Debit")}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-md transition-colors cursor-pointer border-l border-slate-100"
          title="Record vendor payable / debit"
        >
          Debit
        </button>
        <button
          onClick={() => openModal("Loan")}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-md transition-colors cursor-pointer border-l border-slate-100"
          title="Record new loan"
        >
          Loan
        </button>
        <button
          onClick={() => openModal("LoanRe")}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 rounded-md transition-colors cursor-pointer border-l border-slate-100"
          title="Record loan repayment"
        >
          Loan Re
        </button>
      </div>

      {/* Primary Inflow & Outflow Actions */}
      <button
        onClick={() => openModal("Cash In")}
        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 active:scale-95 cursor-pointer"
        title="Add Cash Inflow entry"
      >
        <FiPlus className="text-xs" />
        <span>Cash In</span>
      </button>

      <button
        onClick={() => openModal("Cash Out")}
        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs flex items-center gap-1 active:scale-95 cursor-pointer"
        title="Add Cash Outflow entry"
      >
        <FiMinus className="text-xs" />
        <span>Cash Out</span>
      </button>

      {/* Entry Form Modals */}
      {isModalOpen && modalType === "Cash In" && (
        <CashinModal
          onClose={closeModal}
          type="Cash In"
          onSubmit={addEntry}
        />
      )}
      {isModalOpen && modalType === "Cash Out" && (
        <CashoutModal
          onClose={closeModal}
          type="Cash Out"
          onSubmit={addEntry}
        />
      )}
      {isModalOpen && modalType === "Credit" && (
        <CreditModal
          onClose={closeModal}
          type="Credit"
          onSubmit={handleAddCredit}
        />
      )}
      {isModalOpen && modalType === "Debit" && (
        <DebitModal
          onClose={closeModal}
          type="Debit"
          onSubmit={handleAddDebit}
        />
      )}
      {isModalOpen && modalType === "Loan" && (
        <LoanModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleAddLoan}
        />
      )}
      {isModalOpen && modalType === "LoanRe" && (
        <LoanReModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleAddLoanRe}
        />
      )}
    </div>
  );
};

Actnbtn.propTypes = {
  addEntry: PropTypes.func.isRequired,
};

const SearchAndActions = ({ addEntry, onSearch }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
      <Search onSearch={onSearch} />
      <Actnbtn addEntry={addEntry} />
    </div>
  );
};

SearchAndActions.propTypes = {
  addEntry: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

export default SearchAndActions;
