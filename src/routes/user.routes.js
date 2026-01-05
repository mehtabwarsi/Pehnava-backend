import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { login, getUserProfile, getTotalUsers } from "../controllers/user.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

// private routes
router.route('/login').get(authMiddleware, login)
router.route('/profile').get(authMiddleware, getUserProfile)
router.route('/total-users').get(adminAuth(["admin", "super_admin"]), getTotalUsers)

export default router
