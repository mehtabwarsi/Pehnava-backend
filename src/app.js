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


/* ==========================================================================
                                       User Routes
   ========================================================================== */
app.use('/api/v1/user', userRoutes)

/* ==========================================================================
                                       Admin Routes
   ========================================================================== */
app.use('/api/v1/admin', adminRoutes)


/* ==========================================================================
                                       Error Handling
   ========================================================================== */
app.use(errorHandler)
export { app }