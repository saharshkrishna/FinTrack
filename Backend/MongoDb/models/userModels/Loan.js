// backend/MongoDb/models userModels/Loan.js

const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD
  loanTitle: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  interestRate: { type: Number }, // optional if reimbursementPlan = no
  dailyInterest: { type: Number },losingAmount: { type: Number },
  emiDate: { type: String }, // first EMI date
  reimbursementPlan: { type: String, enum: ['yes', 'no'], default: 'no' },
  loanIssuedBy: { type: String },
  partyName: { type: String },
  remarks: { type: String },
  paymentMode: { type: String, default: 'Cash' },
  files: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Loan', loanSchema);
