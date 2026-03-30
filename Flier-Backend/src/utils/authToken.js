const jwt = require('jsonwebtoken');

const { getEnvConfig } = require('../config/env');

function signAuthToken(userId) {
  const config = getEnvConfig();

  return jwt.sign({ sub: userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

function verifyAuthToken(token) {
  const config = getEnvConfig();
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signAuthToken, verifyAuthToken };
