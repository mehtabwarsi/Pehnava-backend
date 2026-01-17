import { Router } from "express";
import { checkoutSummary } from "../controllers/checkout.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/summary", authMiddleware, checkoutSummary);

export default router;
