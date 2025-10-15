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
module.exports = { fetchCategories };