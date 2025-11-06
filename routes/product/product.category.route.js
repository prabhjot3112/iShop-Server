const express = require('express')
const router = express.Router()
const { fetchCategories, getProductCategoriesForAll, searchProductByCategory } = require('../../controllers/product/product.category.controller')
const { vendorProtected } = require('../../middlewares/protectedRoute')
router.get('/' , vendorProtected , fetchCategories)
router.get('/all',getProductCategoriesForAll).get('/get-product-by-category/:category',searchProductByCategory)

module.exports = router