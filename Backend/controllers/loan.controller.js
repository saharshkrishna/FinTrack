const Loan = require('../MongoDb/models/userModels/Loan');

// Create a new loan
const createLoan = async (req, res) => {
  try {
    const {
      loanName,
      principalAmount,
      interestRate,
      termMonths,
      startDate,
      remainingBalance,
      monthlyPayment,
      status,
      nextPaymentDate,
      lenderName,
      notes,
    } = req.body;

    if (!loanName || !principalAmount || !interestRate || !termMonths || !startDate) {
      return res.status(400).json({ message: 'Please provide all required loan details.' });
    }

    const newLoan = new Loan({
      userId: req.user._id,
      loanName,
      principalAmount,
      interestRate,
      termMonths,
      startDate,
      remainingBalance,
      monthlyPayment,
      status,
      nextPaymentDate,
      lenderName,
      notes,
    });

    const savedLoan = await newLoan.save();
    res.status(201).json(savedLoan);
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Error creating loan', error: error.message });
  }
};

// Get all loans for the authenticated user
const getAllLoans = async (req, res) => {
  try {
    const loans = await Loan.find({ userId: req.user._id });
    res.status(200).json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ message: 'Error fetching loans', error: error.message });
  }
};

// Get a loan by ID
const getLoanById = async (req, res) => {
  try {
    const { id } = req.params;
    const loan = await Loan.findOne({ _id: id, userId: req.user._id });

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.status(200).json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ message: 'Error fetching loan', error: error.message });
  }
};

// Update a loan by ID
const updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedLoan = await Loan.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedLoan) {
      return res.status(404).json({ message: 'Loan not found or you are not authorized to update it' });
    }

    res.status(200).json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ message: 'Error updating loan', error: error.message });
  }
};

// Delete a loan by ID
const deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLoan = await Loan.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!deletedLoan) {
      return res.status(404).json({ message: 'Loan not found or you are not authorized to delete it' });
    }

    res.status(200).json({ message: 'Loan deleted successfully', deletedLoan });
  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({ message: 'Error deleting loan', error: error.message });
  }
};

module.exports = {
  createLoan,
  getAllLoans,
  getLoanById,
  updateLoan,
  deleteLoan,
};
