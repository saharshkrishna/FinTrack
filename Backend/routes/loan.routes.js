const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');

// POST / - Create a new loan
router.post('/', loanController.createLoan);

// GET / - Get all loans
router.get('/', loanController.getAllLoans);

// GET /:id - Get loan by ID
router.get('/:id', loanController.getLoanById);

// PUT /:id - Update loan by ID
router.put('/:id', loanController.updateLoan);

// DELETE /:id - Delete loan by ID
router.delete('/:id', loanController.deleteLoan);

module.exports = router;
