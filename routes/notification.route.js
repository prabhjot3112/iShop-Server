// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, checkPushSubscriptionForBuyer, checkPushSubscriptionForVendor, inAppBuyerNotification, inAppVendorNotification, deleteInAppNotification } = require('../controllers/notification.controller');
const { buyerProtected, vendorProtected, commonProtected } = require('../middlewares/protectedRoute');

router.post('/subscribe/buyer', buyerProtected, subscribe);
router.post('/unsubscribe/buyer', buyerProtected, unsubscribe);
router.post('/subscribe/vendor', vendorProtected, subscribe);
router.post('/unsubscribe/vendor', vendorProtected, unsubscribe);

router.get('/check/buyer', buyerProtected, checkPushSubscriptionForBuyer);
router.get('/noti/buyer', buyerProtected, inAppBuyerNotification);
router.get('/noti/vendor', vendorProtected, inAppVendorNotification);
router.delete('/delete/:role/:index'  , commonProtected , deleteInAppNotification)
router.get('/check/vendor', vendorProtected, checkPushSubscriptionForVendor);

module.exports = router;

