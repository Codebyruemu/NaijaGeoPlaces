// middlewares.js - Shared middleware for the Nigeria GeoJSON API server
const cors = require('cors');

// Open CORS since this is a public open-data API (no cookies/credentials involved)
const corsMiddleware = cors({ origin: '*' });

// Random delay (200-700ms) in development mode to simulate a real network API
function delayMiddleware(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    const delay = Math.random() * 500 + 200;
    setTimeout(next, delay);
  } else {
    next();
  }
}

// Log every request in non-production mode
function loggerMiddleware(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  }
  next();
}

// Realistic response headers, matching the fake-apis pattern
function headersMiddleware(req, res, next) {
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Response-Time', Date.now().toString());
  next();
}

module.exports = { corsMiddleware, delayMiddleware, loggerMiddleware, headersMiddleware };
