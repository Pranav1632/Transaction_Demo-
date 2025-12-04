const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Start / send OTP or magic link
router.post('/start', authController.startVerification);

// Verify code / token
router.post('/verify', authController.verify);

// Resend
router.post('/resend', authController.resend);

module.exports = router;
