import { useState, useContext } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../../context/DataContext";

const PartyNameModal = ({ onClose, onAddParty }) => {
  const [partyName, setPartyName] = useState("");
  const [phone, setPhone] = useState("");
  const [partyType, setPartyType] = useState("Supplier");
  const [error, setError] = useState("");
  const { createParty } = useContext(DataContext);

  // Function to add party and send it to backend
  const handleAddParty = async () => {
    if (!partyName || partyName.trim() === "") {
      setError("Party name cannot be empty.");
      return;
    }
  
    try {
      const newParty = await createParty({
        partyName: partyName.trim(), // Ensure no leading/trailing spaces
        phone: phone.trim() || "",   // Default empty string if no phone
        partyType,
      });
  
      // Pass the new party name to the parent
      onAddParty(newParty.partyName);
  
      setPartyName("");
      setPhone("");
      setPartyType("Supplier");
      setError("");
      onClose();
    } catch (error) {
      console.error("Error adding party:", error);
      if (error.response && error.response.data.message === "Party already exists") {
        setError("A party with this name already exists.");
      }
    }
  };

  // Close modal when clicking outside
  return (
    <div
      id="modal-overlay"
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div 
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Add Party</h2>
        <input
          type="text"
          placeholder="Enter Party Name"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          className="w-full p-2 border rounded-lg mb-2"
        />
        <input
          type="text"
          placeholder="Enter Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded-lg mb-2"
        />
        <select
          value={partyType}
          onChange={(e) => setPartyType(e.target.value)}
          className="w-full p-2 border rounded-lg mb-2"
        >
          <option value="Supplier">Supplier</option>
          <option value="Customer">Customer</option>
        </select>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleAddParty}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

PartyNameModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onAddParty: PropTypes.func.isRequired,
};

export default PartyNameModal;
