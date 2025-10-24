const { logger } = require("./logger");

const errorMiddleware = (err, req, res, next) => {
  if (!err) return next();
  console.log("error is:", err);
  console.log("error message: ", err.message);
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    body: req.body ? { ...req.body, password: "***" } : undefined, // mask sensitive fields
  });
  res.status(500).json({ error: err.message || "Internal Server Error" });
};

module.exports = errorMiddleware;
