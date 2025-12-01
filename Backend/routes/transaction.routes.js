const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');

// POST / - Create new transaction
router.post('/', transactionController.createTransaction);

// POST /delete - Delete transaction (specific route before dynamic routes)
router.post('/delete', transactionController.deleteTransaction);

// GET / - Get all transactions
router.get('/', transactionController.getAllTransactions);

// GET /:type - Get transactions by type (dynamic route after specific routes)
router.get('/:type', transactionController.getTransactionsByType);

// PUT /:id - Update transaction
router.put('/:id', transactionController.updateTransaction);

module.exports = router;
