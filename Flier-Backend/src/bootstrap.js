const { createApp } = require('./app');
const { connectToDatabase } = require('./config/database');
const { getEnvConfig } = require('./config/env');

let appPromise;

async function initializeApp() {
  if (!appPromise) {
    appPromise = (async () => {
      const config = getEnvConfig();

      await connectToDatabase({
        mongoUri: config.mongoUri,
        dbName: config.dbName,
      });

      return {
        app: createApp({ clientUrls: config.clientUrls }),
        config,
      };
    })().catch(error => {
      appPromise = undefined;
      throw error;
    });
  }

  return appPromise;
}

module.exports = { initializeApp };
