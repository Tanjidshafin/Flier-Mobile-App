const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const requiredEnv = ['PORT', 'MONGODB_URI', 'DB_NAME', 'CLIENT_URL'];

function getEnvConfig() {
  const missing = requiredEnv.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  return {
    port: Number(process.env.PORT),
    mongoUri: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME,
    clientUrl: process.env.CLIENT_URL,
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

module.exports = { getEnvConfig };
