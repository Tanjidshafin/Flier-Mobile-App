const mongoose = require('mongoose');

const wishlistItemSchema = new mongoose.Schema(
  {
    hotel: {
      ref: 'Hotel',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    user: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  },
);

wishlistItemSchema.index({ hotel: 1, user: 1 }, { unique: true });

module.exports = {
  WishlistItem:
    mongoose.models.WishlistItem ||
    mongoose.model('WishlistItem', wishlistItemSchema),
};
