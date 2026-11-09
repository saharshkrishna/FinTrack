const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  businessId:      { type: String, trim: true, sparse: true, index: true },
  name:            { type: String, required: true, trim: true },
  companyType:     { type: String, trim: true, default: '' },
  gstNumber:       { type: String, trim: true, uppercase: true, default: '' },
  teamAccessCount: { type: Number, default: 0, min: 0, max: 3 },
  teamMembers: [
    {
      email:   { type: String, trim: true, lowercase: true },
      role:    { type: String, default: 'Member' },
      addedAt: { type: Date, default: Date.now }
    }
  ],
  owner:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  userId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  description:     { type: String, default: '' },
  currency:        { type: String, default: 'INR' },
  createdAt:       { type: Date, default: Date.now }
});

module.exports = mongoose.model('Business', BusinessSchema);
