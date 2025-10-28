const express = require('express')
const router = express.Router()
const { fetchCategories, getProductCategoriesForAll } = require('../../controllers/product/product.category.controller')
const { vendorProtected } = require('../../middlewares/protectedRoute')
router.get('/' , vendorProtected , fetchCategories)
router.get('/all',getProductCategoriesForAll)

module.exports = router