import Router from "express";

import { adminLogin, createSuperAdmin } from "../controllers/admin.controllers.js";
import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

router.route("/login").post(adminAuth(["super_admin", "admin"]), adminLogin);

// ⚠️ ONE TIME USE API
router.post("/create-super-admin", createSuperAdmin);

export default router;