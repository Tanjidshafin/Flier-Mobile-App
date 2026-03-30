const cors = require('cors');
const express = require('express');
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');

function createApp({ clientUrl }) {
  const app = express();

  app.use(
    cors({
      origin: clientUrl,
      credentials: true,
    }),
  );
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Welcome to the Flier backend API.',
    });
  });

  app.use('/api', routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
