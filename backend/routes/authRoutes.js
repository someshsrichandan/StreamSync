const express = require('express');
const { login, logout, signup } = require('../controllers/authController');
const router = express.Router();
router.post('/login', login);
router.get('/logout', logout);
router.post('/signup', signup); // Add this line

module.exports = router;