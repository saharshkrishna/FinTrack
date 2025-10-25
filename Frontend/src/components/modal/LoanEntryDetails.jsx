import { useEffect } from "react";
import PropTypes from "prop-types";

const LoanEntryDetails = ({ isOpen, onClose, entry, onEdit }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen && entry) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, entry]);

  if (!isOpen || !entry) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-start z-50"
      onClick={onClose} // Close modal when clicking outside
    >
      <div
        className="bg-white w-1/2 h-full overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="flex items-center gap-1 font-medium">
              Loan Details
            </span>
            <span className="text-gray-500">{entry.date}</span>
            <span className="text-success bg-success-light p-1 rounded-full">
              ✓
            </span>
          </div>
          <div className="text-3xl font-medium text-gray-900">
            ₹{entry.amount}
          </div>
        </div>

        <div className="space-y-4">
          {/* Loan Amount */}
          <div>
            <label className="block text-gray-500 mb-1">Loan Amount</label>
            <div>₹{entry.amount}</div>
          </div>

          {/* Interest Rate */}
          <div>
            <label className="block text-gray-500 mb-1">Interest Rate</label>
            <div>{entry.interestRate}% per year</div>
          </div>

          {/* Loan Term */}
          <div>
            <label className="block text-gray-500 mb-1">Loan Term</label>
            <div>{entry.loanTerm} months</div>
          </div>

          {/* Monthly EMI */}
          <div>
            <label className="block text-gray-500 mb-1">Monthly EMI</label>
            <div>₹{entry.emi}</div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gray-500 mb-1">Due Date</label>
            <div>{entry.dueDate}</div>
          </div>

          {/* Party Name */}
          <div>
            <label className="block text-gray-500 mb-1">Party Name</label>
            <div>{entry.partyName}</div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-gray-500 mb-1">Remarks</label>
            <div>{entry.remarks}</div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-gray-500 mb-1">Payment Mode</label>
            <div>{entry.paymentMode}</div>
          </div>
        </div>

        <div className="my-6">
          <h3 className="text-base font-medium mb-4">Activities</h3>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                +
              </span>
              <div>
                <div>Created by {entry.createdBy}</div>
                <div className="text-gray-500 text-sm">
                  On {entry.createdAt}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                ✎
              </span>
              <div>
                <div>Last Updated by {entry.lastUpdatedBy}</div>
                <div className="text-gray-500 text-sm">
                  On {entry.lastUpdatedAt}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button className="flex items-center gap-2 text-danger px-4 py-2">
            <span>🗑</span>
            Delete
          </button>
          <div className="flex gap-2">
            <button
              className="py-2 px-4 border border-gray-200 rounded"
              onClick={() => onEdit(entry)}
            >
              <span>✎</span>
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

LoanEntryDetails.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entry: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
};

export default LoanEntryDetails;