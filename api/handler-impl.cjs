const app = require('../server/app.cjs');

module.exports = function handler(req, res) {
  // Remove /api prefix from the request URL for the Express app
  const url = req.url.replace(/^\/api/, '') || '/';
  req.url = url;
  app(req, res);
};
