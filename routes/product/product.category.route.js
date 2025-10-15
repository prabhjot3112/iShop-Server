const express = require('express')
const router = express.Router()
const { fetchCategories } = require('../../controllers/product/product.category.controller')
const { vendorProtected } = require('../../middlewares/protectedRoute')

router.get('/' , vendorProtected , fetchCategories)

module.exports = router