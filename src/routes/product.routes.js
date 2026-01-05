import Router from "express";
import {
    createProduct,
    getAllProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    updateVariantStock,
    addVariant,
    updateProductImages,
    removeProductImage
} from "../controllers/product.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// ONLY ADMIN & SUPER ADMIN
router.route("/create").post(adminAuth(["admin", "super_admin"]), upload.array("images", 5), createProduct);
router.route("/get-all-products").get(getAllProduct);
router.route("/:id").get(getProductById);
router.route("/:id").patch(adminAuth(["admin", "super_admin"]), updateProduct);
router.route("/:id").delete(adminAuth(["admin", "super_admin"]), deleteProduct);
router.route("/:id/update-variant-stock").patch(adminAuth(["admin", "super_admin"]), updateVariantStock);
router.route("/:id/add-variant").post(adminAuth(["admin", "super_admin"]), addVariant);
router.route("/:id/update-product-images").patch(adminAuth(["admin", "super_admin"]), upload.array("images", 5), updateProductImages);
router.route("/:id/remove-product-image").patch(adminAuth(["admin", "super_admin"]), removeProductImage);


export default router;
