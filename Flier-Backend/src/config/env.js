const dotenv = require('dotenv');

dotenv.config({ quiet: true });

const requiredEnv = ['MONGODB_URI', 'DB_NAME'];

function parseCsvEnv(value) {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

function normalizeOrigin(origin) {
  if (!origin) {
    return null;
  }

  if (/^https?:\/\//i.test(origin)) {
    return origin;
  }

  return `https://${origin}`;
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getEnvConfig() {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isVercel = process.env.VERCEL === '1';
  const missing = requiredEnv.filter(key => !process.env[key]);

  if ((nodeEnv === 'production' || isVercel) && !process.env.JWT_SECRET) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${[...new Set(missing)].join(', ')}`,
    );
  }

  const configuredOrigins = [
    ...parseCsvEnv(process.env.CLIENT_URLS),
    process.env.CLIENT_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
  ]
    .map(normalizeOrigin)
    .filter(Boolean);

  return {
    adminBootstrapEmails: [
      ...new Set(
        parseCsvEnv(process.env.ADMIN_BOOTSTRAP_EMAILS)
          .map(normalizeEmail)
          .filter(Boolean),
      ),
    ],
    port: Number(process.env.PORT || 5000),
    mongoUri: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME,
    clientUrl: configuredOrigins[0] || null,
    clientUrls: [...new Set(configuredOrigins)],
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || null,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || null,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    jwtSecret: process.env.JWT_SECRET || 'flier-dev-secret',
    nodeEnv,
    isVercel,
    stripeEphemeralApiVersion:
      process.env.STRIPE_EPHEMERAL_API_VERSION || '2024-06-20',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || null,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || null,
  };
}

module.exports = { getEnvConfig };
