// utils/push.js
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:prabhjot.arora@pragmatyc.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    console.error('Error sending push notification:', err);
    
  }
};

module.exports = sendPushNotification;
