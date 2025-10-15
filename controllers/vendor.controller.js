const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const {  validationResult } = require('express-validator');


const getVendor = async(req,res,next) => {
  try {
    const vendorId = req.user.id;
    const vendor = await prisma.vendor.findUnique({
      where:{id:parseInt(vendorId)},
      select:{id:true , email:true , name:true}
    })
    console.log('vendor  is:',vendor )
    res.status(200).json({vendor})
  } catch (error) {
    next(error)
  }
}
const getSalesSummary = async (req, res, next) => {
  try {
    const vendorId = req.user.id;

    // Fetch all OrderItems that belong to this vendor's products
    const orderItems = await prisma.orderItem.findMany({
      where: {
        product: {
          vendorId: vendorId,
        },
        order: {
          status: 'paid', // only consider paid orders
        },
      },
      include: {
        product: true,
        order: true,
      },
    });

    // Initialize summary variables
    let totalRevenue = 0;
    let totalOrders = new Set();
    let totalUnitsSold = 0;
    const productSalesMap = {};

    for (const item of orderItems) {
      totalRevenue += item.price * item.quantity;
      totalUnitsSold += item.quantity;
      totalOrders.add(item.orderId);

      const productId = item.productId;
      const productName = item.product.name;
      if (!productSalesMap[productId]) {
        productSalesMap[productId] = {
          name: productName,
          quantitySold: 0,
          revenue: 0,
        };
      }
      productSalesMap[productId].quantitySold += item.quantity;
      productSalesMap[productId].revenue += item.price * item.quantity;
    }

    // Optional: Get most sold product
    const mostSoldProduct = Object.entries(productSalesMap)
      .sort((a, b) => b[1].quantitySold - a[1].quantitySold)[0]?.[1] || null;

    res.status(200).json({
      success: true,
      summary: {
        totalOrders: totalOrders.size,
        totalRevenue,
        totalUnitsSold,
        mostSoldProduct,
        productBreakdown: productSalesMap, // useful for charting
      },
    });

  } catch (error) {
    next(error);
  }
};


const registerVendor = async (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, companyName, phone } = req.body;
    if(!name){
        throw new Error('Name is required')
    }
    if(!email){
    throw new Error('Email is required')
    }
    if(!password){
        throw new Error('Password is required')
    }
    if(!companyName){
        throw new Error('Company Name is required');
    }

    
  try {
    // 1. Check if vendor already exists
    const existingVendor = await prisma.vendor.findUnique({ where: { email } });
    if (existingVendor) {
      return res.status(409).json({ error: 'Vendor already exists' });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        companyName,
        phone,
      },
    });

    res.status(201).json({
      message: 'Vendor registered successfully',
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        companyName: vendor.companyName,
        phone: vendor.phone,
      },
    });
  } catch (e) {
    next(e);
  }
};


const loginVendor = async(req,res,next)=>{
   const errors = validationResult(req);
      console.log('errors are:',errors)
      if(!errors.isEmpty())
      {
        return res.status(400).json({errors:errors.array()})
      }
    try{
     
        const {email,password} = req.body;
        if(!email || !password){
            return res.json('Email and password are required')
        }
        const vendor = await prisma.vendor.findUnique({where:{email}})
        if(vendor == null) 
      return res.status(404).json({ error: 'Invalid credentials' });
const isMatch = await bcrypt.compare(password , vendor.password);
if(!isMatch) 
      return res.status(401).json({ error: 'Invalid credentials' });
const token = jwt.sign({
    role:"vendor",
    id:vendor.id
} , process.env.JWT_SECRET,
      { expiresIn: '7d' } 
)
return res.json({
      message: 'Login successful',
      vendor: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
      },
      token,
    });
    }catch(e){
            next(e)
    }
}

module.exports = { registerVendor , loginVendor , getVendor , getSalesSummary};
