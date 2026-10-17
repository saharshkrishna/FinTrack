const express = require('express');
const router = express.Router();
const { AddParty, getParty, updateParty, deleteParty } = require('../controllers/party.controller');

// POST route for adding a party
router.post('/', AddParty);

// GET route for getting all parties
router.get('/', getParty);

// PUT route for updating a party
router.put('/:id', updateParty);

// DELETE route for deleting a party
router.delete('/:id', deleteParty);

module.exports = router;
