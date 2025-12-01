const LoanRe = require('../MongoDb/models/userModels/LoanRe');

//LoanRe Apis


exports.createLoanRe = async (req, res) => {
  try {
    const {
      date,
      loanId,
      loanTitle,
      loanAmount,
      interestRate,
      originalEMI,
      emiAmount,
      emiType,
      partyName,
      remarks,
      paymentMode
    } = req.body;

    // ✅ Validate required fields
    if (!date || !loanId || !emiAmount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // ✅ Construct and save LoanRe entry
    const newLoanRe = new LoanRe({
      date,
      loanId,
      loanTitle,
      loanAmount,
      interestRate,
      originalEMI,
      emiAmount,
      emiType,
      partyName,
      remarks,
      paymentMode
    });

    const savedLoanRe = await newLoanRe.save();

    res.status(201).json({
      message: "Loan reimbursement added successfully",
      loanRe: savedLoanRe
    });
  } catch (err) {
    console.error("Error creating LoanRe:", err);
    res.status(500).json({
      error: "Something went wrong!!",
      details: err.message
    });
  }
};


exports.getLoanReEntries = async (req, res) => {
  try {
    const entries = await LoanRe.find().sort({ createdAt: -1 });
    res.status(200).json({ loanReEntries: entries });
  } catch (err) {
    console.error("LoanRe GET error:", err);
    res.status(500).json({ message: "Error fetching reimbursements", error: err.message });
  }
};
