const authService = require('../services/authService');

async function register(req, res) {
  const data = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    data,
  });
}

async function login(req, res) {
  const data = await authService.loginUser(req.body);

  res.status(200).json({
    success: true,
    message: 'Logged in successfully.',
    data,
  });
}

async function me(req, res) {
  const data = await authService.getCurrentUser(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Current user fetched successfully.',
    data,
  });
}

module.exports = {
  login,
  me,
  register,
};
