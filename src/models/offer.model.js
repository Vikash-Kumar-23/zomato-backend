const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  foodPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'foodPartner', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '', trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true, min: 0 },
  minimumOrderValue: { type: Number, min: 0, default: 0 },
  startsAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

offerSchema.index({ foodPartner: 1, startsAt: 1, expiresAt: 1 });

offerSchema.pre('validate', function validateOffer(next) {
  if (this.expiresAt <= this.startsAt) return next(new Error('Offer expiry must be after its start date'));
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    return next(new Error('Percentage discount cannot exceed 100'));
  }
  next();
});

module.exports = mongoose.model('offer', offerSchema);
