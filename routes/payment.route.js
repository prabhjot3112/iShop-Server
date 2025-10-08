const express = require('express')
const { buyerProtected } = require('../middlewares/protectedRoute')
const { createOrderController, verifyPayment} = require('../controllers/payment.controller')
const router = express.Router()
router.post('/create-order' , buyerProtected , createOrderController).post('/verify-payment' , buyerProtected , verifyPayment)
module.exports = router