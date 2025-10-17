const prisma = require('../../utils/db');
const cloudinary = require('../../utils/cloudinary');
const streamifier = require('streamifier');
const { validationResult } = require('express-validator');

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

const deleteImageFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

const extractPublicIdFromCloudinaryImage = (url) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1]; // e.g. "image12345.png"
  const publicIdWithExtension = filename.split('.')[0]; // e.g. "image12345"
  const folder = parts[parts.length - 2]; // e.g. "products"
  return `${folder}/${publicIdWithExtension}`; // e.g. "products/image12345"
};



const addProduct = async (req, res, next) => {
const errors = validationResult(req);
if(!errors.isEmpty()){
  return res.status(400).json({errors:errors.array()})
}
  try {
    console.log('req.body is:',req.body)
    const { name, description, price, stock, category, isUserDefinedCategory } = req.body;

    // ✅ Use vendorId from the authenticated token, not from the body
    const vendorId = req.user?.id;
    const role = req.user?.role;
    const categoryArray = category.split(',').map(cat => cat.trim());

    console.log('Parsed category array:', categoryArray);

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
    var imageUrl = '';
if(req.file.buffer){
  imageUrl = await uploadImageToCloudinary(req.file.buffer);
}
    if(isUserDefinedCategory != 'false'){
      categoryArray.map(async (cat) => {
        const isExists = await prisma.category.findFirst({
  where:{
    name:cat,
    vendorId:vendorId
  }
      })
      if(!isExists){ 
await prisma.category.create({
  data: {
    name: cat,
    vendorId: vendorId,
  },
});
      }
      })
    }
    console.log('Uploaded image URL:', imageUrl);


    // ✅ Create product in DB
    const product = await prisma.product.create({
      data: {
        name,
        description,
        image: imageUrl,
        price: parseFloat(price),
        stock: parseInt(stock),
        category:categoryArray,
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

const editProduct = async (req, res, next) => {
  try {
    const { name, description, price, stock, category = [] } = req.body;
    const { id } = req.params;

    const vendorId = req.user?.id;
    const role = req.user?.role;

    // ✅ Role check
    if (role !== 'vendor') {
      return res.status(403).json({ error: 'Only vendors can edit products' });
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

    // ✅ Check if product exists and belongs to the vendor
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingProduct || existingProduct.vendorId !== vendorId) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    // ✅ Handle optional image upload
    let imageUrl = existingProduct.image;

    if (req.file && req.file.buffer) {
      // Upload new image
      imageUrl = await uploadImageToCloudinary(req.file.buffer);

      // Delete old image from Cloudinary
      const publicId = extractPublicIdFromCloudinaryImage(existingProduct.image);
      if (publicId) {
        await deleteImageFromCloudinary(publicId);
      }
    }
    const categoryArray = Array.isArray(category) ? category : category.split(',').map(cat => cat.trim());

    // ✅ Update product in database
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        image: imageUrl,
        price: parseFloat(price),
        stock: parseInt(stock),
        category:categoryArray,
      },
    });

    return res.status(200).json({
      message: 'Product updated successfully',
      product: updatedProduct,
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
    if(!product) return res.status(404).json({error:"Product not found"})
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
      limit = 7,
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

const getProductByVendor = async(req,res,next) => {
  try {
    const vendorId = req.user.id
    const products = await prisma.product.findMany({
      where:{
        vendorId:parseInt(vendorId)
      },
      orderBy:{
        updatedAt:"desc"
      }
    })
    console.log('products from this vendor are:',products)
    res.status(200).json({products})
  } catch (error) {
    next(error)
  }
}

const deleteProduct = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: 'Please provide the Product ID' });
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) }
    });

    if (!product || product.vendorId !== vendorId) {
      return res.status(404).json({ error: 'Product not found or access denied' });
    }

    // 🛑 Check if this product is part of any order
    const relatedOrderItem = await prisma.orderItem.findFirst({
      where: { productId: parseInt(productId) },
    });

    if (relatedOrderItem) {
      return res.status(400).json({
        error: 'Cannot delete this product as it is part of an existing order.',
      });
    }

    // ✅ Safe to delete
    await prisma.product.delete({
      where: { id: parseInt(productId) },
    });

    res.status(200).json({ message: 'Success' });

  } catch (error) {
    next(error);
  }
};


module.exports = { addProduct , searchProduct , productDetails , editProduct ,  getRandomProducts , getProductByVendor , deleteProduct};
