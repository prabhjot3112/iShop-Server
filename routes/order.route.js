const express = require("express");
const { getOrder, getOrders, getOrdersForVendor, updateOrderItemStatus, trackOrder, buyerUpdates, vendorUpdates } = require("../controllers/order.controller");
const { buyerProtected, vendorProtected } = require("../middlewares/protectedRoute");
const router = express.Router();
router.get('/order/:id' , buyerProtected
 ,  getOrder).get('/updates/buyer/:token' , buyerUpdates).get('/updates/vendor', vendorProtected ,  vendorUpdates).get('/all',buyerProtected , getOrders).get('/vendor', vendorProtected , getOrdersForVendor).put('/order/update/item/status' , vendorProtected , updateOrderItemStatus).get('/order/item/track/:orderId' , buyerProtected ,  trackOrder)
module.exports = router