const jwt = require('jsonwebtoken');

const vendorProtected = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'vendor') {
      return res.status(403).json({ error: 'Forbidden: Not a vendor' });
    }

    // Attach user data to req object
    req.user = decoded;
    req.body.role = 'vendor'

    next(); // ✅ allow the request to continue
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};


const buyerProtected = async(req,res,next) =>{
  const token = req.headers.authorization?.split(' ')[1]; // Bearer token

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'buyer') {
      return res.status(403).json({ error: 'Forbidden: Not a Buyer' });
    }

    // Attach user data to req object
    req.user = decoded;
    req.role = 'buyer'

    next(); // ✅ allow the request to continue
  } catch (err) {
    console.log('error is:',err)
    return res.status(401).json({ error: err.message});
  }
}
module.exports = {vendorProtected , buyerProtected};
