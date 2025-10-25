import { useState,useContext } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../../context/DataContext";
import { FiX, FiPlus } from "react-icons/fi";
import AddingModal from "./AddingModal";
import PartyNameModal from "./PartyModal";

const CreditModal = ({ onClose, type, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split("T")[0],
    amount: initialData?.amount || "",
    partyName: initialData?.partyName || "",
    remarks: initialData?.remarks || "",
    category: initialData?.category || "",
    type: initialData?.type || type,
    
  });

  const [inputValue, setInputValue] = useState(initialData?.amount || "");
  const [calculatedValue, setCalculatedValue] = useState(initialData?.amount || "");
  const [error, setError] = useState("");
  const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);
  const [entryType, setEntryType] = useState("");
  const { parties, categories, loading, } = useContext(DataContext);
  const [ setParties] = useState([]);
  const [ setCategories] = useState([]);
  const [files, setFiles] = useState([]);

   if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
  
    // Append new files while avoiding duplicates
    setFiles((prevFiles) => {
      const existingNames = prevFiles.map((file) => file.name);
      const filteredFiles = selectedFiles.filter((file) => !existingNames.includes(file.name));
      return [...prevFiles, ...filteredFiles];
    });
  };

  const handleRemoveFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Handle amount input change
  const handleAmountChange = (e) => {
    const value = e.target.value;
  
    // Allow only numbers, arithmetic operators, and decimal points
    const validInputRegex = /^[0-9+\-*/().\s]*$/;
  
    if (!validInputRegex.test(value)) {
      return; // Reject invalid characters
    }
  
    setInputValue(value); // Always update input value
    setError(""); // Clear any previous errors
  
    // Prevent errors for incomplete expressions (e.g., "100+")
    if (/[+\-*/]$/.test(value)) {
      setCalculatedValue(""); // Clear calculated value until valid
      setFormData((prev) => ({
        ...prev,
        amount: value, // Keep raw input
      }));
      return;
    }
  
    try {
      const result = eval(value);
      if (!isNaN(result)) {
        setCalculatedValue(result);
        setFormData((prev) => ({
          ...prev,
          amount: result,
        }));
      }
    } catch (error) {
      setCalculatedValue(""); // Do not set "Invalid Expression" yet
      setFormData((prev) => ({
        ...prev,
        amount: value, // Store the raw expression
      }));
    }
    console.log("Input Value:", value);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (inputValue.startsWith("0") && inputValue.length > 1) {
      setError("Amount cannot start with zero.");
      return;
    }
  
    const updatedEntry = {
      id: initialData?._id || Date.now(),
      ...formData,
    };
  
    // If no files are selected, just submit the form data without files
    if (files.length === 0) {
      console.log("Submitting entry without files:", updatedEntry);
      onSubmit(updatedEntry);
      onClose();
      return;
    }
  
    // If files exist, submit them to the backend
    const formDataWithFiles = new FormData();
    formDataWithFiles.append("date", formData.date);
    formDataWithFiles.append("amount", formData.amount);
    formDataWithFiles.append("partyName", formData.partyName);
    formDataWithFiles.append("remarks", formData.remarks);
    formDataWithFiles.append("category", formData.category);
    formDataWithFiles.append("type", formData.type);
  
    files.forEach((file) => {
      formDataWithFiles.append("file", file);
    });
  
    try {
      const response = await fetch("http://localhost:5000/api/user/uploads", {
        method: "POST",
        body: formDataWithFiles,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "File upload failed.");
      }
  
      console.log("File upload response:", data);
  
      onSubmit({
        id: updatedEntry.id,
        ...formData,
        files: data.file ? data.file.map((file) => file) : [],
      });
  
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  
    onClose();
  };

  const handleAddParty = (newParty) => {
    setParties((prev) => [...prev, { partyName: newParty }]);
    setFormData((prev) => ({ ...prev, partyName: newParty }));
  };
  

  const handleOpenModal = (type) => {
    setEntryType(type); // Set entry type dynamically
    setIsAddingModalOpen(true);
  };
  
  const handleAddSuccess = (newEntry) => {
    if (entryType === "category") {
      setCategories((prev) => [...prev, newEntry]); // Update category list
    }
  };


  return (
    <div
  className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-40"
  onClick={onClose} // Close modal when clicking outside
>
  <div
    className="bg-white p-6 rounded-lg w-1/2"
    onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
  >
        <div className="sticky top-0 bg-white z-10 p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Credit
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-80px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

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



{/* File Upload & Save Button in One Row */}
<div className="flex justify-between items-center mt-4">
  
  {/* Attach Bills Section - Aligned Left */}
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

    {/* Show Number of Files Instead of Expanding Button */}
    {files.length > 0 && (
      <span className="text-sm text-gray-500 whitespace-nowrap">
        ({files.length} files selected)
      </span>
    )}
  </div>

  {/* Save Button - Aligned Right */}
  <div>
    <button
      type="submit"
      className="px-4 py-2 bg-green-600 text-white rounded-lg"
    >
      Save
    </button>
  </div>
</div>

{/* File List (Fixed Height to Prevent Button Movement) */}
<div className="mt-2 min-h-[40px]">
  {files.length > 0 && (
    <div className="flex flex-wrap gap-2">
      {files.map((file, index) => (
        <div key={index} className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
          <span className="text-sm text-gray-700 truncate max-w-[150px]">{file.name}</span>
          <button
            onClick={() => handleRemoveFile(index)}
            className="text-sm text-red-500 hover:underline"
          >
            ❌
          </button>
        </div>
      ))}
    </div>
  )}
</div>
          </form>
        </div>
      </div>

       {isPartyModalOpen && (
               <PartyNameModal
               onAddParty={handleAddParty}  // ✅ Pass function as a prop
               onClose={() => setIsPartyModalOpen(false)}
             />
            )}
      
      {isAddingModalOpen && (
            <AddingModal
              entryType={entryType} // ✅ Pass dynamically selected type
              onClose={() => setIsAddingModalOpen(false)}
              onSuccess={handleAddSuccess} // ✅ Handles both cases
            />
          )}
    </div>
  );
};

CreditModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(["Credit", "Debit"]).isRequired,
  initialData: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default CreditModal;