const LoanRe = require("../models/loanre.model");
const User = require("../models/user.model");

// Create a new loan repayment entry
const createLoanRe = async (req, res) => {
  try {
    const { amount, date, category, description, loanTakenFrom } = req.body;
    const userId = req.user.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create new loan repayment entry
    const loanRe = new LoanRe({
      user: userId,
      amount,
      date,
      category,
      description,
      loanTakenFrom,
    });

    await loanRe.save();

    // Add to user's loanRe array
    user.loanRe.push(loanRe._id);
    await user.save();

    res.status(201).json({ message: "Loan repayment entry created successfully", loanRe });
  } catch (error) {
    res.status(500).json({ message: "Error creating loan repayment entry", error: error.message });
  }
};

// Get all loan repayment entries for a user
const getLoanReEntries = async (req, res) => {
  try {
    const userId = req.user.id;

    const loanReEntries = await LoanRe.find({ user: userId }).sort({ date: -1 });
    res.status(200).json(loanReEntries);
  } catch (error) {
    res.status(500).json({ message: "Error fetching loan repayment entries", error: error.message });
  }
};

module.exports = {
  createLoanRe,
  getLoanReEntries,
};
