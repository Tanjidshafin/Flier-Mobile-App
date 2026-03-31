const { Device } = require('../models/Device');

async function registerDevice(userId, payload) {
  const token = String(payload.token || '').trim();
  const platform = String(payload.platform || 'unknown').trim();

  if (!token) {
    return null;
  }

  await Device.findOneAndUpdate(
    { token },
    {
      lastSeenAt: new Date(),
      platform,
      token,
      user: userId,
    },
    { new: true, setDefaultsOnInsert: true, upsert: true },
  );

  return {
    platform,
    token,
  };
}

module.exports = {
  registerDevice,
};
