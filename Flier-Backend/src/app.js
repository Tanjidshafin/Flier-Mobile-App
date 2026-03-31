const cors = require('cors');
const express = require('express');
const dns = require('dns');
dns.setServers(['1.1.1.1', '8.8.8.8']);
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFoundHandler');

function createCorsOptions(clientUrls = []) {
  if (clientUrls.length === 0) {
    return {
      credentials: true,
      origin: true,
    };
  }

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || clientUrls.includes(origin)) {
        return callback(null, true);
      }

      const error = new Error(`Origin ${origin} is not allowed by CORS.`);
      error.statusCode = 403;
      return callback(error);
    },
  };
}

function createApp({ clientUrls = [] }) {
  const app = express();

  app.use(cors(createCorsOptions(clientUrls)));
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
