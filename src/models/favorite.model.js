const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'foodPartner' },
  food: { type: mongoose.Schema.Types.ObjectId, ref: 'food' },
}, { timestamps: true });

favoriteSchema.index(
  { user: 1, foodPartner: 1 },
  { unique: true, name: 'user_foodPartner_unique', partialFilterExpression: { foodPartner: { $exists: true } } },
);
favoriteSchema.index(
  { user: 1, food: 1 },
  { unique: true, name: 'user_food_unique', partialFilterExpression: { food: { $exists: true } } },
);

module.exports = mongoose.model('favorite', favoriteSchema);
