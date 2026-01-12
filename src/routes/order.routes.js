import { Router } from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrder } from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/place-order", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:orderId", authMiddleware, getOrderById);
router.put("/:orderId/cancel", authMiddleware, cancelOrder);

export default router;
