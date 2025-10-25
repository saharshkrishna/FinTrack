const mongoose = require("mongoose");


const PaymentModeSchema = new mongoose.Schema({
    paymentMode: { type: String, unique: true, required: true }
  });

const PaymentMode = mongoose.model("PaymentMode", PaymentModeSchema);

module.exports = PaymentMode;