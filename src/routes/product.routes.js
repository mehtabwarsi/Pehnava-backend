import Router from "express";
import {
    createProduct,
    getAllProduct,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/product.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

// ONLY ADMIN & SUPER ADMIN
router.route("/create").post(adminAuth(["admin", "super_admin"]), createProduct);
router.route("/get-all-products").get(getAllProduct);
router.route("/:id").get(getProductById);
router.route("/:id").patch(adminAuth(["admin", "super_admin"]), updateProduct);
router.route("/:id").delete(adminAuth(["admin", "super_admin"]), deleteProduct);


export default router;
