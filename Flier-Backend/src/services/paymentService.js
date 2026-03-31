const Stripe = require('stripe');

const { getEnvConfig } = require('../config/env');

let stripeClient;

function getStripeClient() {
  const config = getEnvConfig();

  if (!config.stripeSecretKey) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(config.stripeSecretKey);
  }

  return stripeClient;
}

function isStripeConfigured() {
  const config = getEnvConfig();
  return Boolean(config.stripeSecretKey && config.stripePublishableKey);
}

async function ensureStripeCustomer(user) {
  const stripe = getStripeClient();

  if (!stripe) {
    return `cus_mock_${user._id.toString()}`;
  }

  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.fullName,
    phone: user.phoneNumber || undefined,
  });

  user.stripeCustomerId = customer.id;
  await user.save();

  return customer.id;
}

async function createPaymentSession({ amount, booking, currency, idempotencyKey, user }) {
  const config = getEnvConfig();
  const stripe = getStripeClient();

  if (!stripe) {
    return {
      customerId: `cus_mock_${user._id.toString()}`,
      ephemeralKeySecret: 'ephkey_mock_secret',
      paymentIntentClientSecret: `pi_mock_${booking._id.toString()}_secret_mock`,
      paymentIntentId: `pi_mock_${booking._id.toString()}`,
      provider: 'mock',
      publishableKey: null,
    };
  }

  const customerId = await ensureStripeCustomer(user);
  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customerId },
    { apiVersion: config.stripeEphemeralApiVersion },
  );
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount,
      automatic_payment_methods: { enabled: true },
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: {
        bookingId: booking._id.toString(),
        hotelId: booking.hotel.toString(),
        userId: user._id.toString(),
      },
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  return {
    customerId,
    ephemeralKeySecret: ephemeralKey.secret,
    paymentIntentClientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    provider: 'stripe',
    publishableKey: config.stripePublishableKey,
  };
}

async function retrievePaymentIntent(paymentIntentId) {
  const stripe = getStripeClient();

  if (!stripe || !paymentIntentId) {
    return {
      id: paymentIntentId || null,
      status: 'succeeded',
    };
  }

  return stripe.paymentIntents.retrieve(paymentIntentId);
}

async function cancelPaymentIntent(paymentIntentId) {
  const stripe = getStripeClient();

  if (!stripe || !paymentIntentId) {
    return { id: paymentIntentId || null, status: 'canceled' };
  }

  return stripe.paymentIntents.cancel(paymentIntentId);
}

async function refundPaymentIntent(paymentIntentId) {
  const stripe = getStripeClient();

  if (!stripe || !paymentIntentId) {
    return { id: `re_mock_${paymentIntentId || 'payment'}` };
  }

  return stripe.refunds.create({ payment_intent: paymentIntentId });
}

module.exports = {
  cancelPaymentIntent,
  createPaymentSession,
  ensureStripeCustomer,
  isStripeConfigured,
  refundPaymentIntent,
  retrievePaymentIntent,
};
