const deviceService = require('../services/deviceService');

async function registerDevice(req, res) {
  const data = await deviceService.registerDevice(req.user._id, req.body);

  res.status(200).json({
    success: true,
    message: 'Device registered successfully.',
    data,
  });
}

module.exports = {
  registerDevice,
};
