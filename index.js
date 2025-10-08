const express = require('express')
const app = express()
const main = require('./utils/db')
const cors = require('cors')
app.use(express.json())
const errorMiddleware = require('./middlewares/errorMiddlewars')
const buyerRoutes = require('./routes/buyer.route')
const vendorRoute = require('./routes/vendor.route')
const productRoute = require('./routes/products.route')
const cartRoute = require('./routes/cart.route')
const paymentRoute = require('./routes/payment.route')
const orderRoute = require('./routes/order.route')


const allowedOrigins = [
  'https://i-shop31.vercel.app', // ✅ Vercel live frontend URL
  'http://localhost:5173'             // ✅ Local dev (optional)
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true, 
}));


app.use('/api/buyer',buyerRoutes)
app.use('/api/vendor',vendorRoute)
app.use('/api/products',productRoute)
app.use('/api/cart',cartRoute)
app.use('/api/payment',paymentRoute)
app.use('/api/orders',orderRoute)
app.use(errorMiddleware)

app.listen(3001,() =>{
    console.log('Server is running on port 3001')
})

module.exports = app