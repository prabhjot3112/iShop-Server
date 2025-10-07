const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const registerVendor = async (req, res, next) => {
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

module.exports = { registerVendor , loginVendor};
