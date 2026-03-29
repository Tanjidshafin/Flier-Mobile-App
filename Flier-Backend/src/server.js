const { createApp } = require('./app');
const { connectToDatabase, closeDatabaseConnection } = require('./config/database');
const { getEnvConfig } = require('./config/env');

async function startServer() {
  try {
    const config = getEnvConfig();
    await connectToDatabase({
      mongoUri: config.mongoUri,
      dbName: config.dbName,
    });

    const app = createApp({ clientUrl: config.clientUrl });
    const server = app.listen(config.port, () => {
      console.log(`Flier backend listening on port ${config.port}`);
    });

    const shutdown = async signal => {
      console.log(`${signal} received. Closing Flier backend...`);
      server.close(async () => {
        await closeDatabaseConnection();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('Failed to start Flier backend.');
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
