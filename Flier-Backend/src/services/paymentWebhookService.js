const { Booking } = require('../models/Booking');
const { createNotification } = require('./notificationService');

async function reconcilePaymentEvent(event) {
  const paymentIntent = event?.data?.object;
  const paymentIntentId = paymentIntent?.id;
  const bookingId = paymentIntent?.metadata?.bookingId || null;

  if (!paymentIntentId && !bookingId) {
    return null;
  }

  const booking = await Booking.findOne({
    $or: [
      ...(bookingId ? [{ _id: bookingId }] : []),
      ...(paymentIntentId ? [{ 'payment.paymentIntentId': paymentIntentId }] : []),
    ],
  });

  if (!booking) {
    return null;
  }

  if (event.type === 'payment_intent.succeeded') {
    booking.payment.paidAt = new Date();
    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.holdExpiresAt = null;
    await booking.save();

    await createNotification({
      body: `${booking.hotelSnapshot.name} was confirmed from the payment webhook.`,
      data: {
        bookingId: booking._id.toString(),
        hotelSlug: booking.hotelSnapshot.slug,
        routeName: 'BookingSuccess',
      },
      title: 'Payment confirmed',
      type: 'booking_update',
      userId: booking.user,
    });
  }

  if (event.type === 'payment_intent.payment_failed') {
    booking.payment.lastError = paymentIntent?.last_payment_error?.message || 'Payment failed.';
    booking.paymentStatus = 'failed';
    booking.status = 'payment_failed';
    await booking.save();
  }

  return booking;
}

module.exports = {
  reconcilePaymentEvent,
};
