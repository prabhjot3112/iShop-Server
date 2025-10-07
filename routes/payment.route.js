const express = require('express')
const { buyerProtected } = require('../middlewares/protectedRoute')
const {paymentIntent} = require('../controllers/payment.controller')
const router = express.Router()
router.post('/create-payment-intent' , buyerProtected , paymentIntent)
module.exports = router