const prisma = require('../../utils/db');

const fetchCategories = async (req, res , next) => {
  try {
    const predefinedProductCategory = await prisma.PredefinedProductCategory.findMany();
    const categories = await prisma.category.findMany({
      where: { vendorId: req.user.id },
    });
    res.json([...categories, ...predefinedProductCategory]);
  } catch (error) {
    console.error('Error fetching categories:', error);
    next(error)
  }
};

const searchProductByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const searchTerm = `%${category.toLowerCase()}%`; // partial match

    const products = await prisma.$queryRaw`
      SELECT *
      FROM "Product"
      WHERE EXISTS (
        SELECT 1
        FROM unnest("category") AS cat
        WHERE LOWER(cat) LIKE ${searchTerm}
      )
    `;

    res.status(200).json({ products });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};



const getProductCategoriesForAll = async(req,res,next) => {
  try {
    const categories = await prisma.predefinedProductCategory.findMany()
    console.log(categories);
    res.status(200).json({categories})
  } catch (error) {
    next(error)
  }
}
module.exports = { fetchCategories , getProductCategoriesForAll, searchProductByCategory };