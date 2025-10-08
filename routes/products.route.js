const express = require('express')
const upload = require('../middlewares/upload');
const router = express.Router()
const {
    addProduct , searchProduct , productDetails,
    getRandomProducts,
    getProductByVendor
} = require('../controllers/products.controller')
const {vendorProtected} = require('../middlewares/protectedRoute')
router.get('/vendor/:vendorId' , vendorProtected ,  getProductByVendor ).get('/random' , getRandomProducts).post('/add', upload.single('image') ,vendorProtected , addProduct).get('/product/:id',productDetails).get('/search/:query' , searchProduct)
module.exports = router