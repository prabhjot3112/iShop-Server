const rateLimit = require('express-rate-limit')
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1000, // Allow 100 requests per minute per IP
  message: {
    status: 429,
    error: 'Too many requests, slow down!',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip:(req,res) => {
    return req.path === '/payment/verify-payment' || req.path === '/payment/create-order' || req.path === '/vendor/get' || req.path === '/buyer/get' || req.path === '/notifications/unsubscribe/vendor' || req.path === '/notifications/unsubscribe/buyer'
  }
});
module.exports = {
    apiRateLimiter
}