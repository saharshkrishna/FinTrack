const mongoose = require("mongoose");
const Transaction = require("../MongoDb/models/userModels/Transaction");
const Category = require("../MongoDb/models/userModels/Category");
const PaymentMode = require("../MongoDb/models/userModels/Payment");
const Party = require("../MongoDb/models/userModels/Party");

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
    if (!type || !date || amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ error: "Missing or invalid required fields (type, date, amount >= 0)" });
    }
    if (!["Cash In", "Cash Out", "Credit", "Debit"].includes(type)) {
      return res.status(400).json({ error: "Invalid transaction type. Must be 'Cash In', 'Cash Out', 'Credit', or 'Debit'" });
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

    // Auto-upsert new category, party, and payment mode if provided
    try {
      if (category && String(category).trim()) {
        const catName = String(category).trim();
        const exists = await Category.findOne({
          businessId: req.businessId,
          category: { $regex: new RegExp(`^${catName}$`, 'i') }
        });
        if (!exists) {
          await Category.create({ businessId: req.businessId, category: catName });
        }
      }
      if (partyName && String(partyName).trim()) {
        const pName = String(partyName).trim();
        const exists = await Party.findOne({
          businessId: req.businessId,
          partyName: { $regex: new RegExp(`^${pName}$`, 'i') }
        });
        if (!exists) {
          await Party.create({ businessId: req.businessId, partyName: pName, partyType: "Supplier" });
        }
      }
      if (paymentMode && String(paymentMode).trim()) {
        const mName = String(paymentMode).trim();
        const exists = await PaymentMode.findOne({
          businessId: req.businessId,
          paymentMode: { $regex: new RegExp(`^${mName}$`, 'i') }
        });
        if (!exists) {
          await PaymentMode.create({ businessId: req.businessId, paymentMode: mName });
        }
      }
    } catch (metaErr) {
      console.warn("Error auto-adding metadata from transaction:", metaErr.message);
    }

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

    // Auto-seed/insert any new categories, parties, and payment modes from imported transactions
    try {
      // 1. Process categories
      const incomingCategories = [
        ...new Set(
          validDocs
            .map((d) => (d.category ? String(d.category).trim() : ""))
            .filter(Boolean)
        )
      ];
      if (incomingCategories.length > 0) {
        const existingCats = await Category.find({ businessId: req.businessId });
        const existingCatSet = new Set(existingCats.map((c) => (c.category || "").trim().toLowerCase()));
        const newCatDocs = incomingCategories
          .filter((cat) => !existingCatSet.has(cat.toLowerCase()))
          .map((cat) => ({
            businessId: req.businessId,
            category: cat
          }));
        if (newCatDocs.length > 0) {
          await Category.insertMany(newCatDocs, { ordered: false });
        }
      }

      // 2. Process parties
      const incomingParties = [
        ...new Set(
          validDocs
            .map((d) => (d.partyName ? String(d.partyName).trim() : ""))
            .filter(Boolean)
        )
      ];
      if (incomingParties.length > 0) {
        const existingParties = await Party.find({ businessId: req.businessId });
        const existingPartySet = new Set(existingParties.map((p) => (p.partyName || "").trim().toLowerCase()));
        const newPartyDocs = incomingParties
          .filter((p) => !existingPartySet.has(p.toLowerCase()))
          .map((p) => ({
            businessId: req.businessId,
            partyName: p,
            partyType: "Supplier"
          }));
        if (newPartyDocs.length > 0) {
          await Party.insertMany(newPartyDocs, { ordered: false });
        }
      }

      // 3. Process payment modes
      const incomingModes = [
        ...new Set(
          validDocs
            .map((d) => (d.paymentMode ? String(d.paymentMode).trim() : ""))
            .filter(Boolean)
        )
      ];
      if (incomingModes.length > 0) {
        const existingModes = await PaymentMode.find({ businessId: req.businessId });
        const existingModeSet = new Set(existingModes.map((m) => (m.paymentMode || "").trim().toLowerCase()));
        const newModeDocs = incomingModes
          .filter((m) => !existingModeSet.has(m.toLowerCase()))
          .map((m) => ({
            businessId: req.businessId,
            paymentMode: m
          }));
        if (newModeDocs.length > 0) {
          await PaymentMode.insertMany(newModeDocs, { ordered: false });
        }
      }
    } catch (metaErr) {
      console.warn("Error auto-adding metadata from bulk import:", metaErr.message);
    }

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
    if (["Cash In", "Cash Out", "Credit", "Debit"].includes(type) === false) {
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
