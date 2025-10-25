const express = require('express');
const router = express.Router();
const { createLoanRe, getLoanRe } = require('../controllers/loanRe.controller');

// POST route
router.post('/', createLoanRe);

// GET route
router.get('/', getLoanRe);

module.exports = router;
