import { useState } from "react";
import PropTypes from "prop-types";
import { FiSearch } from "react-icons/fi";
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
    onSearch(value); // Pass the search term to the parent component
  };

  return (
    <div className="relative flex-grow">
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search by remark or amount..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-[300px] pl-10 pr-4 py-2 border rounded-lg"
      />
    </div>
  );
};

const Actnbtn = ({ addEntry }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // Track which modal is open

  const openModal = (type) => {
    setModalType(type); // Set the modal type
    setIsModalOpen(true); // Open the modal
  };

  const handleAddLoanRe = (entry) => {
    addEntry(entry); // Add the loan entry to the table
    setIsModalOpen(false); // Close the modal
  };

  const handleAddLoan = (entry) => {
    addEntry(entry); // Add the loan entry to the table
    setIsModalOpen(false); // Close the modal
  };

  const handleAddDebit = (entry) => {
    addEntry(entry); // Add the Debit entry to the table
    setIsModalOpen(false); // Close the modal
  };

  const handleAddCredit = (entry) => {
    console.log("Adding Credit Entry:", entry); // Debugging
    addEntry(entry); // Add the credit entry to the table
    setIsModalOpen(false); // Close the modal
  };

  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="flex gap-4">
      {/* LoanRe button */}
      <button
        onClick={() => openModal("LoanRe")} // Open Loan modal
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        LoanRe
      </button>

      {/* Loan button */}
      <button
        onClick={() => openModal("Loan")} // Open Loan modal
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Loan
      </button>

      {/* Debit button */}
      <button
        onClick={() => openModal("Debit")} // Open Debit modal
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Debit
      </button>

      {/* Credit button */}
      <button
        onClick={() => openModal("Credit")} // Open Credit modal
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Credit
      </button>

      {/* Cash In Button */}
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-lg"
        onClick={() => openModal("Cash In")}
      >
        Cash In
      </button>

      {/* Cash Out Button */}
      <button
        className="px-4 py-2 bg-red-600 text-white rounded-lg"
        onClick={() => openModal("Cash Out")}
      >
        Cash Out
      </button>

      {/* Modals */}
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
          type="Credit" // Pass the type prop
          onSubmit={handleAddCredit}
        />
      )}
      {isModalOpen && modalType === "Debit" && (
        <DebitModal
          onClose={closeModal}
          type="Debit" // Pass the type prop
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

const SearchAndActions = ({ addEntry,onSearch }) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Search onSearch={onSearch} />
      <Actnbtn addEntry={addEntry} />
    </div>
  );
};

SearchAndActions.propTypes = {
  addEntry: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
};

Actnbtn.propTypes = {
  addEntry: PropTypes.func.isRequired,

};

export default SearchAndActions;