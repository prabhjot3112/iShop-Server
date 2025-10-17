const express = require('express')
const router  = express.Router()
const {
    registerVendor , loginVendor,
    getVendor,
    getSalesSummary
} = require('../controllers/vendor.controller')
const { vendorProtected } = require('../middlewares/protectedRoute')
const { body } = require('express-validator')
router.post('/register',[
    body('phone').isLength({ min: 10, max: 10 }).withMessage('Phone must be 10 digits long'),
    body('password').isStrongPassword().withMessage('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one symbol'),
    body('email').isEmail().withMessage('Invalid email format') , body('name').notEmpty().withMessage('Name is required'), body('password').isLength({ min: 6 }), body('phone').isNumeric().withMessage('Phone must be a number') , body('companyName').notEmpty().withMessage('Company Name is required') , body('name').isString().withMessage('Name must contain only letters')],registerVendor).post('/login',
        [body('email').isEmail().withMessage('Invalid Email Format')],
        loginVendor).get('/get',vendorProtected , getVendor).get('/get-sales', vendorProtected , getSalesSummary)
module.exports = router