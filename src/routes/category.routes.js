import { getSubCategoriesByCategory } from "../controllers/subCategory.controllers.js";
import { getAllCategories } from "../controllers/category.controllers.js";
import { Router } from "express";


const router = Router();

router.route("/").get(getAllCategories);
router.route("/subcategory").get(getSubCategoriesByCategory);

export default router;
