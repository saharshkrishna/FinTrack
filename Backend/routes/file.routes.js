const express = require('express');
const upload = require('../middleware/file');
const { uploadFiles } = require('../controllers/filecontroller');

const router = express.Router();

router.post('/', upload.array('file', 5), uploadFiles);

module.exports = router;
