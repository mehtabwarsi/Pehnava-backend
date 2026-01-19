import { Router } from "express";
import {
    createCollection,
    deleteCollection,
    getCollections,
    updateCollection,
    getCollectionBySlug,
    getCollectionProducts
} from "../controllers/collection.controller.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

// Public routes
router.route("/").get(getCollections);
router.route("/s/:slug").get(getCollectionBySlug);
router.route("/s/:slug/products").get(getCollectionProducts);

// Admin routes
router.use(adminAuth()); // Apply admin check to all subsequent routes

router.route("/")
    .post(upload.single("image"), createCollection);

router.route("/:id")
    .put(upload.single("image"), updateCollection)
    .delete(deleteCollection);

export default router;
