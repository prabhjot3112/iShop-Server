const Razorpay = require("razorpay");
const prisma = require('../utils/db'); // your Prisma client instance

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


const createOrder = async ({ buyerId, totalAmount }) => {
  try {
    if (!buyerId || !totalAmount) {
      throw new Error("Missing buyerId or totalAmount");
    }

    // 1. Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // convert to paise
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    });

    // 2. Save order in your database
    const dbOrder = await prisma.order.create({
      data: {
        buyerId,
        totalAmount:Number(totalAmount),
        paymentIntentId: razorpayOrder.id, // Razorpay order ID
        status: "pending",
      },
    });

    return {
      razorpayOrder,
      dbOrder,
    };
  } catch (error) {
    console.error("[createOrder] Error:", error);
    throw error;
  }
};

module.exports = {
  createOrder,
};
