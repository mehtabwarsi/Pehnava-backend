import Router from "express";
import {
    addAddress,
    deleteAddress,
    getAddresses,
    setDefaultAddress,
    updateAddress
} from "../controllers/address.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/addAddress", authMiddleware, addAddress);
router.get("/getAddresses", authMiddleware, getAddresses);
router.put("/updateAddress/:addressId", authMiddleware, updateAddress);
router.delete("/deleteAddress/:addressId", authMiddleware, deleteAddress);
router.put("/setDefaultAddress/:addressId", authMiddleware, setDefaultAddress);

export default router;
