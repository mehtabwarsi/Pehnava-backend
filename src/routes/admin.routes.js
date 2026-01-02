import Router from "express";

import { adminLogin, createAdmin, createSuperAdmin } from "../controllers/admin.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

router.route("/login").post(adminLogin);
router.route("/create-admin").post(createAdmin);

// ⚠️ ONE TIME USE API
router.post("/create-super-admin", createSuperAdmin);

export default router;