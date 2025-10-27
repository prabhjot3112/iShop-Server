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

const inAppBuyerNotification = async (req, res) => {
  try {
    console.log('User ID:', req.user.id);
    console.log('Role:', req.role);

    const notifications = await prisma.inAppNotification.findMany({
      where: {
        userId: req.user.id,
        role: req.role,
      },
      select: {
        message: true, // only fetch the message field
      },
    });

    // Extract the message arrays into a single array if you want to flatten
    if(notifications.length == 0) return res.json({message:'No notifications'})
    const messages = notifications.map(n => n.message).flat();

    console.log('messages:', messages);

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
};



const inAppVendorNotification = async(req,res) => {
  try {
    console.log('User ID:', req.user.id);
    console.log('Role:', req.role);

    const notifications = await prisma.inAppNotification.findMany({
      where: {
        userId: req.user.id,
        role: req.role,
      },
      select: {
        message: true, // only fetch the message field
      },
    });

    // Extract the message arrays into a single array if you want to flatten
    if(notifications.length == 0) return res.json({message:'No notifications'})
    const messages = notifications.map(n => n.message).flat();

    console.log('messages:', messages);

    res.status(200).json({ messages });
  }
  catch (error) {
       res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}


const deleteInAppNotification =  async (req, res) => {
  const { role, index } = req.params;
  const userId = req.user.id;

  try {
    const notification = await prisma.inAppNotification.findFirst({
      where: { userId, role },
    });

    if (!notification) return res.status(404).json({ error: 'No notifications found' });

    const updatedMessages = [...notification.message];
    const actualIndex = updatedMessages.length - 1 - Number(index); // because frontend reversed
    updatedMessages.splice(actualIndex, 1);

    await prisma.inAppNotification.update({
      where: { id: notification.id },
      data: { message: updatedMessages },
    });

    res.json({ success: true, messages: updatedMessages });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Failed to delete notification' });
  }
}

module.exports = {
    subscribe , unsubscribe , checkPushSubscriptionForBuyer , checkPushSubscriptionForVendor
    , inAppBuyerNotification ,  inAppVendorNotification , deleteInAppNotification
}