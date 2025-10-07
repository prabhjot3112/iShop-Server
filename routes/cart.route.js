const express = require('express')
const router = express.Router()
const {addToCart , removeFromCart , updateCartItem, getCartItems, isProductInCart} = require('../controllers/cart.controller')
const { buyerProtected } = require('../middlewares/protectedRoute')
const { buyer } = require('../utils/db')
router.get('/in-cart/:productId' , buyerProtected ,  isProductInCart ).get('/get',buyerProtected ,  getCartItems).post('/add' , buyerProtected , addToCart ).delete('/delete/:productId' , buyerProtected , removeFromCart).put('/update/:productId/:quantity' , buyerProtected , updateCartItem)
module.exports = router