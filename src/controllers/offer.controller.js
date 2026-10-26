const offerModel = require('../models/offer.model');

async function listActiveOffers(req, res) {
  const now = new Date();
  const offers = await offerModel.find({
    foodPartner: req.params.partnerId,
    isActive: true,
    startsAt: { $lte: now },
    expiresAt: { $gt: now },
  }).sort({ expiresAt: 1 });
  res.json({ offers });
}

async function createOffer(req, res) {
  try {
    const offer = await offerModel.create({ ...req.body, foodPartner: req.foodPartner._id });
    res.status(201).json({ offer });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Invalid offer' });
  }
}

async function deleteOffer(req, res) {
  const result = await offerModel.deleteOne({ _id: req.params.id, foodPartner: req.foodPartner._id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Offer not found' });
  res.json({ message: 'Offer deleted' });
}

module.exports = { listActiveOffers, createOffer, deleteOffer };
