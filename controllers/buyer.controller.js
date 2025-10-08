const prisma = require('../utils/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
// GET -/:id
const getBuyer = async(req,res,next) => {
  try {
    const buyerId = req.user.id;
    const buyer = await prisma.buyer.findUnique({
      where:{id:parseInt(buyerId)},
      select:{id:true , email:true , name:true}
    })
    console.log('buyer is:',buyer)
    res.status(200).json({buyer})
  } catch (error) {
    next(error)
  }
}
// POST - /register
const register = async(req,res,next)=>{
    const {name,email , password} = req.body;
    try{
    if(!name){
        throw new Error('Name is required')
    } if(!email){
        throw new Error('Email is required')
    } if(!password){
        throw new Error('Password is required')
    }
    const isExists = await prisma.buyer.findUnique({where:{email}})
    console.log('isExists:',isExists)
    if (isExists) {
  return res.status(400).json({ error: 'User already exists' });
}
    const hashedPass = await bcrypt.hash(password , 10);
    const user = await prisma.buyer.create({
data:{
    name,email,password:hashedPass
}})
    res.status(201).json({'message':'User registered successfully' , user:{
        id:user.id,
        name:user.name , email:user.email
    }})

    }catch(e){
       next(e);
    }
}

// POST - /login
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.buyer.findUnique({ where: { email } });

    // If no user found
    if (!user) {
      return res.status(404).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      {
        role: 'buyer',
        id: user.id,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } 
    );

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (e) {
    next(e);
  }
};


module.exports = {
    register,
    login , getBuyer
}

