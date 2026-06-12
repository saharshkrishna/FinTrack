import { useState } from "react";
import PropTypes from "prop-types";
import { FiX, FiPlus } from "react-icons/fi";
import AddingModal from "./AddingModal";
import PartyNameModal from "./PartyModal";
import { useContext } from "react";
import { DataContext } from "../../context/DataContext";

const DebitModal = ({ onClose, type, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: type,
    date: new Date().toISOString().split("T")[0],
    // time: new Date().toLocaleTimeString("en-US", {
    //   hour: "2-digit",
    //   minute: "2-digit",
    //   hour12: true,
    // }),
    // ampm: new Date().getHours() >= 12 ? "PM" : "AM",
    amount: "",
    partyName: "",
    remarks: "",
    category: "",
    paymentMode: "Debit",
  });

  const [inputValue, setInputValue] = useState("");
  const [calculatedValue, setCalculatedValue] = useState("");
  const [error, setError] = useState("");
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [addingModalType, setAddingModalType] = useState(""); // 'category' or 'paymentMode'
  const { parties, categories } = useContext(DataContext);

  const handleAmountChange = (e) => {
    const value = e.target.value;

    if (value.startsWith("0") && value.length > 1) {
      setError("Amount cannot start with zero.");
      return;
    } else {
      setError("");
    }

    setInputValue(value);

    try {
      const result = eval(value);
      setCalculatedValue(result);
      setFormData((prev) => ({
        ...prev,
        amount: result,
      }));
    } catch (error) {
      setCalculatedValue(value);
      setFormData((prev) => ({
        ...prev,
        amount: value,
      }));
    }
  };

const [files, setFiles] = useState([]);

const handleFileChange = (e) => {
  const selectedFiles = Array.from(e.target.files);
  setFiles(selectedFiles);
};


  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputValue.startsWith("0") && inputValue.length > 1) {
      setError("Amount cannot start with zero.");
      return;
    }

    const entry = {
      id: Date.now(),
      ...formData,
    };
    onSubmit(entry);
    onClose();
  };

  const handleAddPartyName = (partyData) => {
    setParties((prev) => [...prev, partyData.partyName]);
    setFormData((prev) => ({
      ...prev,
      partyName: partyData.partyName,
    }));
  };

  const handleAddCategory = (newCategory) => {
    setCategories((prev) => [...prev, newCategory]);
    setFormData((prev) => ({
      ...prev,
      category: newCategory,
    }));
  };


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-40"
      onClick={onClose}
    >
      <div 
        className="bg-white p-4 sm:p-6 rounded-lg w-full sm:w-11/12 md:w-3/4 lg:w-1/2 max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Debit
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

       <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* <div className="flex space-x-4">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${
                  formData.type === "Credit" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, type: "Credit" }))}
              >
                Credit
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg ${
                  formData.type === "Debit" ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, type: "Debit" }))}
              >
                Debit
              </button>
            </div> */}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-3/4 p-2 border rounded-lg"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <div className="flex space-x-2">
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                  />
                  <select
                    value={formData.ampm}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ampm: e.target.value }))}
                    className="p-2 border rounded-lg"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="eg. 890 or 100 + 200*3"
                  value={inputValue}
                  onChange={handleAmountChange}
                  className="w-1/2 p-2 border rounded-lg"
                  required
                />
              </div>
              {error && <div className="mt-1 text-sm text-red-500">{error}</div>}
              {calculatedValue && (
                <div className="mt-1 text-md text-black-500">Calculated Amount: {calculatedValue}</div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
  {/* Party Name Selection */}
  <div>
    <label className="block text-sm font-medium text-gray-700">Party Name (Contact)</label>
    <div className="flex gap-2">
    <select
                  value={formData.partyName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partyName: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  {parties?.map((party, index) => (
          <option key={index} value={party.partyName}>
            {party.partyName}
                    </option>
                  ))}
              </select>
      <button
        type="button"
        onClick={() => setIsPartyModalOpen(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        <FiPlus />
      </button>
    </div>
  </div>

  {/* Category Selection */}
  <div>
    <label className="block text-sm font-medium text-gray-700">Category</label>
    <div className="flex gap-2">
    <select
                  value={formData.category}
                  placeholder="Add category"
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="">Select</option>
                  {categories?.map((categoryObj) => (
          <option key={categoryObj._id} value={categoryObj.category}>
            {categoryObj.category}
                    </option>
                  ))}
                </select>
                <button
        type="button"
        onClick={() => handleOpenModal("category")}
        
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        <FiPlus />
      </button>
    </div>
  </div>
  </div>

            <div>
              <label className="block text-sm font-small text-gray-700">Remarks</label>
              <textarea
                type="text"
                placeholder="e.g. Enter Details (Name, Bill No, Item Name, Quantity etc)"
                value={formData.remarks}
                onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                className="w-3/4 h-[100px] p-2 border rounded-lg"
              />
            </div>


<div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="fileInput"
                style={{ display: "none" }}
                onChange={handleFileChange}
                multiple
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shrink-0"
                onClick={() => document.getElementById("fileInput").click()}
              >
                📎 Attach Bills
              </button>
              {files.length > 0 && (
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  ({files.length} files selected)
                </span>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </form>

        {isPartyModalOpen && (
          <PartyNameModal
            onClose={() => setIsPartyModalOpen(false)}
            onAdd={handleAddPartyName}
          />
        )}

        {isAddingModalOpen && (
          <AddingModal
            title={`Add New ${addingModalType}`}
            placeholder={`Enter new ${addingModalType}`}
            onAdd={(newValue) => {
              if (addingModalType === "category") {
                handleAddCategory(newValue);
              }
              setIsAddingModalOpen(false);
            }}
            onClose={() => setIsAddingModalOpen(false)}
          />
        )}
      </div>
    </div>
    </div>
  );
};

DebitModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["Credit", "Debit"]).isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default DebitModal;