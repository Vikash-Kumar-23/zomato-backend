const express = require('express');
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();
const multer = require('multer');

// Keep the upload in memory long enough to send it to ImageKit.
// Local disk storage is not persistent on production/serverless hosts.
const storage = multer.memoryStorage();

function videoFileFilter(req, file, cb) {
  if (file && file.mimetype && file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_TYPE'));
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: videoFileFilter,
});

// /api/food [protected] — Create food with an ImageKit-hosted video upload
router.post('/', authMiddleware.authFoodPartnerMiddleware, function (req, res, next) {
  upload.single('video')(req, res, function (err) {
    if (err) {
      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({ message: 'Only video files are allowed' });
      }
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Max 100MB' });
      }
      return res.status(400).json({ message: 'File upload error', error: err.message });
    }
    next();
  });
}, foodController.createFood);

//GET /api/food/ [protected]
router.get('/', foodController.getFoodItems);
router.patch('/:id', authMiddleware.authFoodPartnerMiddleware, foodController.updateFood);
router.delete('/:id', authMiddleware.authFoodPartnerMiddleware, foodController.deleteFood);



module.exports = router;
