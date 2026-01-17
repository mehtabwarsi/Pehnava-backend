// admin.catalog.routes.js
import { Router } from "express";
import {
    createCatalog,
    deleteCatalog,
    getAllCatalogsAdmin,
    updateCatalog,
    getActiveCatalogs
} from "../controllers/admin/catalog.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Public Routes
router.route("/homepage-catalogs").get(getActiveCatalogs);

// Admin Routes
router.route("/createCatalog").post(
    adminAuth(["admin", "super_admin"]),
    upload.single("image"),
    createCatalog
);
router.route("/getAllCatalogsAdmin").get(getAllCatalogsAdmin);

router.route("/updateCatalog/:id").put(
    adminAuth(["admin", "super_admin"]),
    upload.single("image"),
    updateCatalog
);
router.route("/deleteCatalog/:id").delete(adminAuth(["admin", "super_admin"]), deleteCatalog);
export default router;