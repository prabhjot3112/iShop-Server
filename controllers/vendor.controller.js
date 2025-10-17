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
    let { startDate, endDate, category, sortBy } = req.query;
    sortBy = sortBy || 'unitsSold';

    // Parse category filter as array or null
    category = category ? category.split(',') : null;
    if (category && category.includes('All')) {
      category = null;
    }

    // Prepare query params and conditions
    const params = [vendorId];
    let paramIndex = 2;
    let dateConditions = '';
    if (startDate) {
      dateConditions += ` AND o."createdAt" >= $${paramIndex++} `;
      params.push(new Date(startDate));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateConditions += ` AND o."createdAt" <= $${paramIndex++} `;
      params.push(end);
    }

    let categoryCondition = '';
    if (category) {
      categoryCondition = ` AND p.category && $${paramIndex++} `;
      params.push(category);
    }

    // Determine ORDER BY clause
    let orderByClause = '';
    if (sortBy === 'unitsSold') {
      orderByClause = 'ORDER BY "quantitySold" DESC';
    } else if (sortBy === 'revenue') {
      orderByClause = 'ORDER BY "revenue" DESC';
    } else if (sortBy === 'recent') {
      orderByClause = 'ORDER BY "latestOrderDate" DESC';
    }

    // Final SQL query
    const sql = `
      SELECT
        oi."productId",
        p.name,
        SUM(oi.quantity) AS "quantitySold",
        SUM(oi.price) AS "revenue",
        COUNT(oi."orderId") AS "orderCount",
        MAX(o."createdAt") AS "latestOrderDate"
      FROM "OrderItem" oi
      JOIN "Order" o ON oi."orderId" = o.id
      JOIN "Product" p ON oi."productId" = p.id
      WHERE
        o.status = 'paid'
        AND p."vendorId" = $1
        ${dateConditions}
        ${categoryCondition}
      GROUP BY oi."productId", p.name
      ${orderByClause}
      LIMIT 100
    `;

    // Execute raw query with parameters
    const results = await prisma.$queryRawUnsafe(sql, ...params);
// Convert BigInt fields to Number
const normalizedResults = results.map(r => ({
  productId: r.productId,
  name: r.name,
  quantitySold: Number(r.quantitySold),
  revenue: Number(r.revenue),
  orderCount: Number(r.orderCount),
  latestOrderDate: r.latestOrderDate, // keep as Date or string
}));

const totalRevenue = normalizedResults.reduce((sum, r) => sum + r.revenue, 0);
const totalUnitsSold = normalizedResults.reduce((sum, r) => sum + r.quantitySold, 0);
const totalOrders = normalizedResults.reduce((sum, r) => sum + r.orderCount, 0);

const mostSoldProduct =
  normalizedResults.length > 0
    ? normalizedResults.reduce((max, p) => (p.quantitySold > max.quantitySold ? p : max), normalizedResults[0])
    : null;

res.json({
  success: true,
  summary: {
    totalOrders,
    totalRevenue,
    totalUnitsSold,
    mostSoldProduct,
    productBreakdown: normalizedResults,
  },
});

  } catch (err) {
    next(err);
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
        console.log('vendor is:',vendor)
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
