const express = require('express');
const router = express.Router();
const donationsController = require('../controllers/donationsController');
router.post('/create', donationsController.createDonation);
router.get('/:id/status', donationsController.getStatus);
module.exports = router;
