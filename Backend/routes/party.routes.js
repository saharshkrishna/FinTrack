const express = require('express');
const router = express.Router();
const { AddParty, getParty } = require('../controllers/party.controller');

// POST route for adding a party
router.post('/', AddParty);

// GET route for getting party
router.get('/', getParty);

module.exports = router;
