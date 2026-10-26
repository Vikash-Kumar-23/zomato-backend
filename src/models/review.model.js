const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    foodPartner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'foodPartner',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
      required: true,
    },
  },
  { timestamps: true }
);

const reviewModel = mongoose.model('review', reviewSchema);

module.exports = reviewModel;