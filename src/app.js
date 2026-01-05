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

// user routes
app.use('/api/v1/user', userRoutes)

// admin routes
app.use('/api/v1/admin', adminRoutes)

// product routes
app.use('/api/v1/product', productRoutes)

// category routes
app.use('/api/v1/category', categoryRoutes)






app.use(errorHandler)
export { app }