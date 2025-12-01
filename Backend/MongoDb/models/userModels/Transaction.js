const mongoose = require('mongoose');

// Define the schema for the transaction
const transactionSchema = new mongoose.Schema({

    type: {
        type: String,
        required: true,
        enum: ["Cash In", "Cash Out", "Credit","Debit"], 
    },
    date: {
        type: String, // Stored as a string in "YYYY-MM-DD" format
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    partyName: {
        type: String,
        default: "", // Optional field
    },
    remarks: {
        type: String,
        default: "", // Optional field
    },
    category: {
        type: String,
        default: "", // Optional field
    },
    paymentMode: {
        type: String,
        default: "Cash", // Default payment mode is "Cash"
    },
    files: [{
        type: String, // Store file paths or URLs for attached bills
    }],
}, {
    timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
});


// Create the model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;