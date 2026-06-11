const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: { message: 'Too many requests, please try again later', statusCode: 429 },
  },
});

module.exports = { authLimiter };
