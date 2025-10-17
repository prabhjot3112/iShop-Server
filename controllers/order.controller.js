const prisma = require('../utils/db');
const sendPushNotification = require('../utils/push');
const jwt = require('jsonwebtoken');
const { addVendorClient, removeVendorClient } = require('../utils/sseManager');
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

const sseClients = {}; 

const buyerUpdates = (req, res) => {
  console.log('token:', req.params.token)
  const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
  console.log(decoded)
  const buyerId = decoded.id;
  
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  if (!sseClients[buyerId]) {
    sseClients[buyerId] = [];
  }
  sseClients[buyerId].push(res);

  req.on('close', () => {
    sseClients[buyerId] = sseClients[buyerId].filter(r => r !== res);
  });
}


function keepAlive(res) {
  res.write(`: ping\n\n`);
}


const KEEP_ALIVE_INTERVAL = 20 * 1000;
const vendorUpdates = (req, res) => {
 
  const vendorId = req.user.id;
  
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  addVendorClient(vendorId , res)

   const interval = setInterval(() => {
    keepAlive(res);
  }, KEEP_ALIVE_INTERVAL);
  req.on('close', () => {
     clearInterval(interval);
    removeVendorClient(vendorId , res)
  });
}

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


const updateOrderItemStatus = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { orderItemId, status } = req.body;

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: parseInt(orderItemId) },
      include: {
        product: true,
        order: true, // Include order to access buyer info
      },
    });

    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    if (orderItem.product.vendorId !== vendorId) {
      return res.status(403).json({ message: "You are not authorized to update this item" });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: parseInt(orderItemId) },
      data: { status },
    });

    // Notify buyer
    const buyerId = orderItem.order.buyerId; 

    const buyerSubscription = await prisma.notificationSubscription.findFirst({
      where: { userId: buyerId, role: 'buyer' },
    });


     const notifyBuyerSSE = (buyerId, data) => {
      try{

        if (sseClients[buyerId]) {
    sseClients[buyerId].forEach(res => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }
  }catch(e){
    console.error('SSE notify error:',e)
  }
};
    if (buyerSubscription) {
      const statusMessages = {
        pending: `Your order [${orderItem.product.name}] is pending confirmation.`,
        packed: `Your order [${orderItem.product.name}] has been packed.`,
        dispatched: `Your order [${orderItem.product.name}] is on its way.`,
        "out-for-delivery": `Your order [${orderItem.product.name}] is out for delivery!`,
        delivered: `Your order [${orderItem.product.name}] has been delivered. Enjoy!`,
        cancelled: `Your order [${orderItem.product.name}] has been cancelled.`,
      };

      await sendPushNotification(buyerSubscription, {
        title: `Order Status: ${status.toUpperCase()}`,
        body: statusMessages[status] || "Your order status has been updated.",
      });
notifyBuyerSSE(buyerId, {
  orderItemId,
  status,
  productName: orderItem.product.name,
  message: statusMessages[status] || "Your order status has been updated."
});
    }
    return res.status(200).json({
      message: "Order item status updated",
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

const trackOrder = async(req,res,next) => {
  try {
    const buyerId = req.user.id;
    const {orderId} = req.params;
    const orderItem =await prisma.orderItem.findUnique({
      where:{id:parseInt(orderId)},
      include:{
        order:true , 
        product:{
          select:{
            name:true , image:true , id:true , category:true
          }
        }
      }
    })
    if(orderItem.order.buyerId == buyerId)
  return  res.status(200).json({message:"Success",orderItem})
else return res.status(404).json({message:'You are not authorized to track this order'})

  } catch (error) {
    next(error)
  }
} 



const getOrdersForVendor = async(req,res,next) => {
  try {
    const vendorId = req.user.id;
  const orderItems = await prisma.orderItem.findMany({
  where: {
    product: {
      vendorId: vendorId
    },
  },
  include: {
    order: {
      include: {
        buyer: {
          select: {
            name: true,
            email: true,
            id: true
          }
        },
      }
    },
    product: true
  },
  orderBy: {
    order: {
      createdAt: 'desc' // ✅ this sorts by product's creation time
    }
  }
});


    res.status(200).json({message:"Success",orderItems})
  } catch (error) {
    next(error)
  }
}

module.exports = {
    getOrder , getOrders , getOrdersForVendor , updateOrderItemStatus , trackOrder , buyerUpdates , vendorUpdates
}
