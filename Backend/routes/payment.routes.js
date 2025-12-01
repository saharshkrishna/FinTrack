const express = require('express');
const router = express.Router();
const { AddPaymentMode, getPaymentModes } = require('../controllers/Payment.controller');

// POST route for adding a payment mode
router.post('/', AddPaymentMode);

// GET route for getting payment modes
router.get('/', getPaymentModes);

module.exports = router;
