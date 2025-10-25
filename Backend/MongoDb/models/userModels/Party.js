const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  partyName: { type: String, required: [true, "Party name is required"], unique: true, trim: true },
  phone: { type: String, default: "" },
  partyType: { type: String, enum: ["Supplier", "Customer"] },
});

const Party = mongoose.model("Party", PartySchema);

module.exports = Party;