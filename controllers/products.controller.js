const prisma = require('../utils/db');
const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');

// Helper function to upload image to Cloudinary using a stream
const uploadImageToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'products' },
      (error, result) => {
        if (error) return reject(error);
        console.log('secure_url',result.secure_url)
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const addProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category } = req.body;

    // ✅ Use vendorId from the authenticated token, not from the body
    const vendorId = req.user?.id;
    const role = req.user?.role;

    // ✅ Role check
    if (role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can add products' });
    }

    // ✅ Validate required fields
    if (!name || !price || !stock) {
      return res.status(400).json({ error: 'Missing required fields (name, price, stock)' });
    }

    // ✅ Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // ✅ Handle image upload
    if (!req.file) {
      return res.status(400).json({ error: 'Product image is required' });
    }

    const imageUrl = await uploadImageToCloudinary(req.file.buffer);

    // ✅ Create product in DB
    const product = await prisma.product.create({
      data: {
        name,
        description,
        image: imageUrl,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        vendorId,
      },
    });

    return res.status(201).json({
      message: 'Product added successfully',
      product,
    });

  } catch (err) {
    next(err);
  }
};

 const getRandomProducts = async (req, res) => {
  const limit = 10;

  try {
    const products = await prisma.$queryRaw`
      SELECT * FROM "Product"
      ORDER BY RANDOM()
      LIMIT ${limit}
    `;

    return res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching random products:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const productDetails = async(req,res,next) =>{
  try {
    const {id} = req.params;
    console.log('id is:',id)
    const product = await prisma.product.findUnique({
      where:{
        id:Number(id)
      }
    });
    const vendor = await prisma.vendor.findUnique({
      where:{
        id:Number(product.vendorId)
      },
      select:{name:true , companyName:true , id:true}
    })
    console.log(product)
    console.log('vendor of product is:' , vendor)
    res.send({product , vendor})
  } catch (error) {

console.log('error is:',error);
next(error)    
  }
}


const searchProduct = async (req, res, next) => {
  try {
    const { query } = req.params;  // search term (optional)
    const {
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort,
    } = req.query;

    const filters = {
      AND: [],
    };

    // Search in name or description (case-insensitive)
    if (query) {
      filters.AND.push({
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      });
    }

    // Category filter
    if (category) {
      filters.AND.push({ category: category });
    }

    // Price range filters
    if (minPrice) {
      filters.AND.push({ price: { gte: parseFloat(minPrice) } });
    }
    if (maxPrice) {
      filters.AND.push({ price: { lte: parseFloat(maxPrice) } });
    }

    // Calculate pagination offsets
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    // Sorting
    let orderBy = {};
    if (sort) {
      if (sort === 'price_asc') orderBy = { price: 'asc' };
      else if (sort === 'price_desc') orderBy = { price: 'desc' };
      else if (sort === 'createdAt_asc') orderBy = { createdAt: 'asc' };
      else if (sort === 'createdAt_desc') orderBy = { createdAt: 'desc' };
    }

    // Fetch total count for pagination meta
    const total = await prisma.product.count({
      where: filters.AND.length ? { AND: filters.AND } : {},
    });

    // Fetch products with filters, pagination, and sorting
    const products = await prisma.product.findMany({
      where: filters.AND.length ? { AND: filters.AND } : {},
      skip,
      take: pageSize,
      orderBy,
   select: {
  name: true,
  image: true,
  price: true,
  category: true,
  id:true
}
  });

    res.json({
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      products,
    });

  } catch (e) {
    next(e);
  }
};



module.exports = { addProduct , searchProduct , productDetails , getRandomProducts};
