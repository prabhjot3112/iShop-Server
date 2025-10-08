const express = require("express");
const { getOrder, getOrders } = require("../controllers/order.controller");
const { buyerProtected } = require("../middlewares/protectedRoute");
const router = express.Router();
router.get('/order/:id' , buyerProtected
 ,  getOrder).get('/all',buyerProtected , getOrders)
module.exports = router