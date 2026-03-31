const express = require('express');

const {
  createAvatarUploadSignature,
  createHotelImageUploadSignature,
} = require('../controllers/uploadController');
const { authenticateRequest, requireAdmin } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

router.use(authenticateRequest);
router.post('/avatar-signature', asyncHandler(createAvatarUploadSignature));
router.post(
  '/hotel-image-signature',
  requireAdmin,
  asyncHandler(createHotelImageUploadSignature),
);

module.exports = router;
