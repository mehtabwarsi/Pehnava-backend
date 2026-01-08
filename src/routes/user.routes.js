import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { login, getUserProfile, getTotalUsers, toggleWishlist, getWishlist, removeFromWishlist } from "../controllers/user.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

// private routes
router.route('/login').get(authMiddleware, login)
router.route('/profile').get(authMiddleware, getUserProfile)
router.route('/wishlist/toggle').post(authMiddleware, toggleWishlist)
router.route('/wishlist').get(authMiddleware, getWishlist)
router.route('/wishlist/remove/:productId').post(authMiddleware, removeFromWishlist)
router.route('/total-users').get(adminAuth(["admin", "super_admin"]), getTotalUsers)

export default router
