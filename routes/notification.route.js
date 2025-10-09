// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, checkPushSubscriptionForBuyer, checkPushSubscriptionForVendor } = require('../controllers/notification.controller');
const { buyerProtected, vendorProtected } = require('../middlewares/protectedRoute');

router.post('/subscribe/buyer', buyerProtected, subscribe);
router.post('/unsubscribe/buyer', buyerProtected, unsubscribe);
router.post('/subscribe/vendor', vendorProtected, subscribe);
router.post('/unsubscribe/vendor', vendorProtected, unsubscribe).get('/check/buyer' , buyerProtected , checkPushSubscriptionForBuyer).get('/check/vendor' , vendorProtected , checkPushSubscriptionForVendor)

module.exports = router;
