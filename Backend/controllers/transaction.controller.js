const mongoose = require("mongoose");
const Transaction = require("../MongoDb/models/userModels/Transaction");

// Transaction APIs
exports.createTransaction = async (req, res) => {
  try {
    const {
      type,
      date,
      amount,
      partyName,
      remarks,
      category,
      paymentMode,
      files,
    } = req.body;
    if (!type || !date || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const newTransaction = new Transaction({
      type,
      date,
      amount,
      partyName,
      remarks,
      category,
      paymentMode,
      files,
    });
    const savedTransaction = await newTransaction.save();
    res
      .status(201)
      .json({
        message: "Transaction created successfully",
        transaction: savedTransaction,
      });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong!!", details: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res
      .status(500)
      .json({ error: "Something went wrong!!", details: err.message });
  }
};

exports.getTransactionsByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (["Cash In", "Cash Out"].includes(type) === false) {
      return res.status(400).json({ error: "Invalid transaction type" });
    }
    const transactions = await Transaction.find({ type });
    res.status(200).json({ transactions });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong!!", details: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log("Updating transaction with ID:", id);
    console.log("Update data:", updateData);
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!updatedTransaction) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    res
      .status(200)
      .json({
        message: "Transaction updated successfully",
        transaction: updatedTransaction,
      });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Something went wrong!!", details: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { ids } = req.body;
  try {
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided for deletion." });
    }
    await Transaction.deleteMany({ _id: { $in: ids } });
    res.status(200).json({ message: "Transactions deleted successfully." });
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res.status(500).json({ message: "Failed to delete transactions." });
  }
};
