const { reconcilePaymentEvent } = require('../services/paymentWebhookService');

async function handlePaymentWebhook(req, res) {
  await reconcilePaymentEvent(req.body);

  res.status(200).json({
    success: true,
    message: 'Payment event processed successfully.',
    data: { received: true },
  });
}

module.exports = {
  handlePaymentWebhook,
};
