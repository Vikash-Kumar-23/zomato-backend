const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const controller = require('../controllers/favorite.controller');

const router = express.Router();
router.use(authMiddleware.authUserMiddleware);
router.get('/', controller.listFavorites);
router.post('/:type/:id', controller.addFavorite);
router.delete('/:type/:id', controller.removeFavorite);

module.exports = router;
