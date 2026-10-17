const express = require("express");
const transactionController = require('../controllers/transaction.controller');
const loanController = require('../controllers/loan.controller');
const loanReController = require('../controllers/loanRe.controller');
const partyController = require('../controllers/party.controller');
const paymentController = require('../controllers/Payment.controller');
const categoryController = require('../controllers/category.controller');
const upload = require('../middleware/file');
const { uploadFiles } = require('../controllers/filecontroller');

const router = express.Router();

// Transaction Routes
router.post('/transactions', transactionController.createTransaction);
router.get('/transactions', transactionController.getAllTransactions);
router.get('/transactions/:type', transactionController.getTransactionsByType);
router.put('/transactions/:id', transactionController.updateTransaction);
router.post('/transactions/delete', transactionController.deleteTransaction);

// Loan Routes
router.post("/loans", loanController.createLoan);
router.get("/loans", loanController.getAllLoans);
router.get("/loans/:id", loanController.getLoanById);
router.put("/loans/:id", loanController.updateLoan);
router.delete("/loans/:id", loanController.deleteLoan);

// Loan Re Routes
router.post("/loanRe", loanReController.createLoanRe);
router.get("/loanRe", loanReController.getLoanReEntries);

// Party Routes
router.post("/parties", partyController.AddParty);
router.put('/parties/:id', partyController.updateParty);
router.delete('/parties/:id', partyController.deleteParty);
router.get('/parties', partyController.getParty);

// Payment Mode Routes
router.post("/paymentMode", paymentController.AddPaymentMode);
router.put('/paymentMode/:id', paymentController.updatePaymentMode);
router.delete('/paymentMode/:id', paymentController.deletePaymentMode);
router.get("/paymentMode", paymentController.getPaymentModes);

// Category Routes
router.post("/category", categoryController.AddCategory);
router.put('/category/:id', categoryController.updateCategory);
router.delete('/category/:id', categoryController.deleteCategory);
router.get("/category", categoryController.getCategory);

router.post('/uploads', upload.array('file', 5), uploadFiles);

module.exports = router;
