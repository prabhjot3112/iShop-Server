const express = require('express')
const router  = express.Router()
const {
    registerVendor , loginVendor,
    getVendor
} = require('../controllers/vendor.controller')
const { vendorProtected } = require('../middlewares/protectedRoute')
router.post('/register',registerVendor).post('/login',loginVendor).get('/get',vendorProtected , getVendor)
module.exports = router