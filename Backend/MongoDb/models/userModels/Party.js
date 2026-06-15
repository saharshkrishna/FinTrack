const mongoose = require('mongoose');

const PartySchema = new mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  partyName: { type: String, required: [true, "Party name is required"], trim: true },
  phone: { type: String, default: "" },
  partyType: { type: String, enum: ["Supplier", "Customer"] },
});

PartySchema.index({ businessId: 1, partyName: 1 }, { unique: true });

const Party = mongoose.model("Party", PartySchema);

module.exports = Party;