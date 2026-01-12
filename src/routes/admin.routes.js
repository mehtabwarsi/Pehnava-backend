import Router from "express";

import { adminLogin, createAdmin, createSuperAdmin } from "../controllers/admin.controllers.js";
import { getAllOrders, getOrderById, updateOrderStatus } from "../controllers/admin/order.controller.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

router.route("/login").post(adminLogin);
router.route("/create-admin").post(createAdmin);

// ⚠️ ONE TIME USE API
router.post("/create-super-admin", createSuperAdmin);


// admin order api
router.route("/orders").get(adminAuth(["admin", "super_admin"]), getAllOrders);
router.route("/order/:id").get(adminAuth(["admin", "super_admin"]), getOrderById);
router.patch("/orders/:id/status", adminAuth(["admin", "super_admin"]), updateOrderStatus);



export default router;