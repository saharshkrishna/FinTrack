// Importing PaymentMode model
const mongoose = require('mongoose');
const PaymentMode = require('../MongoDb/models/userModels/Payment');
 
 // PaymentMode Apis
  exports.AddPaymentMode = async (req, res) => {
    console.log("Received Add Payment Mode Request:", req.body); // ✅ Log incoming request
  
    const { paymentMode } = req.body;
    if (!paymentMode) {
        console.error("Error: Payment mode is missing");
        return res.status(400).json({ message: "Payment mode is required" });
    }

    try {
        console.log("Checking if payment mode already exists...");
        const existingMode = await PaymentMode.findOne({ paymentMode }); // ✅ Fixed incorrect field name
        if (existingMode) {
            console.warn("Payment mode already exists:", existingMode);
            return res.status(400).json({ message: "Payment mode already exists" });
        }

        console.log("Saving new payment mode...");
        const newMode = new PaymentMode({ paymentMode });
        await newMode.save();
        console.log("Payment mode added successfully:", newMode);

        res.status(201).json({ message: "Payment mode added successfully", newPaymentMode: newMode });
    } catch (error) {
        console.error("Error adding payment mode:", error);
        res.status(500).json({ message: "Error adding payment mode", error: error.message });
    }
};
exports.getPaymentModes = async (req, res) => {
    try {
        console.log("Fetching all payment modes...");
        const paymentModes = await PaymentMode.find({});
        console.log("Fetched Payment Modes:", paymentModes);
        res.status(200).json({ paymentMode: paymentModes });
    } catch (error) {
        console.error("Error fetching payment modes:", error);
        res.status(500).json({ message: "Error fetching payment modes", error: error.message });
    }
};