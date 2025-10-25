const express = require('express');
const router = express.Router();
const { createLoanRe, getLoanReEntries } = require('../controllers/loanRe.controller');
// POST route
router.post('/', createLoanRe);
// GET route
router.get('/', getLoanReEntries);
module.exports = router;
