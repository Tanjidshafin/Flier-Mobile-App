const { initializeApp } = require('../src/bootstrap');

module.exports = async (req, res) => {
  const { app } = await initializeApp();
  return app(req, res);
};
