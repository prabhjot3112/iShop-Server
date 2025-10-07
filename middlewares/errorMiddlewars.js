const errorMiddleware = (err, req, res, next) => {
  if (!err) return next();
  console.log('error is:',err)
  res.status(500).json({ error: err.message || 'Internal Server Error' });
};

module.exports = errorMiddleware;
