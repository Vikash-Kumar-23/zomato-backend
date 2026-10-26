const favoriteModel = require('../models/favorite.model');

async function listFavorites(req, res) {
  const favorites = await favoriteModel.find({ user: req.user._id })
    .populate('foodPartner')
    .populate('food');
  res.json({ favorites });
}

async function addFavorite(req, res) {
  const field = req.params.type === 'restaurant' ? 'foodPartner' : 'food';
  if (!['restaurant', 'food'].includes(req.params.type)) {
    return res.status(400).json({ message: 'Invalid favorite type' });
  }
  try {
    const favorite = await favoriteModel.create({ user: req.user._id, [field]: req.params.id });
    return res.status(201).json({ favorite });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'Already saved' });
    return res.status(400).json({ message: 'Invalid favorite item' });
  }
}

async function removeFavorite(req, res) {
  const field = req.params.type === 'restaurant' ? 'foodPartner' : 'food';
  if (!['restaurant', 'food'].includes(req.params.type)) {
    return res.status(400).json({ message: 'Invalid favorite type' });
  }
  await favoriteModel.deleteOne({ user: req.user._id, [field]: req.params.id });
  res.json({ message: 'Favorite removed' });
}

module.exports = { listFavorites, addFavorite, removeFavorite };
