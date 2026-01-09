import Router from "express";
import authMiddleware from "../middleware/auth.middleware.js";

import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
} from "../controllers/cart.controller.js";

const router = Router();

router.post("/add-to-cart", authMiddleware, addToCart);
router.get("/get-cart", authMiddleware, getCart);
router.put("/update-cart-quantity", authMiddleware, updateCartQuantity);
router.delete("/remove-from-cart/:productId", authMiddleware, removeFromCart);
// call after the order is placed
router.delete("/clear-cart", authMiddleware, clearCart);

export default router;
