const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const reviewModel = require('../models/review.model');
const mongoose = require('mongoose');

function isRestaurantOpen(partner, now = new Date()) {
    if (!partner?.openingTime || !partner?.closingTime) return null;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMinute] = partner.openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = partner.closingTime.split(':').map(Number);
    if (![openHour, openMinute, closeHour, closeMinute].every(Number.isFinite)) return null;
    const opening = openHour * 60 + openMinute;
    const closing = closeHour * 60 + closeMinute;
    return closing < opening
      ? currentMinutes >= opening || currentMinutes < closing
      : currentMinutes >= opening && currentMinutes < closing;
}

async function getFoodPartnerProfile(req, res) {
    const foodPartnerId = req.params.id;
    console.log('Received foodPartnerId:', foodPartnerId);
    try {
        const foodPartner = await foodPartnerModel.findById(foodPartnerId);
        const foodItems = await foodModel.find({ foodPartner: foodPartnerId });
        const reviews = await reviewModel
          .find({ foodPartner: foodPartnerId })
          .sort({ createdAt: -1 })
          .populate('user', 'fullName');
        const ratingTotal = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length ? Number((ratingTotal / reviews.length).toFixed(1)) : null;
        console.log('Food partner found:', foodPartner);
    if (!foodPartner) {
      // Return a stub profile for non-existent IDs to prevent 404 on frontend
      return res.status(200).json({
        foodPartner: {
          _id: req.params.id,
          name: "Unknown Partner",
          contactName: "",
          phone: "",
          address: "",
          email: "",
          customerServicePhone: "", // Default for stub
          customerServiceEmail: "", // Default for stub
          totalMeals: 0,
          customerServe: 0,
          averageRating: null,
          reviewCount: 0,
          isOpen: null,
        },
        foodItems: [],
        reviews: [],
      });
    }
    res.status(200).json({
      foodPartner,
      foodItems,
      reviews,
      averageRating,
      reviewCount: reviews.length,
      isOpen: isRestaurantOpen(foodPartner),
    });
    } catch (error) {
        console.error('Error in getFoodPartnerProfile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getAllFoodPartners(req, res) {
    try {
        const foodPartners = await foodPartnerModel.find({});
        res.status(200).json({ message: 'Food partners retrieved successfully', foodPartners });
    } catch (error) {
        console.error('Error fetching all food partners:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateOwnProfile(req, res) {
  const allowed = [
    'name', 'description', 'contactName', 'phone', 'address', 'cuisines',
    'openingTime', 'closingTime', 'estimatedPrepTime', 'deliveryAvailable',
    'pickupAvailable', 'costForTwo', 'customerServicePhone', 'customerServiceEmail',
  ];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (updates.cuisines && typeof updates.cuisines === 'string') {
    updates.cuisines = updates.cuisines.split(',').map((item) => item.trim()).filter(Boolean);
  }
  for (const field of ['deliveryAvailable', 'pickupAvailable']) {
    if (updates[field] !== undefined) updates[field] = updates[field] === true || updates[field] === 'true';
  }
  for (const field of ['estimatedPrepTime', 'costForTwo']) {
    if (updates[field] !== undefined) {
      updates[field] = Number(updates[field]);
      if (!Number.isFinite(updates[field]) || updates[field] < 0) return res.status(400).json({ message: `Invalid ${field}` });
    }
  }
  const foodPartner = await foodPartnerModel.findByIdAndUpdate(req.foodPartner._id, updates, { new: true, runValidators: true });
  res.json({ foodPartner });
}

async function createReview(req, res) {
  const partnerId = req.params.id;
  const { rating, comment } = req.body;
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'Invalid partner id' });
    }
    const r = Number(rating);
    if (!r || r < 1 || r > 5 || !comment || typeof comment !== 'string') {
      return res.status(400).json({ message: 'Invalid review data' });
    }
    const exists = await foodPartnerModel.findById(partnerId);
    if (!exists) {
      return res.status(404).json({ message: 'Food partner not found' });
    }
    const existingReview = await reviewModel.findOne({ foodPartner: partnerId, user: req.user._id });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this restaurant' });
    }
    const review = await reviewModel.create({
      foodPartner: partnerId,
      user: req.user._id,
      rating: r,
      comment,
    });
    res.status(201).json({ message: 'Review created successfully', review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getReviews(req, res) {
  const partnerId = req.params.id;
  try {
    if (!mongoose.Types.ObjectId.isValid(partnerId)) {
      return res.status(400).json({ message: 'Invalid partner id' });
    }
    const page = Math.max(1, Number.parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit || '10', 10)));
    const reviews = await reviewModel
      .find({ foodPartner: partnerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'fullName');
    const total = await reviewModel.countDocuments({ foodPartner: partnerId });
    res.status(200).json({ reviews, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
    getFoodPartnerProfile,
    getAllFoodPartners,
    updateOwnProfile,
    createReview,
    getReviews,
}
