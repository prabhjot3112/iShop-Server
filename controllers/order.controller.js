const prisma = require('../utils/db');

// GET /orders/:id
const getOrder = async (req, res , next) => {
  try {
    const orderId = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true }, // Include order items if needed
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    console.error("Fetch order error:", error);
    next(error)
  }
};

const getOrders = async (req, res, next) => {
  try {
    const buyerId = req.user.id;

    const orders = await prisma.order.findMany({
  where: { buyerId },
  include: {
    items: {
      include: {
        product: true, // include product details too
      }
    }
  },
  orderBy:{
    createdAt:'desc'
  }
});


    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

module.exports = {
    getOrder , getOrders
}
