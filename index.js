const express = require("express");
const app = express();
const main = require("./utils/db");
const cors = require("cors");
app.use(express.json());
const errorMiddleware = require("./middlewares/errorMiddlewars");
const { morganMiddleware } = require("./middlewares/logger");
app.use(morganMiddleware);
const buyerRoutes = require("./routes/buyer.route");
const vendorRoute = require("./routes/vendor.route");
const productRoute = require("./routes/product/products.route");
const cartRoute = require("./routes/cart.route");
const paymentRoute = require("./routes/payment.route");
const orderRoute = require("./routes/order.route");
const notificationRoute = require("./routes/notification.route");
const path = require('path')
const allowedOrigins = [
  "https://i-shop31.vercel.app", // ✅ Vercel live frontend URL
  "http://localhost:5173", // ✅ Local dev (optional)
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.status(200).render("index");
});

app.get('/logs/:day/:month/:year/:type' , (req,res) => {
  res.sendFile(path.join(__dirname , `/logs/${req.params.year}-${req.params.month}-${req.params.day}-${req.params.type == 'combined' ? 'combined' : 'error'}.log`))
})

// app.get('/logs/combined',(req,res) => {
//   res.sendFile(path.join(__dirname , '/logs/combined.log'))
// })
// app.get('/logs/error',(req,res) => {
//   res.sendFile(path.join(__dirname , '/logs/error.log'))
// })
app.use("/api/buyer", buyerRoutes);
app.use("/api/vendor", vendorRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/orders", orderRoute);
app.use("/api/notifications", notificationRoute);
app.use(
  "/api/product/categories",
  require("./routes/product/product.category.route")
);
app.use(errorMiddleware);

app.post("/ps/reset", async (req, res, next) => {
  try {
    const { vendorId, newPassword } = req.body;
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await main.vendor.update({
      where: { id: parseInt(vendorId) },
      data: { password: hashedPassword },
    });
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

module.exports = app;
