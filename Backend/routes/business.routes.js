const express = require('express');
const router = express.Router();
const businessController = require('../controllers/business.controller');
const authMiddleware = require('../middleware/auth');

// All business routes require valid authentication
router.use(authMiddleware);

router.post('/', businessController.createBusiness);
router.get('/', businessController.getBusinesses);
router.put('/:id', businessController.updateBusiness);
router.delete('/:id', businessController.deleteBusiness);

module.exports = router;
