import { Router } from "express";
import { createOrder, getMyOrders, getOrderById, cancelOrderByUser } from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.route("/place-order").post(authMiddleware, createOrder);
router.route("/my-orders").get(authMiddleware, getMyOrders);
router.route("/:orderId").get(authMiddleware, getOrderById);
router.route("/:orderId/cancel").patch(authMiddleware, cancelOrderByUser);

export default router;
