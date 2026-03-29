const { getDatabaseStatus } = require('../config/database');

function getHealthStatus(req, res) {
  res.status(200).json({
    success: true,
    message: 'Flier backend is healthy.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      databaseConnected: getDatabaseStatus(),
    },
  });
}

module.exports = { getHealthStatus };
