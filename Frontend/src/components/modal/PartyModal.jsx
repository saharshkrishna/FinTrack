import { useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";

const PartyNameModal = ({ onClose, onAddParty }) => {
  const [partyName, setPartyName] = useState("");
  const [phone, setPhone] = useState("");
  const [partyType, setPartyType] = useState("Supplier");
  const [error, setError] = useState("");

  // Function to add party and send it to backend
  const handleAddParty = async () => {
    if (!partyName || partyName.trim() === "") {
      setError("Party name cannot be empty.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/api/user/parties", {
        partyName: partyName.trim(), // Ensure no leading/trailing spaces
        phone: phone.trim() || "",   // Default empty string if no phone
        partyType,
      });
  
      const newParty = response.data.partyName;
  
      // Pass the new party to the parent
      onAddParty(newParty);
  
      alert("Party added successfully!");
      setPartyName("");
      setPhone("");
      setPartyType("Supplier");
      setError("");
      onClose();
    } catch (error) {
      console.error("Error adding party:", error);
      if (error.response && error.response.data.message === "Party already exists") {
        setError("A party with this name already exists.");
      } else {
        alert("Failed to add party. Please try again.");
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
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
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
