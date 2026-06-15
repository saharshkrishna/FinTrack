const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  currency:    { type: String, default: 'INR' },
  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema);
