const authService = require('../services/authService');
const userService = require('../services/userService');

async function updateProfile(req, res) {
  const profile = await userService.updateProfile(req.user._id, req.body);
  const session = await authService.getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully.',
    data: {
      session,
      user: profile,
    },
  });
}

module.exports = {
  updateProfile,
};
