const express = require('express')
const upload = require('../middlewares/upload');
const router = express.Router()
const {
    addProduct , searchProduct , productDetails,
    getRandomProducts,
    getProductByVendor,
    editProduct,
    deleteProduct
} = require('../controllers/products.controller')
const {vendorProtected} = require('../middlewares/protectedRoute')
router.get('/vendor' , vendorProtected ,  getProductByVendor ).put('/update/:id' , upload.single('image') , vendorProtected ,  editProduct).get('/random' , getRandomProducts).post('/add', upload.single('image') ,vendorProtected , addProduct).get('/product/:id',productDetails).get('/search/:query' , searchProduct).delete('/product/delete/:productId' , vendorProtected , deleteProduct)
module.exports = router