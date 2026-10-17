// Importing PaymentMode model
const mongoose = require('mongoose');
const PaymentMode = require('../MongoDb/models/userModels/Payment');

// PaymentMode Apis
exports.AddPaymentMode = async (req, res) => {
    console.log("Received Add Payment Mode Request:", req.body);

    const { paymentMode } = req.body;
    if (!paymentMode) {
        console.error("Error: Payment mode is missing");
        return res.status(400).json({ message: "Payment mode is required" });
    }

    try {
        console.log("Checking if payment mode already exists...");
        const existingMode = await PaymentMode.findOne({ paymentMode, businessId: req.businessId });
        if (existingMode) {
            console.warn("Payment mode already exists:", existingMode);
            return res.status(400).json({ message: "Payment mode already exists" });
        }

        console.log("Saving new payment mode...");
        const newMode = new PaymentMode({ paymentMode, businessId: req.businessId });
        await newMode.save();
        console.log("Payment mode added successfully:", newMode);

        res.status(201).json({ message: "Payment mode added successfully", newPaymentMode: newMode, paymentMode: newMode });
    } catch (error) {
        console.error("Error adding payment mode:", error);
        res.status(500).json({ message: "Error adding payment mode", error: error.message });
    }
};

exports.getPaymentModes = async (req, res) => {
    try {
        console.log("Fetching all payment modes...");
        const paymentModes = await PaymentMode.find({ businessId: req.businessId });
        console.log("Fetched Payment Modes:", paymentModes);
        res.status(200).json({ paymentMode: paymentModes });
    } catch (error) {
        console.error("Error fetching payment modes:", error);
        res.status(500).json({ message: "Error fetching payment modes", error: error.message });
    }
};

exports.updatePaymentMode = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMode } = req.body;

        if (!paymentMode) {
            return res.status(400).json({ message: "Payment mode name is required" });
        }

        const updatedMode = await PaymentMode.findOneAndUpdate(
            { _id: id, businessId: req.businessId },
            { paymentMode },
            { new: true, runValidators: true }
        );

        if (!updatedMode) {
            return res.status(404).json({ message: "Payment mode not found" });
        }

        res.status(200).json({ message: "Payment mode updated successfully", paymentMode: updatedMode });
    } catch (error) {
        console.error("Error updating payment mode:", error);
        res.status(500).json({ message: "Error updating payment mode", error: error.message });
    }
};

exports.deletePaymentMode = async (req, res) => {
    try {
        const { id } = req.params;

        const deleted = await PaymentMode.findOneAndDelete({ _id: id, businessId: req.businessId });

        if (!deleted) {
            return res.status(404).json({ message: "Payment mode not found" });
        }

        res.status(200).json({ message: "Payment mode deleted successfully" });
    } catch (error) {
        console.error("Error deleting payment mode:", error);
        res.status(500).json({ message: "Error deleting payment mode", error: error.message });
    }
};