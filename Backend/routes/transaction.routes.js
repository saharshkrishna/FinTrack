const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

// POST / - Create new transaction
router.post('/', transactionController.createTransaction);

// GET / - Get all transactions
router.get('/', transactionController.getAllTransactions);

// GET /:type - Get transactions by type
router.get('/:type', transactionController.getTransactionsByType);

// PUT /:id - Update transaction
router.put('/:id', transactionController.updateTransaction);

// POST /delete - Delete transaction
router.post('/delete', transactionController.deleteTransaction);

module.exports = router;
