const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  businessId:  { type: String, trim: true, sparse: true, index: true },
  name:        { type: String, required: true, trim: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  description: { type: String, default: '' },
  currency:    { type: String, default: 'INR' },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema);
