// const { logger } = require("./logger");
const loggerServices = require('../middlewares/logger');


const errorMiddleware = (err, req, res, next) => {
  if (!err) return next();
  console.log("error is:", err);
  console.log("error message: ", err.message);
      loggerServices.error(err.stack || 'No stack trace available');

  res.status(500).json({ error: err.message || "Internal Server Error" });
};

module.exports = errorMiddleware;
