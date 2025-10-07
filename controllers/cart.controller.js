const prisma = require('../utils/db');

/**
 * Add product to cart or increase quantity if already exists
 */

const getCartProducts = async (req, res) => {
  const buyerId = req.user.id;

  if (!buyerId) {
    return res.status(400).json({ message: 'Missing buyerId' });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { buyerId },
      include: {
        items: {
          include: {
            product: true, // Join with product table
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ products: [], totalItems: 0 });
    }

    const products = cart.items.map((item) => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      // include other product fields as needed
    }));

    return res.status(200).json({
      products,
      totalItems: products.length,
    });
  } catch (err) {
    console.error('Error fetching cart products:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



const isProductInCart = async (req, res) => {
  const buyerId = req.user.id;
  const { productId } = req.params;

  if (!buyerId || !productId) {
    return res.status(400).json({ message: 'Missing buyerId or productId' });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { buyerId: Number(buyerId) },
      include: { items: true }, // 👈 get all cart items
    });

   

    if (!cart) {
      return res.status(200).json({ inCart: false, totalItems: 0 });
    }

    const cartItem = cart.items.find(
      (item) => item.productId === Number(productId)
    );

    return res.status(200).json({
       inCart: !!cartItem && cartItem.quantity > 0,
  quantity: cartItem?.quantity || 0,
  totalItems: cart.items.length,
    });
  } catch (err) {
    console.error('Error checking cart:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

 

const addToCart = async (req, res) => {
    const buyerId = req.user.id
  const { productId, quantity } = req.body;

  if (!buyerId || !productId || !quantity) {
    return res.status(400).json({ message: 'Missing buyerId, productId, or quantity' });
  }

  try {
    // Check if cart exists for the buyer
    let cart = await prisma.cart.findUnique({
      where: { buyerId :Number(buyerId) },
    });

    // If no cart, create one
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          buyer: { connect: { id: buyerId } },
        },
      });
    }

    // Check if product already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId:Number(productId),
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId:Number(productId),
          },
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
      return res.status(200).json(updatedItem);
    } else {
      // Add new item
      const newItem = await prisma.cartItem.create({
        data: {
          cart: { connect: { id: cart.id } },
          product: { connect: { id: Number(productId) } },
          quantity,
        },
      });
      return res.status(201).json(newItem);
    }
  } catch (err) {
    console.error('Error adding to cart:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update quantity of a product in cart
 */
const updateCartItem = async (req, res) => {
  const buyerId = req.user.id;
  const { productId, quantity } = req.params;

  if (!buyerId || !productId || quantity == null) {
    return res.status(400).json({ message: 'Missing buyerId, productId, or quantity' });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { buyerId: Number(buyerId) },
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    if (Number(quantity) === 0) {
      // If quantity is 0, remove the item from the cart
      await prisma.cartItem.delete({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: Number(productId),
          },
        },
      });

      return res.status(200).json({ message: 'Item removed from cart because quantity was 0' });
    }

    // Else, update quantity
    const updatedItem = await prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: Number(productId),
        },
      },
      data: {
        quantity: Number(quantity),
      },
    });

    return res.status(200).json({updateCartItem , message:'Cart Updated Successfully'});
  } catch (err) {
    console.error('Error updating cart item:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * Remove a product from cart
 */
const removeFromCart = async (req, res) => {
    const buyerId = req.user.id
  const { productId } = req.params;

  if (!buyerId || !productId) {
    return res.status(400).json({ message: 'Missing buyerId or productId' });
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { buyerId },
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId:Number(productId),
        },
      },
    });

    return res.status(200).json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Error removing from cart:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


/**
 * Get all cart items for a buyer
 */
const getCartItems = async (req, res) => {
  const buyerId  = req.user.id;
  console.log('re.user is:' ,req.user)
console.log('buyer id:' , buyerId)
  if (!buyerId) {
    return res.status(400).json({ message: 'Missing buyerId' });
  }

  try {
    // Find the buyer's cart
    const cart = await prisma.cart.findUnique({
      where: {
        buyerId: Number(buyerId),
      },
      include: {
        items: {
          include: {
            product: true, // Include product details
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ items: [] });
    }
    console.log('cart is:',cart)

    return res.status(200).json({ items: cart.items });
  } catch (err) {
    console.error('Error fetching cart items:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


module.exports = {
    addToCart , removeFromCart , updateCartItem , getCartItems , isProductInCart , getCartProducts
}