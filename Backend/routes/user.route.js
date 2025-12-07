const express = require("express");
const controller = require('../controllers/user.controller')
const upload = require('../middleware/file');
const {uploadFiles} = require('../controllers/filecontroller')
const router = express.Router();

//Transaction Routes
router.post('/transactions', controller.createTransaction);
router.get('/transactions', controller.getAllTransactions);
router.get('/transactions/:type', controller.getTransactionsByType);
router.put('/transactions/:id', controller.updateTransaction);
router.post('/transactions/delete', controller.deleteTransaction);

//Loan Routes
router.post("/loans", controller.createLoan);
router.get("/loans", controller.getAllLoans);
router.get("/loans/:id", controller.getLoanById);
router.put("/loans/:id", controller.updateLoan);
router.delete("/loans", controller.deleteLoan);

// Loan Re Routes
router.post("/loanRe", controller.createLoanRe);
router.get("/loanRe", controller.getLoanReEntries);

// Add party
router.post("/parties",controller.AddParty);
router.put('/parties/:id', controller.updateParty);
router.delete('/parties/:id', controller.deleteParty);
router.get('/parties', controller.getParty);

// Add Payment Mode
router.post("/paymentMode", controller.AddPaymentMode);
router.put('/paymentMode/:id', controller.updatePaymentMode);
router.delete('/paymentMode/:id', controller.deletePaymentMode);

// Add Category
router.post("/category", controller.AddCategory);
router.put('/category/:id', controller.updateCategory);
router.delete('/category/:id', controller.deleteCategory);

// Route to get all categories
router.get("/category", controller.getCategory);

// Route to get all payment modes
router.get("/paymentMode", controller.getPaymentModes);

router.post('/uploads', upload.array('file', 5), uploadFiles);

module.exports = router;
