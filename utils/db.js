// utils/db.js or prisma/db.js

const { PrismaClient } = require('../generated/prisma'); // or '@prisma/client' if using default path

const prisma = new PrismaClient();

module.exports = prisma;
