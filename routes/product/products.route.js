const express = require('express')
const upload = require('../../middlewares/upload');
const router = express.Router()
const {
    addProduct , searchProduct , productDetails,
    getRandomProducts,
    getProductByVendor,
    editProduct,
    deleteProduct
} = require('../../controllers/product/products.controller')
const {vendorProtected} = require('../../middlewares/protectedRoute');
const { body } = require('express-validator');

const productValidationRules = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

  body('description')
    .optional()
    .isLength({ max: 500 }).withMessage('Description too long'),

  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ gt: 0 }).withMessage('Price must be a number greater than 0'),

  body('stock')
    .notEmpty().withMessage('Stock is required')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),

  body('category')
    .notEmpty().withMessage('Category is required'),
];

router.get('/vendor' , vendorProtected ,  getProductByVendor ).put('/update/:id' , upload.single('image') , vendorProtected ,  editProduct).get('/random' , getRandomProducts).post('/add',
    
    upload.single('image') ,vendorProtected , productValidationRules ,  addProduct).get('/product/:id',productDetails).get('/search/:query' , searchProduct).delete('/product/delete/:productId' , vendorProtected , deleteProduct)
module.exports = router