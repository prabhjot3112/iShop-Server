const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message:{
        status:429,
        error:'Too many attempts , please try again after 15 minutes',
    },
    standardHeaders:true,
    legacyHeaders:false,
    skipSuccessfulRequests:false
})
// 💡 Optional: a lighter limiter for general API routes


const {
    register , login,
    getBuyer
} = require('../controllers/buyer.controller')
const { buyerProtected } = require('../middlewares/protectedRoute')
const { apiRateLimiter } = require('../utils/rateLimit')
router.post('/register' , authRateLimiter ,  register).post('/login', authRateLimiter , login).get('/get',buyerProtected , apiRateLimiter , getBuyer)

module.exports = router