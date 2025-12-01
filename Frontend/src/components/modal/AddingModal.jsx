import { useState, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { toast } from 'react-toastify';
import { DataContext } from "../../context/DataContext";

const AddEntryModal = ({ entryType, onClose }) => {
  const { categories, setCategories, paymentModes, setPaymentModes } = useContext(DataContext);
  const [newValue, setNewValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const title = entryType === "category" ? "Add New Category" : "Add New Payment Mode";
  const placeholder = entryType === "category" ? "Enter category name" : "Enter payment mode";

  const   handleSubmit = async () => {
    if (!newValue.trim()) {
      setError("Field cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      if (entryType === "category") {
        const response = await axios.post("http://localhost:5000/api/user/category", { category: newValue });
        console.log("Category Response:", response.data.newCategory);
        setCategories((prev) => [...prev, response.data.newCategory]); // Adds full object
        toast.success("Category added successfully");
      } else if (entryType === "paymentMode") {
        console.log("Sending payment mode:", { paymentMode: newValue });
        const response = await axios.post("http://localhost:5000/api/user/paymentMode", { paymentMode: newValue });
        console.log("Payment Mode Response:", response.data.newPaymentMode);
        setPaymentModes((prev) => [...prev, response.data.newPaymentMode]); // Adds full object
         toast.success("Payment mode added successfully");
      }

      setNewValue("");
      onClose();
    } catch (err) {
      console.error(err);
       toast.error("Failed to add category");
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
