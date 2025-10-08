const express = require('express')
const router = express.Router()
const {
    register , login,
    getBuyer
} = require('../controllers/buyer.controller')
const { buyerProtected } = require('../middlewares/protectedRoute')
router.post('/register' , register).post('/login',login).get('/get',buyerProtected , getBuyer)

module.exports = router