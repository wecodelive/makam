const app = require('../server/app.cjs');

module.exports = (req, res) => {
  // Vercel rewrites /api/(...) to /api/handler.js
  // Remove /api prefix so Express routes correctly
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4); // Remove '/api' prefix
  }
  if (!req.url) {
    req.url = '/';
  }
  
  // Call Express app - it handles the request/response
  app(req, res);
};
