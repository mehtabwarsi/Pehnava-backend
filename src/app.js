import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express()

app.use(cors({
   // origin: process.env.CORS_ORIGIN,
   origin: true,
   credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())


// Routes
import { errorHandler } from './middleware/error.middleware.js'
import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import productRoutes from './routes/product.routes.js'
import categoryRoutes from './routes/category.routes.js'
import addressRoutes from './routes/address.routes.js'
import cartRoutes from './routes/cart.routes.js'
import checkoutRoutes from './routes/checkout.routes.js'
import orderRoutes from './routes/order.routes.js'
import catalogRoutes from './routes/catalog.routes.js'

// user routes
app.use('/api/v1/user', userRoutes)

// admin routes
app.use('/api/v1/admin', adminRoutes)

// product routes
app.use('/api/v1/product', productRoutes)

// category routes
app.use('/api/v1/category', categoryRoutes)

// address routes
app.use('/api/v1/address', addressRoutes)

// cart routes
app.use('/api/v1/cart', cartRoutes)

// checkout routes
app.use('/api/v1/checkout', checkoutRoutes)

// order routes
app.use('/api/v1/order', orderRoutes)

// catalog routes
app.use('/api/v1/catalog', catalogRoutes)

app.use(errorHandler)
export { app }