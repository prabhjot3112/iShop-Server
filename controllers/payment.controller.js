const express = require("express");
const router = express.Router();
const prisma = require('../utils/db');

const { createOrder } = require("../services/orderService");
const crypto = require('crypto');
const sendPushNotification = require("../utils/push");
const { notifyVendor } = require("../utils/sseManager");
// Middleware must set req.user from Supabase token
const createOrderController = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { totalAmount } = req.body;

    // ✅ Fetch cart with product details
    const cart = await prisma.cart.findUnique({
      where: { buyerId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // ✅ Split cart items into in-stock and out-of-stock
    const inStockItems = cart.items.filter(item => item.product.stock > 0);
    const outOfStockItems = cart.items.filter(item => item.product.stock <= 0);

    if (inStockItems.length === 0) {
      // ❌ No available products at all
      return res.status(400).json({
        error: "All products in your cart are out of stock.",
        outOfStockProducts: outOfStockItems.map(item => ({
          productId: item.product.id,
          name: item.product.name,
        })),
      });
    }

    // ✅ Proceed to create the order only for in-stock items
    const { razorpayOrder, dbOrder } = await createOrder({ buyerId, totalAmount });

    const orderItemsData = inStockItems.map(item => ({
      orderId: dbOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.product.price,
    }));

    await prisma.orderItem.createMany({
      data: orderItemsData,
    });

    // Optionally, remove purchased items from cart here

    return res.status(201).json({
      success: true,
      message:
        outOfStockItems.length > 0
          ? "Order Created with available products. Some items were out of stock and not included."
          : "Order Created successfully.",
      razorpayOrder,
      dbOrder,
      outOfStockProducts: outOfStockItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
      })),
    });
  } catch (err) {
    console.error("Error creating order:", err);
    return res.status(500).json({ error: "Failed to create order" });
  }
};




const verifyPayment = async (req, res, next) => {
  try {


  
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // 1. Validate signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    // 2. Update order status
    const order = await prisma.order.update({
      where: { paymentIntentId: razorpay_order_id },
      data: { status: "paid" },
    });

    const buyerId = req.user.id;

    // 3. Notify buyer
    const buyerSubscription = await prisma.notificationSubscription.findFirst({
      where: { userId: buyerId, role: 'buyer' },
    });


    
    if (buyerSubscription) {
      await sendPushNotification(buyerSubscription, {
        title: "Order Confirmed 🎉",
        body: "Your order has been successfully placed.",
      });
    }

    // 4. Notify vendors and update product quantities
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId: order.id },
      include: { product: true },
    });

    const notifiedVendors = new Set();

    for (const item of orderItems) {
      const vendorId = item.product.vendorId;

       const payload = {
    orderId: order.id,
    productId: item.product.id,
    productName: item.product.name,
    buyerId: req.user.id,
    // you can include timestamp, quantity, etc
  };
    notifyVendor(vendorId, payload);

      // Notify vendor only once
      if (!notifiedVendors.has(vendorId)) {
        const vendorSubscription = await prisma.notificationSubscription.findFirst({
          where: { userId: vendorId, role: 'vendor' },
        });

        if (vendorSubscription) {
          await sendPushNotification(vendorSubscription, {
            title: "New Order 📦",
            body: `Product: ${item.product.name} has been ordered!`,
          });
        }

        notifiedVendors.add(vendorId);
      }
      console.log('item is:',item)
      const productStock = item.product.stock - item.quantity;
      if(productStock < 0){
        return res.status(400).json({ success: false, message: `Insufficient stock for product ${item.product.name}` });
      }
      // Update product stock
      await prisma.product.update({
        where: { id: item.product.id },
        data: {
          stock: productStock
        },
      });
    }

    // 5. Clear the buyer's cart
    await prisma.cart.deleteMany({
      where: {
        buyerId: buyerId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and cart cleared",
      order,
    });

  } catch (error) {
    console.error("Verification failed:", error);
    next(error);
  }
};

  module.exports = {
    createOrderController ,
    verifyPayment
  }
