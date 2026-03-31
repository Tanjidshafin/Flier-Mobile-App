const { closeDatabaseConnection } = require('./config/database');
const { initializeApp } = require('./bootstrap');
const { attachSocketServer } = require('./services/socketServer');

async function startServer() {
  try {
    const { app, config } = await initializeApp();
    const server = app.listen(config.port, () => {
      console.log(`Flier backend listening on port ${config.port}`);
    });
    attachSocketServer(server, config.clientUrls);

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
