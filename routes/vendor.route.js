const express = require('express')
const router  = express.Router()
const {
    registerVendor , loginVendor,
    getVendor,
    getSalesSummary
} = require('../controllers/vendor.controller')
const { vendorProtected } = require('../middlewares/protectedRoute')
router.post('/register',registerVendor).post('/login',loginVendor).get('/get',vendorProtected , getVendor).get('/get-sales' , vendorProtected , getSalesSummary)
module.exports = router