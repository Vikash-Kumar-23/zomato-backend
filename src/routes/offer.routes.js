const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/offer.controller');

const router = express.Router();
router.get('/partner/:partnerId', controller.listActiveOffers);
router.post('/', authMiddleware.authFoodPartnerMiddleware, controller.createOffer);
router.delete('/:id', authMiddleware.authFoodPartnerMiddleware, controller.deleteOffer);

module.exports = router;
