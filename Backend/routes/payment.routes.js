const express = require('express');
const router = express.Router();
const { AddPaymentMode, getPaymentModes, updatePaymentMode, deletePaymentMode } = require('../controllers/Payment.controller');

// POST route for adding a payment mode
router.post('/', AddPaymentMode);

// GET route for getting all payment modes
router.get('/', getPaymentModes);

// PUT route for updating a payment mode
router.put('/:id', updatePaymentMode);

// DELETE route for deleting a payment mode
router.delete('/:id', deletePaymentMode);

module.exports = router;
