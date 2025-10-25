// backend/MongoDb/models userModels/LoanRe.js

const mongoose = require('mongoose');

const loanReSchema = new mongoose.Schema({
  date: { type: String, required: true },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  loanTitle: { type: String },
  loanAmount: { type: Number },
  interestRate: { type: Number },
  originalEMI: { type: Number },
  emiAmount: { type: Number, required: true },
  emiType: { type: String, enum: ['normal', 'custom'], default: 'normal' },
  partyName: { type: String },
  remarks: { type: String },
  paymentMode: { type: String },
  type: { type: String, default: 'LoanRe' }
}, { timestamps: true });

module.exports = mongoose.model('LoanRe', loanReSchema);
