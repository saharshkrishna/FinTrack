const mongoose = require('mongoose');
const Loan = require('../MongoDb/models/userModels/Loan');

// Loan Apis

  exports.createLoan = async (req, res) => {
    try {
        const { date, loanTitle, loanAmount, interestRate, loanTerm, loanIssuedBy } = req.body;

        // Validate required fields
        if (!date || !loanTitle || !loanAmount || !interestRate || !loanIssuedBy) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Calculate additional fields
        const dailyInterestAmount = (loanAmount * (interestRate / 100)).toFixed(2);
        const dailyEMI = ((loanAmount / loanTerm) + parseFloat(dailyInterestAmount)).toFixed(2);

        // Calculate due date
        const dueDate = new Date(date);
        dueDate.setDate(dueDate.getDate() + loanTerm);
        const formattedDueDate = dueDate.toISOString().split("T")[0];

        // Create new loan entry
        const newLoan = new Loan({
            date,
            loanTitle,
            loanAmount,
            interestRate,
            dailyInterestAmount,
            loanTerm,
            dailyEMI,
            dueDate: formattedDueDate,
            loanIssuedBy
        });

        // Save to database
        const savedLoan = await newLoan.save();
        res.status(201).json({ message: "Loan created successfully", loan: savedLoan });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong!!", details: err.message });
    }
};

exports.getAllLoans = async (req, res) => {
    try {
        const loans = await Loan.find().sort({ createdAt: -1 });
        res.status(200).json({ loans });
    } catch (err) {
        console.error("Error fetching loans:", err);
        res.status(500).json({ error: "Something went wrong!!", details: err.message });
    }
};

exports.getLoanById = async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await Loan.findById(id);

        if (!loan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        res.status(200).json({ loan });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong!!", details: err.message });
    }
};

exports.updateLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log("Updating loan with ID:", id); // Debugging
        console.log("Update data:", updateData); // Debugging

        // Recalculate values if interest rate or amount is updated
        if (updateData.loanAmount || updateData.interestRate || updateData.loanTerm) {
            const loan = await Loan.findById(id);
            if (!loan) return res.status(404).json({ error: "Loan not found" });

            const loanAmount = updateData.loanAmount || loan.loanAmount;
            const interestRate = updateData.interestRate || loan.interestRate;
            const loanTerm = updateData.loanTerm || loan.loanTerm;

            updateData.dailyInterestAmount = (loanAmount * (interestRate / 100)).toFixed(2);
            updateData.dailyEMI = ((loanAmount / loanTerm) + parseFloat(updateData.dailyInterestAmount)).toFixed(2);

            // Recalculate due date
            const dueDate = new Date(loan.date);
            dueDate.setDate(dueDate.getDate() + loanTerm);
            updateData.dueDate = dueDate.toISOString().split("T")[0];
        }

        const updatedLoan = await Loan.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedLoan) {
            return res.status(404).json({ error: "Loan not found" });
        }

        res.status(200).json({ message: "Loan updated successfully", loan: updatedLoan });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong!!", details: err.message });
    }
};

exports.deleteLoan = async (req, res) => {
    const { ids } = req.body; // IDs of loans to delete
  
    try {
        if (!ids || ids.length === 0) {
            return res.status(400).json({ message: "No IDs provided for deletion." });
        }
  
        await Loan.deleteMany({ _id: { $in: ids } });
  
        res.status(200).json({ message: "Loans deleted successfully." });
    } catch (error) {
        console.error("Error deleting loans:", error);
        res.status(500).json({ message: "Failed to delete loans." });
    }
};

