const app = require('../server/app.cjs');

module.exports = (req, res) => {
  // Ensure response object has necessary methods for Express
  if (!res.status) {
    res.status = function(code) {
      this.statusCode = code;
      return this;
    };
  }
  
  if (!res.json) {
    res.json = function(data) {
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(data));
    };
  }
  
  if (!res.send) {
    res.send = function(data) {
      if (!this.getHeader('Content-Type')) {
        this.setHeader('Content-Type', 'text/html; charset=utf-8');
      }
      this.end(data);
    };
  }
  
  if (!res.header) {
    res.header = res.setHeader;
  }
  
  // Vercel rewrites /api/(...) to /api/handler.js
  // Remove /api prefix so Express routes correctly
  if (req.url.startsWith('/api/')) {
    req.url = req.url.slice(4); // Remove '/api' prefix
  }
  if (!req.url) {
    req.url = '/';
  }
  
  // Call Express app - it handles the request/response
  try {
    app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
