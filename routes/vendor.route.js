const express = require('express')
const router  = express.Router()
const {
    registerVendor , loginVendor
} = require('../controllers/vendor.controller')
router.post('/register',registerVendor).post('/login',loginVendor)
module.exports = router