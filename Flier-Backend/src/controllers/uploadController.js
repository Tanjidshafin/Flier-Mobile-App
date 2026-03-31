const uploadService = require('../services/uploadService');

async function createAvatarUploadSignature(req, res) {
  const data = await uploadService.createAvatarUploadSignature(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Avatar upload signature created successfully.',
    data,
  });
}

async function createHotelImageUploadSignature(req, res) {
  const data = await uploadService.createHotelImageUploadSignature(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Hotel image upload signature created successfully.',
    data,
  });
}

module.exports = {
  createAvatarUploadSignature,
  createHotelImageUploadSignature,
};
