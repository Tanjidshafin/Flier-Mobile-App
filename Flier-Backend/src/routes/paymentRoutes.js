const express = require('express');

const { handlePaymentWebhook } = require('../controllers/paymentController');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.post('/webhook', asyncHandler(handlePaymentWebhook));

module.exports = router;
