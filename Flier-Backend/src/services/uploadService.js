const { v2: cloudinary } = require('cloudinary');

const { getEnvConfig } = require('../config/env');
const { AppError } = require('../utils/AppError');

function configureCloudinary() {
  const config = getEnvConfig();

  if (
    !config.cloudinaryCloudName ||
    !config.cloudinaryApiKey ||
    !config.cloudinaryApiSecret
  ) {
    throw new AppError(
      'Cloudinary is not configured on the backend environment.',
      503,
    );
  }

  cloudinary.config({
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    cloud_name: config.cloudinaryCloudName,
  });

  return config;
}

function createSignedUploadPayload({ config, folder, publicId }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder,
    public_id: publicId,
    timestamp,
  };
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    config.cloudinaryApiSecret,
  );

  return {
    apiKey: config.cloudinaryApiKey,
    cloudName: config.cloudinaryCloudName,
    folder,
    publicId,
    signature,
    timestamp,
  };
}

async function createAvatarUploadSignature(userId) {
  const config = configureCloudinary();
  const folder = 'flier/avatars';
  const publicId = `${userId}-${Date.now()}`;

  return createSignedUploadPayload({ config, folder, publicId });
}

async function createHotelImageUploadSignature(userId) {
  const config = configureCloudinary();
  const folder = 'flier/hotels';
  const publicId = `${userId}-hotel-${Date.now()}`;

  return createSignedUploadPayload({ config, folder, publicId });
}

module.exports = {
  createAvatarUploadSignature,
  createHotelImageUploadSignature,
};
