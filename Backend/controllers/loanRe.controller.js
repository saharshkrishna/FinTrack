const LoanRe = require('../MongoDb/models/userModels/LoanRe');
const User = require('../MongoDb/models/User');

const createLoanRe = async (req, res) => {
  try {
    const { userId, amount, date, category, description, loanTakenFrom } = req.body;
    
    if (!userId || !amount || !date || !category || !description || !loanTakenFrom) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newLoanRe = new LoanRe({
      user: userId,
      amount,
      date,
      category,
      description,
      loanTakenFrom,
    });
    const savedLoanRe = await newLoanRe.save();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.loanRe.push(savedLoanRe._id);
    await user.save();
    res.status(201).json({
      message: "LoanRe entry created successfully",
      loanRe: savedLoanRe,
    });
  } catch (error) {
    console.error("Error in createLoanRe:", error);
    res.status(500).json({
      message: "Failed to create LoanRe entry",
      error: error.message,
    });
  }
};
const getLoanReEntries = async (req, res) => {
  try {
    const { userId } = req.body;
    const loanReEntries = await LoanRe.find({ user: userId });
    res.json(loanReEntries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = { createLoanRe, getLoanReEntries };
