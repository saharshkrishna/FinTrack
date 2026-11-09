// Importing PaymentMode model
const mongoose = require('mongoose');
const PaymentMode = require('../MongoDb/models/userModels/Payment');
const Transaction = require('../MongoDb/models/userModels/Transaction');

const DEFAULT_PAYMENT_MODES = ['Cash', 'Online', 'UPI', 'Bank Transfer', 'Card'];

// PaymentMode Apis
exports.AddPaymentMode = async (req, res) => {
    console.log("Received Add Payment Mode Request:", req.body);

    const { paymentMode } = req.body;
    if (!paymentMode || !String(paymentMode).trim()) {
        console.error("Error: Payment mode is missing");
        return res.status(400).json({ message: "Payment mode is required" });
    }

    const trimmedMode = String(paymentMode).trim();

    try {
        console.log("Checking if payment mode already exists...");
        const existingMode = await PaymentMode.findOne({
            businessId: req.businessId,
            paymentMode: { $regex: new RegExp(`^${trimmedMode}$`, 'i') }
        });
        if (existingMode) {
            console.warn("Payment mode already exists:", existingMode);
            return res.status(200).json({ message: "Payment mode already exists", paymentMode: existingMode });
        }

        console.log("Saving new payment mode...");
        const newMode = new PaymentMode({ paymentMode: trimmedMode, businessId: req.businessId });
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
        let paymentModes = await PaymentMode.find({ businessId: req.businessId });

        // Auto-sync any payment modes from transactions
        try {
            const txModes = await Transaction.distinct("paymentMode", {
                businessId: req.businessId,
                paymentMode: { $nin: ["", null] }
            });

            if (txModes && txModes.length > 0) {
                const existingNames = new Set(paymentModes.map(m => (m.paymentMode || '').trim().toLowerCase()));
                const missingModes = txModes
                    .map(m => (m ? String(m).trim() : ''))
                    .filter(m => m && !existingNames.has(m.toLowerCase()));

                if (missingModes.length > 0) {
                    const toInsert = missingModes.map(mode => ({
                        businessId: req.businessId,
                        paymentMode: mode
                    }));
                    await PaymentMode.insertMany(toInsert, { ordered: false });
                    paymentModes = await PaymentMode.find({ businessId: req.businessId });
                }
            }
        } catch (syncErr) {
            console.warn("Error syncing transaction payment modes:", syncErr.message);
        }

        // If business still has zero payment modes, seed defaults
        if (!paymentModes || paymentModes.length === 0) {
            try {
                const toInsert = DEFAULT_PAYMENT_MODES.map(mode => ({
                    businessId: req.businessId,
                    paymentMode: mode
                }));
                await PaymentMode.insertMany(toInsert, { ordered: false });
                paymentModes = await PaymentMode.find({ businessId: req.businessId });
            } catch (seedErr) {
                console.warn("Error seeding default payment modes:", seedErr.message);
            }
        }

        res.status(200).json({ paymentMode: paymentModes, paymentModes });
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