import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../../context/DataContext";

const AddEntryModal = ({ entryType, onClose }) => {
  const { createCategory, createPaymentMode } = useContext(DataContext);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title = entryType === "category" ? "Add New Category" : "Add New Payment Mode";
  const placeholder = entryType === "category" ? "Enter category name" : "Enter payment mode";

  const handleSubmit = async () => {
    if (!newValue.trim()) {
      setError("Field cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      if (entryType === "category") {
        await createCategory({ category: newValue });
      } else if (entryType === "paymentMode") {
        await createPaymentMode({ paymentMode: newValue });
      }
      setNewValue("");
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to add. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <input
          type="text"
          placeholder={placeholder}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="w-full p-2 border rounded-lg mb-2"
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

AddEntryModal.propTypes = {
  entryType: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AddEntryModal;
