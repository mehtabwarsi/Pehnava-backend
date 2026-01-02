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
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static("public"))
app.use(cookieParser())

/* ==========================================================================
   Routes Import
   ========================================================================== */
import { errorHandler } from './middleware/error.middleware.js'
import userRoutes from './routes/user.routes.js'
import adminRoutes from './routes/admin.routes.js'
import productRoutes from './routes/product.routes.js'


/* ==========================================================================
                                       User Routes
   ========================================================================== */
app.use('/api/v1/user', userRoutes)

/* ==========================================================================
                                       Admin Routes
   ========================================================================== */
app.use('/api/v1/admin', adminRoutes)



/* ==========================================================================
                                       Product Routes
   ========================================================================== */
app.use('/api/v1/product', productRoutes)
app.use('/api/v1/product/get-all-products', productRoutes)
/* ==========================================================================
                                       Error Handling
   ========================================================================== */
app.use(errorHandler)
export { app }