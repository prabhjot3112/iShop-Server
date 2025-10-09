const express = require("express");
const { getOrder, getOrders, getOrdersForVendor } = require("../controllers/order.controller");
const { buyerProtected, vendorProtected } = require("../middlewares/protectedRoute");
const router = express.Router();
router.get('/order/:id' , buyerProtected
 ,  getOrder).get('/all',buyerProtected , getOrders).get('/vendor', vendorProtected , getOrdersForVendor)
module.exports = router