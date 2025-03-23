const express = require('express');
const router = express.Router();
const { getStreaming } = require('../controllers/streamController');

router.get('/', getStreaming);

module.exports = router;
