import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { login, getUserProfile } from "../controllers/user.controllers.js";

const router = Router();

// private routes
router.route('/login').get(authMiddleware, login)
router.route('/profile').get(authMiddleware, getUserProfile)

export default router
