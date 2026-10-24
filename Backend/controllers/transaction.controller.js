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
      businessId: req.businessId,
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

exports.createBulkTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: "Transactions array is required and cannot be empty" });
    }

    const validDocs = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      const item = transactions[i];
      if (!item.type || !item.date || item.amount === undefined || item.amount === null || isNaN(Number(item.amount))) {
        errors.push({ index: i, error: "Missing or invalid required fields (type, date, amount)" });
        continue;
      }
      validDocs.push({
        businessId: req.businessId,
        type: item.type,
        date: String(item.date),
        amount: Number(item.amount),
        partyName: item.partyName ? String(item.partyName) : "",
        remarks: item.remarks ? String(item.remarks) : "",
        category: item.category ? String(item.category) : "",
        paymentMode: item.paymentMode ? String(item.paymentMode) : "Cash",
        files: Array.isArray(item.files) ? item.files : [],
      });
    }

    if (validDocs.length === 0) {
      return res.status(400).json({ error: "No valid transactions found to insert", details: errors });
    }

    const savedTransactions = await Transaction.insertMany(validDocs);
    res.status(201).json({
      message: `${savedTransactions.length} transactions imported successfully`,
      transactions: savedTransactions,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error("Error creating bulk transactions:", err);
    res.status(500).json({ error: "Failed to import bulk transactions", details: err.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ businessId: req.businessId }).sort({ createdAt: -1 });
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
    const transactions = await Transaction.find({ type, businessId: req.businessId });
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
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, businessId: req.businessId },
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
    await Transaction.deleteMany({ _id: { $in: ids }, businessId: req.businessId });
    res.status(200).json({ message: "Transactions deleted successfully." });
  } catch (error) {
    console.error("Error deleting transactions:", error);
    res.status(500).json({ message: "Failed to delete transactions." });
  }
};
