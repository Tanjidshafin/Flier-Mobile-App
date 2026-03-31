const { Booking } = require('../models/Booking');
const { Hotel } = require('../models/Hotel');
const { Message } = require('../models/Message');
const { User } = require('../models/User');

async function getDashboardSummary() {
  const [
    totalUsers,
    totalAdmins,
    activeHotels,
    confirmedBookings,
    revenueSummary,
    latestUsers,
    latestBookings,
    latestMessages,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'admin' }),
    Hotel.countDocuments({ status: 'active' }),
    Booking.countDocuments({ status: 'confirmed' }),
    Booking.aggregate([
      {
        $group: {
          _id: null,
          paidConfirmedRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'confirmed'] },
                    { $eq: ['$paymentStatus', 'paid'] },
                  ],
                },
                '$pricing.totalAmount',
                0,
              ],
            },
          },
          refundedRevenue: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, '$pricing.totalAmount', 0],
            },
          },
        },
      },
    ]),
    User.find({}).sort({ createdAt: -1 }).limit(4).select('fullName email createdAt'),
    Booking.find({ status: 'confirmed' })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('hotelSnapshot confirmationCode createdAt'),
    Message.find({ senderRole: 'user' })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate({
        path: 'conversation',
        populate: {
          path: 'user',
          select: 'fullName email',
        },
      }),
  ]);

  const revenue = revenueSummary[0] || {
    paidConfirmedRevenue: 0,
    refundedRevenue: 0,
  };

  const recentActivity = [
    ...latestUsers.map(user => ({
      createdAt: user.createdAt,
      description: user.email,
      id: `user-${user._id.toString()}`,
      title: `${user.fullName} joined Flier`,
      type: 'user',
    })),
    ...latestBookings.map(booking => ({
      createdAt: booking.createdAt,
      description: booking.confirmationCode,
      id: `booking-${booking._id.toString()}`,
      title: `Booking confirmed for ${booking.hotelSnapshot?.name || 'a hotel'}`,
      type: 'booking',
    })),
    ...latestMessages
      .filter(message => message.conversation)
      .map(message => ({
        createdAt: message.createdAt,
        description: `${message.conversation.user?.fullName || 'Guest'}: ${message.body}`,
        id: `message-${message._id.toString()}`,
        title: `New guest message about ${message.conversation.hotelSnapshot?.name || 'a hotel'}`,
        type: 'message',
      })),
  ]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 8);

  return {
    recentActivity,
    stats: {
      activeHotels,
      confirmedBookings,
      netRevenue: revenue.paidConfirmedRevenue - revenue.refundedRevenue,
      totalAdmins,
      totalUsers,
    },
  };
}

module.exports = {
  getDashboardSummary,
};
