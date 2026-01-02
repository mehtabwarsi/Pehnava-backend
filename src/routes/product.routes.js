import Router from "express";
import { createProduct, getAllProduct } from "../controllers/product.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

// ONLY ADMIN & SUPER ADMIN
router.route("/create").post(adminAuth(["admin", "super_admin"]), createProduct);
router.route("/get-all-products").get(getAllProduct);


export default router;
