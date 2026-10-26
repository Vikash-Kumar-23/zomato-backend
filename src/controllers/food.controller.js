const foodModel = require('../models/food.model');
const foodPartnerModel = require('../models/foodpartner.model');
const path = require('path');
const { uploadFile } = require('../services/storage.service');

function parseNumber(value, name) {
  if (value === undefined || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${name} must be a number`);
  return parsed;
}

async function createFood(req, res) {
  try {
    const {
      name,
      description,
      price,
      isVeg,
      category,
      portionSize,
      isAvailable,
      isBestseller,
    } = req.body;

    if (!req.foodPartner) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Invalid name' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const parsedPrice = price === undefined || price === '' ? undefined : Number(price);
    if (parsedPrice !== undefined && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
      return res.status(400).json({ message: 'Price must be a non-negative number' });
    }

    const extension = path.extname(req.file.originalname) || '.mp4';
    const filename = `food-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    const uploadedFile = await uploadFile(req.file.buffer, filename);
    const videoUrl = uploadedFile.url;
    if (!videoUrl) {
      return res.status(502).json({ message: 'Video storage did not return a public URL' });
    }

    const foodItem = await foodModel.create({
      name,
      description,
      price: parsedPrice,
      isVeg: isVeg === true || isVeg === 'true',
      category,
      portionSize,
      isAvailable: isAvailable === undefined ? true : isAvailable !== 'false' && isAvailable !== false,
      isBestseller: isBestseller === true || isBestseller === 'true',
      video: videoUrl,
      foodPartner: req.foodPartner._id,
    });

    res.status(201).json({ message: 'Food created successfully', food: foodItem });
  } catch (error) {
    console.error('Error creating food:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getFoodItems(req,res){
    try {
      const { q, category, isVeg, minPrice, maxPrice } = req.query;
      const query = {};
      if (category) query.category = category.trim();
      if (isVeg !== undefined) {
        if (!['true', 'false'].includes(isVeg)) return res.status(400).json({ message: 'isVeg must be true or false' });
        query.isVeg = isVeg === 'true';
      }
      const min = parseNumber(minPrice, 'minPrice');
      const max = parseNumber(maxPrice, 'maxPrice');
      if (min !== undefined || max !== undefined) {
        query.price = {};
        if (min !== undefined) query.price.$gte = min;
        if (max !== undefined) query.price.$lte = max;
      }
      if (min !== undefined && max !== undefined && min > max) {
        return res.status(400).json({ message: 'minPrice cannot exceed maxPrice' });
      }
      if (q?.trim()) {
        const expression = new RegExp(q.trim(), 'i');
        const matchingPartners = await foodPartnerModel.find({
          $or: [{ name: expression }, { cuisines: expression }],
        }).select('_id');
        query.$or = [
          { name: expression },
          { foodPartner: { $in: matchingPartners.map((partner) => partner._id) } },
        ];
      }
      const foodItems = await foodModel.find(query).sort({ isBestseller: -1, createdAt: -1 });
      res.status(200).json({ message: 'Food items retrieved successfully', foodItems });
    } catch (error) {
      res.status(400).json({ message: error.message || 'Invalid food filters' });
    }
}

async function getFoodItemsByFoodPartnerId(req, res) {
    const { foodPartnerId } = req.params;
    try {
        const foodItems = await foodModel.find({ foodPartner: foodPartnerId });
        res.status(200).json({ message: 'Food items retrieved successfully', foodItems });
    } catch (error) {
        console.error('Error fetching food items by food partner ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateFood(req, res) {
  const allowed = ['name', 'description', 'price', 'isVeg', 'category', 'portionSize', 'isAvailable', 'isBestseller'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (updates.price !== undefined) {
    updates.price = Number(updates.price);
    if (!Number.isFinite(updates.price) || updates.price < 0) return res.status(400).json({ message: 'Invalid price' });
  }
  for (const field of ['isVeg', 'isAvailable', 'isBestseller']) {
    if (updates[field] !== undefined) updates[field] = updates[field] === true || updates[field] === 'true';
  }
  const food = await foodModel.findOneAndUpdate(
    { _id: req.params.id, foodPartner: req.foodPartner._id },
    updates,
    { new: true, runValidators: true },
  );
  if (!food) return res.status(404).json({ message: 'Food item not found' });
  res.json({ food });
}

async function deleteFood(req, res) {
  const result = await foodModel.deleteOne({ _id: req.params.id, foodPartner: req.foodPartner._id });
  if (!result.deletedCount) return res.status(404).json({ message: 'Food item not found' });
  res.json({ message: 'Food item deleted' });
}

module.exports = {
    createFood,
    getFoodItems,
    getFoodItemsByFoodPartnerId,
    updateFood,
    deleteFood,
}
