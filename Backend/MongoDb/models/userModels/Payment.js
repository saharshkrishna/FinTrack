const mongoose = require("mongoose");


const PaymentModeSchema = new mongoose.Schema({
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    paymentMode: { type: String, required: true }
  });

PaymentModeSchema.index({ businessId: 1, paymentMode: 1 }, { unique: true });

const PaymentMode = mongoose.model("PaymentMode", PaymentModeSchema);

module.exports = PaymentMode;