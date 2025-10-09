// controllers/notification.controller.js
const prisma = require('../utils/db');

const subscribe = async (req, res, next) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: 'Invalid subscription object' });
    }

    const userId = req.user.id;
    const role = req.user.role; // Assuming 'buyer' or 'vendor'

    // Upsert to avoid duplicates
    await prisma.notificationSubscription.upsert({
      where: { endpoint },
      update: {
        keys,
        userId,
        role,
      },
      create: {
        endpoint,
        keys,
        userId,
        role,
      }
    });

    res.status(200).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    next(error);
  }
};

const  unsubscribe = async (req, res, next) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }

    await prisma.notificationSubscription.deleteMany({
      where: { endpoint }
    });

    res.status(200).json({ message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    next(error);
  }
};

// Route: GET /notifications/check/:role
const checkPushSubscriptionForBuyer = async (req, res) => {
  try {
    const subscription = await prisma.notificationSubscription.findFirst({
      where: {
        userId: req.user.id,
        role: 'buyer',
      },
    });

    res.json({ isSubscribed: !!subscription });
  } catch (err) {
    console.error('Buyer check failed:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



// Route: GET /notifications/check/:role
const checkPushSubscriptionForVendor = async (req, res) => {
  try {
    const subscription = await prisma.notificationSubscription.findFirst({
      where: {
        userId: req.user.id,
        role: 'buyer',
      },
    });

    res.json({ isSubscribed: !!subscription });
  } catch (err) {
    console.error('Buyer check failed:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

module.exports = {
    subscribe , unsubscribe , checkPushSubscriptionForBuyer , checkPushSubscriptionForVendor
}