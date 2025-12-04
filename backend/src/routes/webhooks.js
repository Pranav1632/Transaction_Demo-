const express = require('express');
const router = express.Router();
const webhooksController = require('../controllers/webhooksController');
router.post('/razorpay', express.raw({ type: 'application/json' }), webhooksController.razorpayWebhook);
module.exports = router;
