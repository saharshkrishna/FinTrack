const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.controller');

// GET /api/user/invoices — list all invoices for active business
router.get('/', invoiceController.getInvoices);

// GET /api/user/invoices/next-number — preview next auto-generated invoice number
router.get('/next-number', invoiceController.getNextInvoiceNumber);

// GET /api/user/invoices/:id — get single invoice
router.get('/:id', invoiceController.getInvoiceById);

// POST /api/user/invoices — create new invoice
router.post('/', invoiceController.createInvoice);

// PUT /api/user/invoices/:id — update invoice
router.put('/:id', invoiceController.updateInvoice);

// DELETE /api/user/invoices/:id — delete invoice
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;

