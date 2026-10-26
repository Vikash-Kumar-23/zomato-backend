const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const foodPartnerController = require('../controllers/food-partner.controller');
const foodController = require('../controllers/food.controller');

const router = express.Router();

router.patch('/me', authMiddleware.authFoodPartnerMiddleware, foodPartnerController.updateOwnProfile);

//GET /api/food-partner/:id
router.get('/:id', 
    foodPartnerController.getFoodPartnerProfile);

// Reviews endpoints
// GET reviews for a partner
router.get('/:id/reviews', foodPartnerController.getReviews);
// POST a review (user only)
router.post('/:id/reviews', authMiddleware.authUserMiddleware, foodPartnerController.createReview);

//GET /api/food-partner/:foodPartnerId/fooditems
router.get('/:foodPartnerId/fooditems', foodController.getFoodItemsByFoodPartnerId);

//GET /api/food-partner
router.get('/', foodPartnerController.getAllFoodPartners);

module.exports = router;
